import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { DONNA_MODELS } from '@/lib/donna-constants';
import { createInquiry } from '@/lib/inquiry';
import {
  completeBridgeOnIntake,
  appendTurn,
  updateChatPhase,
  incrementAgentTurnCount,
  mergeExtractedEntities,
  getBridgeChatState,
} from '@/lib/bridge';
import anthropic from '@/lib/anthropic';
import { buildContextBundle, buildAntiHallucinationGuardrail, phaseToAgentLabel, type ContextBundle } from '@/lib/donna-context';

// ─────────────────────────────────────────────────────────────────────────────
// Donna 4-Agent Orchestrator — Context-Aware, Server-Authoritative Phase
//
// Phase is NEVER trusted from the client. It is always loaded from DonnaBridge.chatPhase.
// This prevents clients from skipping intake steps.
//
// Flow:  start → name_phone → email_opt → q1 → q2 → q3 → q4 → q5 → done
//        Agent:  ────────── A ──────────────── → B ──── → ── C ── → D
// ─────────────────────────────────────────────────────────────────────────────

type ChatPhase =
  | 'start'
  | 'name_phone'
  | 'email_opt'
  | 'q1'
  | 'q2'
  | 'q3'
  | 'q4'
  | 'q5'
  | 'done';

// ── Claude call helper ──────────────────────────────────────────────────────

async function callClaude(
  systemPrompt: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  userMessage: string,
  maxTokens = 600
): Promise<string> {
  const messages = [
    ...conversationHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  try {
    const response = await anthropic.messages.create({
      model: DONNA_MODELS.INTAKE,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    });
    const block = response.content[0];
    if (block.type === 'text') return block.text;
    return '';
  } catch (err: any) {
    console.error('[callClaude] Anthropic error:', err?.status, err?.message, err?.error);
    throw err;
  }
}

// ── Intent classifier (keyword-based, no LLM call) ─────────────────────────
// Returns the user's intent category to decide whether to advance the phase.

type UserIntent = 'direct_answer' | 'question' | 'correction' | 'off_topic';

function classifyIntent(input: string, currentPhase: ChatPhase): UserIntent {
  const t = input.toLowerCase().trim();

  // Gibberish: mostly non-alphanumeric, very short, or repeated chars
  if (/^[^a-zA-ZÀ-ɏ0-9\s]{4,}$/.test(t) || /^(.)\1{5,}$/.test(t)) {
    return 'off_topic';
  }

  // Correction signals — used for Anti-Hallucination pivot
  if (/\b(takde|tidak ada|bukan|salah|tiada|mana ada|tak betul|wrong|incorrect|bukan kes|bukan jenis)\b/.test(t)) {
    return 'correction';
  }

  // Question signals — answer from KB, then re-ask current question
  // But NOT in start/name_phone/email_opt — those need direct answers, not KB lookups
  if (
    !['start', 'name_phone', 'email_opt'].includes(currentPhase) &&
    (/\?$/.test(t) || /^(kenapa|mengapa|apa|bagaimana|bila|macam mana|boleh terang|why|what|how|when|can you explain)\b/.test(t))
  ) {
    return 'question';
  }

  return 'direct_answer';
}

// ── Base context builder — injected into every agent's system prompt ─────────

function buildBaseContext(ctx: ContextBundle): string {
  const personalityGuide = {
    PROFESSIONAL: 'You are professional, polite, and concise.',
    SOFT: 'You are warm, empathetic, and gentle in tone.',
    STRICT: 'You are direct, no-nonsense, and efficient.',
  }[ctx.personality] ?? 'You are professional, polite, and concise.';

  let prompt = `You are Donna, pembantu peribadi AI Peguam ${ctx.lawyerName}.
${personalityGuide}
You speak primarily in Malay (Bahasa Melayu), but if the client replies in English, respond in English. NEVER mix languages in a single message (no Rojak).
You must NEVER give legal advice. You are an intake assistant only — collect information and guide the client.
Always address the client as "awak" (not "anda" which is too formal).

IMPORTANT RULES:
- If the client sends gibberish, nonsense, or random characters, gently ask them to clarify.
- If the client expresses uncertainty ("tak pasti", "tak tahu", "not sure"), be empathetic and guide with simpler questions.
- If the client asks a question about the lawyer's services, answer it briefly using the context below, then return to the current intake task.
- Keep responses concise — 2-4 sentences max unless listing items.
- Never fabricate information about the lawyer or firm.

=== {DIGITAL CARD} ===
Lawyer: ${ctx.lawyerName}${ctx.position ? `, ${ctx.position}` : ''}
Firm: ${ctx.firmName}
Status: ${ctx.lawyerStatus}${ctx.practiceAreas.length > 0 ? `\nPractice Areas: ${ctx.practiceAreas.join(', ')}` : ''}`;

  if (ctx.soalanAsal) {
    prompt += `\n\n=== {SOALAN ASAL} — Original FB Question (Source of Truth — anchor all responses to this) ===\n${ctx.soalanAsal}`;
  }

  if (ctx.jawapanPeguam) {
    prompt += `\n\n=== {JAWAPAN PEGUAM} — Lawyer's Initial Advice (context only, do NOT repeat verbatim to client) ===\n${ctx.jawapanPeguam}`;
  }

  if (ctx.kbContext) {
    prompt += `\n\n=== {DONNA AI CONFIG} — Lawyer's Knowledge Base ===\n${ctx.kbContext}`;
  }

  if (ctx.deflectPatterns.length > 0) {
    prompt += `\n\nDeflect if client mentions: ${ctx.deflectPatterns.join(', ')}`;
  }

  const svcParts: string[] = [];
  if (ctx.waktuOperasi) svcParts.push(`Operating hours: ${ctx.waktuOperasi}`);
  if (ctx.modKonsultasi) svcParts.push(`Consultation mode: ${ctx.modKonsultasi}`);
  if (ctx.yuranKonsultasi) svcParts.push(`Consultation fee: RM${ctx.yuranKonsultasi}`);
  if (ctx.yuranKecemasan) svcParts.push(`Emergency fee: RM${ctx.yuranKecemasan}`);
  if (ctx.yuranVideoMeeting) svcParts.push(`Video meeting fee: RM${ctx.yuranVideoMeeting}`);
  if (ctx.yuranMeetingFizikal) svcParts.push(`In-person meeting fee: RM${ctx.yuranMeetingFizikal}`);
  if (ctx.negeriOperasi) svcParts.push(`Operating state: ${ctx.negeriOperasi}`);
  if (ctx.emelPertanyaan) svcParts.push(`Inquiry email: ${ctx.emelPertanyaan}`);
  if (svcParts.length > 0) {
    prompt += `\n\n=== {LEGAL SERVICE CONFIG} ===\n${svcParts.join('\n')}`;
  }

  return prompt;
}

// ── Correction pivot handler ────────────────────────────────────────────────
// When the user says the recommended documents/area is wrong, pivot to the
// correct area derived from Soalan Asal (not from what the client previously said).

function buildCorrectionPrompt(baseCtx: string, soalanAsal: string | null): string {
  const guardrail = buildAntiHallucinationGuardrail(soalanAsal);
  return `${baseCtx}

--- CORRECTION HANDLER ---
The client has indicated that a previous document recommendation or practice area classification was WRONG.
This is a critical correction event.

${guardrail}

INSTRUCTIONS:
1. Acknowledge the correction warmly: "Maaf, saya tersilap faham."
2. Re-read the {SOALAN ASAL} above carefully to identify the correct practice area.
3. State the correct practice area clearly.
4. Provide the correct WHITELIST documents for this case.
5. Ask the client to confirm the corrected document list.
Do NOT repeat the wrong information. Do NOT advance the intake phase.`;
}

// ── Agent prompt builders ───────────────────────────────────────────────────

function agentANamePhonePrompt(baseCtx: string, collected: Record<string, string | null>): string {
  const have = formatCollected(collected);
  return `${baseCtx}

--- AGENT A: INTAKE — COLLECTING NAME & PHONE ---
Your current task: Collect the client's full name and phone number.

INSTRUCTIONS:
- Extract the name (≥2 characters) and Malaysian phone number (format: 01X-XXXXXXX or +60XXXXXXXXX).
- If you can identify BOTH, respond with this on the first line (before your message):
  EXTRACTED: name=<name>|phone=<phone>
  Then write a friendly confirmation and ask for their email.
- If you CANNOT find both, ask again with an example.
${have}`;
}

function agentAEmailPrompt(baseCtx: string, collected: Record<string, string | null>): string {
  const have = formatCollected(collected);
  return `${baseCtx}

--- AGENT A: INTAKE — COLLECTING EMAIL ---
Your current task: Collect the client's email (optional — they can type "skip").

INSTRUCTIONS:
- If valid email found: EXTRACTED: email=<email>  then acknowledge and transition to case questions.
- If "skip" or no email wanted: EXTRACTED: email=skip  then acknowledge and transition.
- If neither, gently re-ask.
${have}`;
}

function agentAQ1Prompt(baseCtx: string, collected: Record<string, string | null>): string {
  const have = formatCollected(collected);
  return `${baseCtx}

--- AGENT A: INTAKE — CASE ASSESSMENT ---
Your current task: Ask probing follow-up questions about the client's legal issue.

INSTRUCTIONS:
- Read the {SOALAN ASAL} carefully and identify the legal category (strata/property/employment/criminal/family/contract).
- Ask 2-3 specific follow-up questions relevant to THAT category. Do NOT ask about the wrong category.
- When the client provides a substantive answer, respond with:
  EXTRACTED: issue_details=<brief 1-sentence summary of the issue>
  Then transition to document recommendations.
- End every first message with: "Jangan risau, awak boleh terangkan dalam bahasa Inggeris atau Melayu."
${have}`;
}

function agentBTriagePrompt(baseCtx: string, collected: Record<string, string | null>, soalanAsal: string | null): string {
  const have = formatCollected(collected);
  const guardrail = buildAntiHallucinationGuardrail(soalanAsal);
  return `${baseCtx}

--- AGENT B: TRIAGE — DOCUMENT RECOMMENDATIONS ---
Your current task: Recommend specific documents the client should prepare.

${guardrail}

ADDITIONAL DOCUMENT GUIDANCE:
- For strata issues: Borang 28, written complaints to JMB/MC, photos of damage, repair receipts.
- For property issues: SPA, title documents, payment receipts, developer correspondence.
- For employment issues: employment contract, termination letter, payslips, warning letters.
- For criminal issues: police report, evidence of ownership, IO communications.
- For family issues: marriage certificate, court orders, asset documents.
- For debt/contract: original contract, payment receipts, bank statements, demand letter.

INSTRUCTIONS:
- List 4-6 documents. Be precise — use the WHITELIST above.
- After listing, tell the client to type "ok" when ready or ask questions.
- When client says "ok" or acknowledges: EXTRACTED: docs_acknowledged=true
  Then mention the lawyer's inquiry email (if in service config) and transition to consultation preferences.
- If client asks about a BLACKLIST document, redirect to the correct whitelist items.
${have}`;
}

function agentCQ3Prompt(baseCtx: string, collected: Record<string, string | null>): string {
  const have = formatCollected(collected);
  return `${baseCtx}

--- AGENT C: MARKET — CONSULTATION PREFERENCE ---
Your current task: Find out the client's preferred consultation mode.

Options to present:
• 📞 Panggilan telefon (Phone call)
• 💻 Mesyuarat video (Video meeting)
• 🏢 Temujanji bersemuka (In-person appointment)

INSTRUCTIONS:
- Ask about preferred mode and availability.
- When client picks a mode: EXTRACTED: consultation=<their preference>
  Then transition to urgency assessment.
- If client asks about fees, answer from {LEGAL SERVICE CONFIG} then re-ask.
${have}`;
}

function agentCQ4Prompt(baseCtx: string, collected: Record<string, string | null>): string {
  const have = formatCollected(collected);
  return `${baseCtx}

--- AGENT C: MARKET — URGENCY ASSESSMENT ---
Your current task: Determine if the client needs urgent handling.

INSTRUCTIONS:
- Ask if the client needs urgent handling or standard timeline.
- Present two options:
  • Ya — Saya perlukan ini secepat mungkin
  • Tidak — Tempoh standard adalah baik
- If urgent: EXTRACTED: urgency=urgent
- If standard: EXTRACTED: urgency=standard
- After extracting, transition to final remarks.
${have}`;
}

function agentDSummaryPrompt(baseCtx: string, collected: Record<string, string | null>, caseRef: string | null): string {
  const have = formatCollected(collected);
  return `${baseCtx}

--- AGENT D: SUMMARISER — FINAL REMARKS & WRAP-UP ---
Your current task: Ask for final remarks, then close the session.

INSTRUCTIONS:
- If first message in this phase: "Adakah ada lagi yang awak ingin peguam tahu? (Taip 'tiada' jika tiada)"
- When client provides remarks or says "tiada"/"none": EXTRACTED: remarks=<remarks or "none">
  Then write a warm closing:
  - Thank the client by name
  - Confirm their enquiry has been recorded${caseRef ? `\n  - Include case reference: ${caseRef}` : ''}
  - Tell them the lawyer will respond within 5 working days
  - Remind them to gather the recommended documents
${have}`;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCollected(collected: Record<string, string | null>): string {
  const entries = Object.entries(collected).filter(([, v]) => v !== null && v !== undefined);
  if (entries.length === 0) return '';
  return `\nAlready collected:\n${entries.map(([k, v]) => `${k}: ${v}`).join('\n')}`;
}

function parseExtraction(response: string): {
  extracted: Record<string, string> | null;
  cleanMessage: string;
} {
  const lines = response.split('\n');
  const extracted: Record<string, string> = {};
  const messageLines: string[] = [];
  let hasExtraction = false;

  for (const line of lines) {
    const match = line.match(/^EXTRACTED:\s*(.+)$/);
    if (match) {
      hasExtraction = true;
      for (const pair of match[1].split('|')) {
        const eq = pair.indexOf('=');
        if (eq > 0) {
          extracted[pair.substring(0, eq).trim()] = pair.substring(eq + 1).trim();
        }
      }
    } else {
      messageLines.push(line);
    }
  }

  const raw = messageLines.join('\n').trim();
  const cleanMessage = raw.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
  return {
    extracted: hasExtraction ? extracted : null,
    cleanMessage,
  };
}

function buildConversationHistory(
  transcript: unknown[]
): Array<{ role: 'user' | 'assistant'; content: string }> {
  if (!Array.isArray(transcript)) return [];
  return transcript
    .filter((t: any) => t.role === 'user' || t.role === 'assistant')
    .map((t: any) => ({ role: t.role as 'user' | 'assistant', content: t.content }));
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/donna-chat
//
// Body: { slug, bridgeId, userInput? }
// The `step`/phase is NEVER accepted from the client — always loaded from DB.
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, bridgeId, userInput, initialGreeting } = body;

    if (!slug) {
      return NextResponse.json({ error: 'slug required' }, { status: 400 });
    }
    if (!bridgeId) {
      return NextResponse.json({ error: 'bridgeId required' }, { status: 400 });
    }

    // ── 1. Load server-authoritative bridge state ─────────────────────────
    const bridgeState = await getBridgeChatState(bridgeId);
    if (!bridgeState) {
      return NextResponse.json({ error: 'Bridge not found' }, { status: 404 });
    }
    if (bridgeState.status !== 'ACTIVE') {
      return NextResponse.json({ error: `Bridge is ${bridgeState.status}` }, { status: 410 });
    }

    // The phase comes from the server — NEVER from the client
    const currentPhase = bridgeState.chatPhase as ChatPhase;
    const extractedSoFar = bridgeState.extractedEntities as Record<string, string | null>;

    // Already done — do nothing
    if (currentPhase === 'done') {
      return NextResponse.json({ message: 'Sesi telah tamat. Terima kasih!', nextStep: 'done', done: true });
    }

    // ── 2. Build context bundle (all 4 context sources) ───────────────────
    const ctx = await buildContextBundle(slug, bridgeId);
    if (!ctx) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const lawyerName = ctx.lawyerName;
    const lawyerEmail = ctx.emelPertanyaan;

    // ── 3. Load chat transcript for conversation history ──────────────────
    let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    let baseTurnIndex = 0;

    try {
      const b = await db.donnaBridge.findUnique({
        where: { id: bridgeId },
        select: { chatTranscript: true, shortCode: true },
      });
      if (b) {
        const transcript = Array.isArray(b.chatTranscript) ? b.chatTranscript : [];
        baseTurnIndex = transcript.length;
        conversationHistory = buildConversationHistory(transcript);
      }
    } catch (e) {
      console.error('[donna-chat] transcript hydrate failed:', e);
    }

    // Case ref
    let caseRef: string | null = null;
    try {
      const b = await db.donnaBridge.findUnique({ where: { id: bridgeId }, select: { shortCode: true } });
      caseRef = b?.shortCode ?? null;
    } catch { /* non-fatal */ }

    // ── 4. Append user turn to transcript BEFORE calling Claude ──────────
    if (userInput) {
      try {
        await appendTurn(bridgeId, { role: 'user', content: userInput, turnIndex: baseTurnIndex });
        baseTurnIndex += 1;
        await incrementAgentTurnCount(bridgeId);
      } catch (e) {
        console.error('[donna-chat] appendTurn(user) failed:', e);
      }
    }

    // ── 5. Think-Then-Act intent classification ───────────────────────────
    // Before routing to any agent, classify the user's intent.
    // 'correction' → pivot without advancing phase
    // 'question'   → answer from KB, re-ask same question, do NOT advance phase
    // 'off_topic'  → ask for clarification, do NOT advance phase
    // 'direct_answer' → route to current agent normally

    const baseCtx = buildBaseContext(ctx);
    let message = '';
    let nextStep: ChatPhase = currentPhase;
    let updatedCollected = { ...extractedSoFar };
    let done = false;
    let inquiryId: string | undefined;
    let advancePhase = true; // set to false to hold current phase

    if (userInput && currentPhase !== 'start') {
      const intent = classifyIntent(userInput, currentPhase);

      if (intent === 'correction') {
        // Anti-Hallucination pivot — do NOT advance phase
        const correctionPrompt = buildCorrectionPrompt(baseCtx, ctx.soalanAsal);
        message = await callClaude(correctionPrompt, conversationHistory, userInput, 500);
        advancePhase = false;
        nextStep = currentPhase;
      } else if (intent === 'question') {
        // Answer from KB, re-ask current question — do NOT advance phase
        const kbPrompt = `${baseCtx}

--- OFF-SCRIPT QUESTION HANDLER ---
The client has asked a question instead of answering the intake prompt.
INSTRUCTIONS:
1. Answer the client's question briefly using {DONNA AI CONFIG} and {LEGAL SERVICE CONFIG} above.
2. After your answer, re-ask the same intake question you were on — use this exact phrase:
   "Kembali kepada soalan tadi — [re-state the current intake question concisely]"
Do NOT advance to the next intake step. The phase stays at: ${currentPhase}`;
        message = await callClaude(kbPrompt, conversationHistory, userInput, 500);
        advancePhase = false;
        nextStep = currentPhase;
      } else if (intent === 'off_topic') {
        message = 'Maaf, saya tidak faham. Boleh awak cuba terangkan semula?';
        advancePhase = false;
        nextStep = currentPhase;
      }
    }

    // ── 6. Route to current agent (only if not already handled above) ─────
    if (advancePhase) {
      switch (currentPhase) {

        // ── START: deterministic greeting, no LLM needed ──────────────────
        case 'start': {
          // If userInput is present, the bridge page already showed the greeting
          // statically and the user is responding to it — skip the greeting and
          // process directly as name_phone (race guard against the page-level advance).
          if (userInput) {
            await updateChatPhase(bridgeId, 'name_phone');
            const prompt = agentANamePhonePrompt(baseCtx, updatedCollected);
            const raw = await callClaude(prompt, conversationHistory, userInput);
            const { extracted, cleanMessage } = parseExtraction(raw);
            message = cleanMessage;
            if (extracted?.name && extracted?.phone) {
              updatedCollected.clientName = extracted.name;
              updatedCollected.clientPhone = extracted.phone;
              await mergeExtractedEntities(bridgeId, { clientName: extracted.name, clientPhone: extracted.phone });
              nextStep = 'email_opt';
              await updateChatPhase(bridgeId, 'email_opt');
            } else {
              nextStep = 'name_phone';
            }
          } else {
            if (initialGreeting) {
              message = initialGreeting;
            } else {
              message = `Hi, Selamat Datang!\nSaya Donna, pembantu peribadi AI Peguam ${lawyerName}.\n\nBoleh saya dapatkan nama penuh dan nombor telefon awak?`;
            }
            nextStep = 'name_phone';
            await updateChatPhase(bridgeId, 'name_phone');
          }
          break;
        }

        // ── AGENT A: NAME + PHONE ──────────────────────────────────────────
        case 'name_phone': {
          const prompt = agentANamePhonePrompt(baseCtx, updatedCollected);
          const raw = await callClaude(prompt, conversationHistory, userInput ?? '');
          const { extracted, cleanMessage } = parseExtraction(raw);
          message = cleanMessage;

          if (extracted?.name && extracted?.phone) {
            updatedCollected.clientName = extracted.name;
            updatedCollected.clientPhone = extracted.phone;
            await mergeExtractedEntities(bridgeId, { clientName: extracted.name, clientPhone: extracted.phone });
            nextStep = 'email_opt';
            await updateChatPhase(bridgeId, 'email_opt');
          } else {
            nextStep = 'name_phone'; // stay
          }
          break;
        }

        // ── AGENT A: EMAIL ─────────────────────────────────────────────────
        case 'email_opt': {
          const prompt = agentAEmailPrompt(baseCtx, updatedCollected);
          const raw = await callClaude(prompt, conversationHistory, userInput ?? '');
          const { extracted, cleanMessage } = parseExtraction(raw);
          message = cleanMessage;

          if (extracted?.email) {
            const email = extracted.email === 'skip' ? null : extracted.email;
            updatedCollected.clientEmail = email;
            await mergeExtractedEntities(bridgeId, { clientEmail: email });
            nextStep = 'q1';
            await updateChatPhase(bridgeId, 'q1');
          } else {
            nextStep = 'email_opt';
          }
          break;
        }

        // ── AGENT A: CASE PROBING ──────────────────────────────────────────
        case 'q1': {
          const prompt = agentAQ1Prompt(baseCtx, updatedCollected);
          const raw = await callClaude(prompt, conversationHistory, userInput ?? '', 800);
          const { extracted, cleanMessage } = parseExtraction(raw);
          message = cleanMessage;

          if (extracted?.issue_details) {
            updatedCollected.issueDetails = extracted.issue_details;
            await mergeExtractedEntities(bridgeId, { issueDetails: extracted.issue_details });
            nextStep = 'q2';
            await updateChatPhase(bridgeId, 'q2');
          } else {
            nextStep = 'q1';
          }
          break;
        }

        // ── AGENT B: TRIAGE / DOCUMENTS ───────────────────────────────────
        case 'q2': {
          const prompt = agentBTriagePrompt(baseCtx, updatedCollected, ctx.soalanAsal);
          const raw = await callClaude(prompt, conversationHistory, userInput ?? '', 900);
          const { extracted, cleanMessage } = parseExtraction(raw);
          message = cleanMessage;

          if (extracted?.docs_acknowledged) {
            updatedCollected.docsAcknowledged = 'true';
            await mergeExtractedEntities(bridgeId, { docsAcknowledged: 'true' });
            nextStep = 'q3';
            await updateChatPhase(bridgeId, 'q3');
          } else {
            nextStep = 'q2';
          }
          break;
        }

        // ── AGENT C: CONSULTATION MODE ────────────────────────────────────
        case 'q3': {
          const prompt = agentCQ3Prompt(baseCtx, updatedCollected);
          const raw = await callClaude(prompt, conversationHistory, userInput ?? '');
          const { extracted, cleanMessage } = parseExtraction(raw);
          message = cleanMessage;

          if (extracted?.consultation) {
            updatedCollected.consultationPreference = extracted.consultation;
            await mergeExtractedEntities(bridgeId, { consultationPreference: extracted.consultation });
            nextStep = 'q4';
            await updateChatPhase(bridgeId, 'q4');
          } else {
            nextStep = 'q3';
          }
          break;
        }

        // ── AGENT C: URGENCY ──────────────────────────────────────────────
        case 'q4': {
          const prompt = agentCQ4Prompt(baseCtx, updatedCollected);
          const raw = await callClaude(prompt, conversationHistory, userInput ?? '');
          const { extracted, cleanMessage } = parseExtraction(raw);
          message = cleanMessage;

          if (extracted?.urgency) {
            updatedCollected.urgencyPreference = extracted.urgency;
            await mergeExtractedEntities(bridgeId, { urgencyPreference: extracted.urgency });
            nextStep = 'q5';
            await updateChatPhase(bridgeId, 'q5');
          } else {
            nextStep = 'q4';
          }
          break;
        }

        // ── AGENT D: FINAL REMARKS & WRAP-UP ──────────────────────────────
        case 'q5': {
          const prompt = agentDSummaryPrompt(baseCtx, updatedCollected, caseRef);
          const raw = await callClaude(prompt, conversationHistory, userInput ?? '', 600);
          const { extracted, cleanMessage } = parseExtraction(raw);
          message = cleanMessage;

          if (extracted?.remarks) {
            updatedCollected.remarks = extracted.remarks === 'none' ? null : extracted.remarks;
            await mergeExtractedEntities(bridgeId, { remarks: updatedCollected.remarks ?? null });

            const issueSummary =
              updatedCollected.issueDetails ??
              ctx.soalanAsal ??
              'Inquiry submitted via Donna';

            // Create DonnaInquiry + send email
            try {
              const result = await createInquiry({
                profileId: (await db.lawyerProfile.findUnique({ where: { slug }, select: { id: true } }))!.id,
                clientName: updatedCollected.clientName ?? undefined,
                clientEmail: updatedCollected.clientEmail ?? undefined,
                clientPhone: updatedCollected.clientPhone ?? undefined,
                practiceArea: null,
                issueSummary,
                transcript: JSON.stringify(updatedCollected),
                bridgeId,
              });
              inquiryId = result.inquiryId;
            } catch (e) {
              console.error('[donna-chat q5] createInquiry error:', e);
            }

            nextStep = 'done';
            done = true;
            await updateChatPhase(bridgeId, 'done');
          } else {
            nextStep = 'q5';
          }
          break;
        }

        default: {
          message = 'Sesi ini telah tamat. Terima kasih!';
          nextStep = 'done';
          done = true;
        }
      }
    }

    // ── 7. Append Donna's response to transcript ──────────────────────────
    if (message) {
      try {
        await appendTurn(bridgeId, { role: 'assistant', content: message, turnIndex: baseTurnIndex });
      } catch (e) {
        console.error('[donna-chat] appendTurn(assistant) failed:', e);
      }
    }

    // ── 8. Finalize bridge after session complete ─────────────────────────
    if (done) {
      try {
        await completeBridgeOnIntake(bridgeId, {
          clientName: updatedCollected.clientName ?? null,
          clientEmail: updatedCollected.clientEmail ?? null,
          clientPhone: updatedCollected.clientPhone ?? null,
          practiceArea: null,
        });
      } catch (e) {
        console.error('[donna-chat] completeBridgeOnIntake error:', e);
      }
    }

    return NextResponse.json({
      message,
      nextStep,
      agentLabel: phaseToAgentLabel(nextStep),
      done,
      inquiryId,
    });

  } catch (error: any) {
    console.error('donna-chat error:', error);
    const isDev = process.env.NODE_ENV === 'development';
    const detail = isDev ? (error?.message ?? String(error)) : undefined;
    return NextResponse.json(
      { error: 'Failed to process message', ...(detail && { detail }) },
      { status: 500 }
    );
  }
}
