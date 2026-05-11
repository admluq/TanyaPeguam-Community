import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { createInquiry } from '@/lib/inquiry';
import { completeBridgeOnIntake } from '@/lib/bridge';

// ── Q1: Context-aware probing questions about the problem ─────────────
function generateProbingQuestions(issue: string): string {
  const lower = issue.toLowerCase();

  const isTermination = /buang|pecat|resign|terminate|kerjasama|tamat|gaji|majikan|kerja/.test(lower);
  const isContract    = /kontrak|perjanjian|deal|agreement|bayar|hutang/.test(lower);
  const isProperty    = /hartanah|tanah|rumah|bangunan|property|developer|pemaju|konveyan/.test(lower);
  const isFamily      = /perkahwinan|cerai|anak|warisan|keluarga|pusaka|nafkah/.test(lower);

  if (isTermination) return [
    `To help the lawyer assess your employment matter, please answer the following:`,
    ``,
    `1. When were you terminated and how was it communicated — verbally or in writing? Who informed you?`,
    `2. How long were you employed and in what position? Did you have a contract or Letter of Offer?`,
    `3. What reason (if any) did your employer give for the termination?`,
  ].join('\n');

  if (isContract) return [
    `To help the lawyer assess your contract dispute, please answer:`,
    ``,
    `1. What was originally agreed upon and who are the other parties involved? Was it written or verbal?`,
    `2. When did this arrangement begin and what has been done/paid so far?`,
    `3. What specific breach or issue has occurred and when did it start?`,
  ].join('\n');

  if (isProperty) return [
    `To help the lawyer assess your property matter, please answer:`,
    ``,
    `1. What type of property is involved and what is the issue — purchase, ownership, tenancy, or dispute?`,
    `2. Who are the other parties involved (developer, seller, bank, tenant)?`,
    `3. Have any payments been made? What is the current status of the property?`,
  ].join('\n');

  if (isFamily) return [
    `To help the lawyer understand your family matter, please answer:`,
    ``,
    `1. What is your relationship to the other party and what outcome are you seeking?`,
    `2. Are there children or shared assets involved?`,
    `3. Have there been any prior agreements or court orders related to this matter?`,
  ].join('\n');

  return [
    `To help the lawyer assess your case, please answer:`,
    ``,
    `1. When did this situation begin and who are the parties involved?`,
    `2. What actions or decisions have been taken so far?`,
    `3. What outcome are you hoping to achieve?`,
  ].join('\n');
}

// ── Q2: Context-aware document recommendations ────────────────────────
function generateDocumentRecommendations(issue: string): string {
  const lower = issue.toLowerCase();

  const isTermination = /buang|pecat|resign|terminate|kerjasama|tamat|gaji|majikan|kerja/.test(lower);
  const isContract    = /kontrak|perjanjian|deal|agreement|bayar|hutang/.test(lower);
  const isProperty    = /hartanah|tanah|rumah|bangunan|property|developer|pemaju|konveyan/.test(lower);
  const isFamily      = /perkahwinan|cerai|anak|warisan|keluarga|pusaka|nafkah/.test(lower);

  let docs: string;

  if (isTermination) {
    docs = [
      `• Employment contract / Letter of Offer`,
      `• Termination letter or show-cause letter`,
      `• Last 3 months' payslips`,
      `• Any related emails or written warnings`,
      `• Attendance or performance records`,
    ].join('\n');
  } else if (isContract) {
    docs = [
      `• Original contract or agreement`,
      `• Any amendments or addendums`,
      `• Proof of payment or transactions`,
      `• Related correspondence (emails, letters)`,
      `• Invoices or receipts`,
    ].join('\n');
  } else if (isProperty) {
    docs = [
      `• Sale & Purchase Agreement (SPA)`,
      `• Land title or ownership document`,
      `• Payment receipts (deposit, instalments)`,
      `• Correspondence with developer/seller/bank`,
      `• Bank loan statement (if applicable)`,
    ].join('\n');
  } else if (isFamily) {
    docs = [
      `• Marriage certificate`,
      `• Children's birth certificates (if relevant)`,
      `• Any existing court orders or agreements`,
      `• Joint asset documents (property, bank accounts)`,
      `• Will or inheritance documents (if relevant)`,
    ].join('\n');
  } else {
    docs = [
      `• Any contract or agreement related to the matter`,
      `• Proof of payment or transactions`,
      `• Related correspondence (emails, messages, letters)`,
      `• Identity document (MyKad)`,
      `• Any other relevant evidence or records`,
    ].join('\n');
  }

  return [
    `Based on your case, we recommend gathering the following documents before your consultation with the lawyer:`,
    ``,
    docs,
    ``,
    `Please locate and prepare these — having them ready will significantly speed up the lawyer's assessment of your case. Type "ok" or let us know if you have any questions about the documents.`,
  ].join('\n');
}

/**
 * POST /api/donna-chat
 *
 * New intake flow (applies to both bridge and digital card):
 *   start → name → phone → email_opt → q1 → q2 → q3 → q4 → q5 → done
 *
 *   start     : Initial greeting, transitions to 'name'
 *   name      : Collect full name
 *   phone     : Collect phone number
 *   email_opt : Collect email (optional, "skip" allowed)
 *   q1        : Context-aware probing — detail of problem
 *   q2        : Document recommendations based on context
 *   q3        : Share docs to lawyer email + case ref + consultation preference
 *   q4        : Emergency / sooner appointment option
 *   q5        : Final remarks — wrap up and submit
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, step, userInput, collected = {}, bridgeId, bridgeQuestion, initialGreeting } = body;

    if (!slug) {
      return NextResponse.json({ error: 'slug required' }, { status: 400 });
    }

    // ── Load profile (include lawyer email for Q3) ──────────────
    const profile = await db.lawyerProfile.findUnique({
      where: { slug },
      select: {
        id: true,
        firmName: true,
        donnaConfig: {
          select: { personality: true, kbContext: true, triageRules: true },
        },
        legalServiceConfig: {
          select: { emelPertanyaan: true },
        },
        user: { select: { email: true } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const firmName    = profile.firmName ?? 'firma guaman ini';
    const lawyerEmail = (profile.legalServiceConfig as any)?.emelPertanyaan
      || profile.user?.email
      || null;

    // Case reference: use bridge shortCode if available, else last 8 chars of bridgeId
    let caseRef = bridgeId ? bridgeId.slice(-8).toUpperCase() : null;
    if (bridgeId) {
      try {
        const bridge = await db.donnaBridge.findUnique({
          where: { id: bridgeId },
          select: { shortCode: true },
        });
        if (bridge?.shortCode) caseRef = bridge.shortCode;
      } catch { /* non-fatal */ }
    }

    // ── State machine ────────────────────────────────────────────
    let message    = '';
    let nextStep   = step;
    let updatedCollected = { ...collected };
    let done       = false;
    let inquiryId: string | undefined;

    switch (step) {

      // ── INITIAL GREETING ──────────────────────────────────────
      case 'start': {
        if (initialGreeting) {
          message = initialGreeting;
        } else if (bridgeQuestion) {
          const shortIssue = bridgeQuestion.length > 120
            ? bridgeQuestion.slice(0, 117) + '...'
            : bridgeQuestion;
          message = `Assalamualaikum dan selamat datang ke ${firmName}. Saya Donna, pembantu digital firma ini.\n\nSaya faham anda ada pertanyaan mengenai:\n\n"${shortIssue}"\n\nUntuk membantu peguam kami menilai kes anda, boleh saya dapatkan nama penuh anda?`;
        } else {
          message = `Assalamualaikum dan selamat datang ke ${firmName}. Saya Donna, pembantu digital firma ini.\n\nBoleh saya dapatkan nama penuh anda?`;
        }
        nextStep = 'name';
        break;
      }

      // ── STEP 1: NAME ──────────────────────────────────────────
      case 'name': {
        const name = (userInput ?? '').trim();
        if (!name || name.length < 2) {
          message = 'Please provide your full name.';
          nextStep = 'name';
          break;
        }
        updatedCollected.clientName = name;
        message = `Thank you, ${name}! To ensure the lawyer can follow up with you, may I have your phone number?`;
        nextStep = 'phone';
        break;
      }

      // ── STEP 2: PHONE ─────────────────────────────────────────
      case 'phone': {
        const phone = (userInput ?? '').replace(/\s/g, '');
        if (!/^(\+?60|0)\d{8,10}$/.test(phone)) {
          message = 'Please enter a valid Malaysian phone number. Example: 0123456789';
          nextStep = 'phone';
          break;
        }
        updatedCollected.clientPhone = phone;
        message = `Got it! Could we also have your email address? (Type "skip" if you'd prefer not to share)`;
        nextStep = 'email_opt';
        break;
      }

      // ── STEP 3: EMAIL (OPTIONAL) ──────────────────────────────
      case 'email_opt': {
        const emailInput = (userInput ?? '').trim().toLowerCase();
        const skip       = emailInput === 'skip' || emailInput === '';
        const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput);

        if (!skip && !validEmail) {
          message = 'Please enter a valid email address, or type "skip" to proceed.';
          nextStep = 'email_opt';
          break;
        }

        updatedCollected.clientEmail = skip ? null : emailInput;

        // Issue context: from bridgeQuestion (bridge) or collected (digital card)
        const issueContext = bridgeQuestion ?? updatedCollected.issueSummary ?? '';
        message = generateProbingQuestions(issueContext);
        nextStep = 'q1';
        break;
      }

      // ── Q1: USER ANSWERS PROBING QUESTIONS ───────────────────
      case 'q1': {
        const answer = (userInput ?? '').trim();
        if (!answer || answer.length < 10) {
          message = 'Please provide more detail to help the lawyer assess your case. Try to answer all questions above.';
          nextStep = 'q1';
          break;
        }
        updatedCollected.issueSummary = answer;

        // Generate document recommendations based on issue context
        const issueForDocs = bridgeQuestion ?? answer;
        message = generateDocumentRecommendations(issueForDocs);
        nextStep = 'q2';
        break;
      }

      // ── Q2: USER ACKNOWLEDGES DOCUMENTS ──────────────────────
      case 'q2': {
        // Any response is valid — user is acknowledging the doc list
        updatedCollected.docsAcknowledged = true;

        const emailLine = lawyerEmail
          ? `📧 **${lawyerEmail}**`
          : `📧 *(please contact the lawyer directly)*`;

        const refLine = caseRef
          ? `Please include **Case Reference: ${caseRef}** in your email subject.`
          : ``;

        message = [
          `When you have gathered your documents, you may send them directly to the lawyer at:`,
          ``,
          emailLine,
          refLine,
          ``,
          `This will help the lawyer review your case before your consultation.`,
          ``,
          `Now, when are you available to consult? And what is your preferred mode:`,
          `• 📞 Phone call`,
          `• 💻 Video meeting`,
          `• 🏢 In-person appointment`,
        ].filter(l => l !== undefined).join('\n');
        nextStep = 'q3';
        break;
      }

      // ── Q3: CONSULTATION PREFERENCE & AVAILABILITY ───────────
      case 'q3': {
        const preference = (userInput ?? '').trim();
        if (!preference || preference.length < 2) {
          message = 'Please let us know your availability and preferred consultation mode.';
          nextStep = 'q3';
          break;
        }
        updatedCollected.consultationPreference = preference;

        message = [
          `Understood. One more thing — do you need this handled urgently?`,
          ``,
          `We can arrange an appointment as soon as possible, however a **small emergency fee** may apply.`,
          ``,
          `• Yes — I need this as soon as possible`,
          `• No — standard timeline is fine`,
        ].join('\n');
        nextStep = 'q4';
        break;
      }

      // ── Q4: EMERGENCY / URGENCY OPTION ───────────────────────
      case 'q4': {
        const urgency = (userInput ?? '').trim();
        updatedCollected.urgencyPreference = urgency;

        message = [
          `Thank you for sharing all of this.`,
          ``,
          `Is there anything else you'd like the lawyer to know, or are you satisfied with what has been shared? Feel free to leave any additional remarks or questions below.`,
          ``,
          `*(Type "none" if you have nothing to add)*`,
        ].join('\n');
        nextStep = 'q5';
        break;
      }

      // ── Q5: FINAL REMARKS → SUBMIT ────────────────────────────
      case 'q5': {
        const remarks = (userInput ?? '').trim();
        updatedCollected.remarks = remarks !== 'none' ? remarks : null;

        const finalIssueSummary =
          updatedCollected.issueSummary ?? bridgeQuestion ?? 'Inquiry submitted via Donna';

        // ── Step 1: Create inquiry (non-fatal) ──
        try {
          const result = await createInquiry({
            profileId:    profile.id,
            clientName:   updatedCollected.clientName,
            clientEmail:  updatedCollected.clientEmail,
            clientPhone:  updatedCollected.clientPhone,
            practiceArea: null,
            issueSummary: finalIssueSummary,
            transcript:   JSON.stringify(updatedCollected._transcript ?? []),
            bridgeId:     bridgeId ?? null,
          });
          inquiryId = result.inquiryId;
        } catch (submitErr) {
          console.error('[donna-chat q5] createInquiry error:', submitErr);
        }

        // ── Step 2: Mark bridge COMPLETED — independent of Step 1 ──
        if (bridgeId) {
          try {
            await completeBridgeOnIntake(bridgeId, {
              clientName:   updatedCollected.clientName   ?? null,
              clientEmail:  updatedCollected.clientEmail  ?? null,
              clientPhone:  updatedCollected.clientPhone  ?? null,
              practiceArea: null,
            });
            console.log('[donna-chat q5] bridge', bridgeId, 'marked COMPLETED');
          } catch (bridgeErr) {
            console.error('[donna-chat q5] completeBridgeOnIntake error:', bridgeErr);
          }
        }

        message = [
          `Thank you, ${updatedCollected.clientName ?? 'there'}! Your enquiry has been recorded.`,
          ``,
          `The lawyer will review your case and get back to you within **5 working days**.`,
          ``,
          `In the meantime, please gather the documents we mentioned and send them to the lawyer's email with your case reference${caseRef ? ` **(${caseRef})**` : ''}.`,
        ].join('\n');

        nextStep = 'done';
        done = true;
        break;
      }

      default: {
        message  = 'This session has ended. Thank you!';
        nextStep = 'done';
        done     = true;
      }
    }

    return NextResponse.json({ message, nextStep, collected: updatedCollected, done, inquiryId });

  } catch (error) {
    console.error('donna-chat error:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
