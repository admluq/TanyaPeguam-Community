import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { createInquiry } from '@/lib/inquiry';
import { completeBridgeOnIntake } from '@/lib/bridge';

// Generate 3 context-aware compound questions based on the legal issue (soalan asal)
function generateContextQuestions(soalanAsal: string): string {
  const lower = soalanAsal.toLowerCase();

  // Detect issue type from keywords
  const isTermination = /buang|pecat|resign|terminate|kerjasama|tamat/.test(lower);
  const isContract = /kontrak|perjanjian|deal|agreement/.test(lower);
  const isProperty = /hartanah|tanah|rumah|bangunan|property/.test(lower);
  const isFamily = /perkahwinan|cerai|anak|warisan|keluarga/.test(lower);

  let q1, q2, q3;

  if (isTermination) {
    q1 = `1. Bilakah anda diputuskan hubungan kerja dan dalam keadaan apa (lisan/tertulis)? Siapa yang memberitahu?`;
    q2 = `2. Berapa lama anda bekerja dan dalam jawatan apa? Ada kontrak atau LoO (Letter of Offer)?`;
    q3 = `3. Ada saksi atau dokumen sokongan (email, slip gaji terakhir, surat tamat perkhidmatan)?`;
  } else if (isContract) {
    q1 = `1. Apa yang disepakati awalnya dan siapa pihak lain yang terlibat? Ada tertulis atau lisan sahaja?`;
    q2 = `2. Bila dimulai dan apa yang telah dilakukan sejauh ini?`;
    q3 = `3. Apa masalah atau percanggahan yang timbul? Ada bukti tertulis?`;
  } else if (isProperty) {
    q1 = `1. Jenis hartanah apa dan di mana lokasinya? Anda pemilik atau pembeli?`;
    q2 = `2. Apa masalah yang timbul? Melibatkan pihak lain atau institusi (bank, majlis)?`;
    q3 = `3. Ada dokumen pemilikan, perjanjian jual beli, atau surat rasmi lain?`;
  } else if (isFamily) {
    q1 = `1. Apa hubungan anda dengan pihak lain dan apa yang anda inginkan dicapai?`;
    q2 = `2. Ada perjanjian sebelumnya atau isu yang ingin diselesaikan?`;
    q3 = `3. Ada dokumen penting atau saksi yang boleh menyokong?`;
  } else {
    // Generic fallback for other issues
    q1 = `1. Bilakah peristiwa ini berlaku dan siapa yang terlibat secara langsung?`;
    q2 = `2. Apa tindakan atau keputusan yang dibuat dan berdasarkan apa?`;
    q3 = `3. Ada dokumen, email, bukti atau saksi yang menyokong kes anda?`;
  }

  return `Untuk membantu peguam menilai kes anda dengan lebih lanjut, sila jawab ketiga-tiga soalan berikut:\n\n${q1}\n${q2}\n${q3}`;
}

/**
 * POST /api/donna-chat   ⚠️ DEPRECATED — see plan §A "API Sequence Diagram".
 * This stateless state-machine handler will be replaced by /api/chat/donna
 * (LLM-backed Agent A/B/C orchestrator) in Phase 3. Kept alive in the
 * meantime so the existing widget keeps working, but it now:
 *   1. accepts an optional bridgeId param (audit SPOF #14 fix), and
 *   2. calls lib/inquiry.createInquiry() directly instead of fetching
 *      its own /api/admin/donna-inquiry endpoint (audit SPOF #10/#11 fix).
 *
 * Body:
 *   slug        string  — lawyer's profile slug
 *   step        string  — current state: 'start'|'name'|'phone'|'area'|'issue'|'email'|'done'
 *   userInput   string? — what the user just said
 *   collected   object  — session state carried from client
 *   bridgeId    string? — optional bridge session this chat originated from
 *
 * Returns:
 *   message     string  — Donna's next reply
 *   nextStep    string  — state machine transition
 *   collected   object  — updated session state
 *   done        boolean — true when intake is complete
 *   inquiryId   string? — set when done=true
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, step, userInput, collected = {}, bridgeId, bridgeQuestion, initialGreeting } = body;

    if (!slug) {
      return NextResponse.json({ error: 'slug required' }, { status: 400 });
    }

    // Load profile + donna config (keep secure fields, only load what's needed for convo)
    const profile = await db.lawyerProfile.findUnique({
      where: { slug },
      select: {
        id: true,
        firmName: true,
        donnaConfig: {
          select: {
            personality: true,
            kbContext: true,
            triageRules: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const personality = profile.donnaConfig?.personality ?? 'PROFESSIONAL';
    const firmName = profile.firmName ?? 'firma guaman ini';
    // True when client came via a bridge link — issue already known from initialQuestion
    const hasBridgeContext = !!bridgeQuestion || !!collected?._hasBridgeContext;
    // Custom greeting for digital card
    const hasCustomGreeting = !!initialGreeting;

    // ── Personality tone ──────────────────────────────────────
    const tone = {
      PROFESSIONAL: {
        greeting: `Assalamualaikum dan selamat datang ke ${firmName}. Saya Donna, pembantu digital firma ini.`,
        thanks: 'Terima kasih kerana menghubungi kami.',
        prompt_name: 'Boleh saya dapatkan nama penuh anda?',
        prompt_phone: 'Terima kasih. Apakah nombor telefon anda untuk kami hubungi?',
        prompt_area: 'Apakah jenis isu undang-undang yang anda hadapi? Contohnya: perkahwinan, hartanah, jenayah, perniagaan, atau lain-lain.',
        prompt_issue: 'Sila terangkan secara ringkas isu anda. Semakin terperinci, semakin baik kami dapat membantu.',
        prompt_email: 'Apakah alamat e-mel anda? (Pilihan — anda boleh taip "skip" jika tidak mahu berkongsi)',
        closing: 'Pertanyaan anda telah direkodkan dan akan dikaji oleh peguam kami. Kami akan menghubungi anda tidak lama lagi. Terima kasih atas kepercayaan anda.',
      },
      SOFT: {
        greeting: `Hai! Selamat datang ke ${firmName} 😊 Saya Donna, saya di sini untuk bantu anda.`,
        thanks: 'Terima kasih ya!',
        prompt_name: 'Boleh tahu nama anda?',
        prompt_phone: 'Best! Boleh bagi nombor telefon anda? Kami akan hubungi anda nanti.',
        prompt_area: 'Okay, boleh cerita sikit isu apa yang anda hadapi? Perniagaan, keluarga, hartanah, atau apa-apa lain?',
        prompt_issue: 'Ceritakan lebih lanjut ya. Apa yang berlaku?',
        prompt_email: 'Nak bagi e-mel? (Tak wajib, taip "skip" kalau tak mahu)',
        closing: 'Okay! Maklumat anda dah disimpan dan peguam kami akan tengok segera. Nantikan panggilan dari kami ya! 😊',
      },
      STRICT: {
        greeting: `Selamat datang ke ${firmName}. Saya Donna, sistem pengambilan pertanyaan.`,
        thanks: 'Diterima.',
        prompt_name: 'Nama penuh anda?',
        prompt_phone: 'Nombor telefon anda?',
        prompt_area: 'Nyatakan bidang undang-undang: jenayah / sivil / syariah / hartanah / perniagaan / keluarga / lain-lain.',
        prompt_issue: 'Huraikan isu anda secara ringkas dan tepat.',
        prompt_email: 'E-mel anda? (Taip "skip" jika tidak berkenaan)',
        closing: 'Pertanyaan anda telah direkodkan. Peguam akan menghubungi anda.',
      },
    }[personality];

    // ── State machine ────────────────────────────────────────
    let message = '';
    let nextStep = step;
    let updatedCollected = { ...collected };
    let done = false;
    let inquiryId: string | undefined;

    switch (step) {
      case 'start': {
        if (hasCustomGreeting) {
          // Digital card mode: use custom greeting
          message = initialGreeting;
        } else if (hasBridgeContext && bridgeQuestion) {
          // Bridge mode: greet with the specific issue already known
          const shortIssue = bridgeQuestion.length > 120
            ? bridgeQuestion.slice(0, 117) + '...'
            : bridgeQuestion;
          message = `${tone.greeting}\n\nSaya faham anda ada pertanyaan mengenai:\n\n"${shortIssue}"\n\nUntuk membantu peguam kami menilai kes anda dengan lebih lanjut, boleh saya dapatkan nama penuh anda?`;
        } else {
          message = `${tone.greeting}\n\n${tone.prompt_name}`;
        }
        nextStep = 'name';
        break;
      }

      case 'name': {
        const name = (userInput ?? '').trim();
        if (!name || name.length < 2) {
          message = 'Sila masukkan nama penuh anda.';
          nextStep = 'name';
          break;
        }
        updatedCollected.clientName = name;
        if (hasCustomGreeting || hasBridgeContext) {
          // Bridge / digital card mode: 4-question flow
          message = `${tone.thanks}\n\nUntuk peguam bagi maklum balas, boleh kami dapatkan nombor untuk hubungi anda?`;
          nextStep = 'q1';
        } else {
          message = `${tone.thanks}\n\n${tone.prompt_phone}`;
          nextStep = 'phone';
        }
        break;
      }

      case 'phone': {
        const phone = (userInput ?? '').replace(/\s/g, '');
        if (!/^(\+?60|0)\d{8,10}$/.test(phone)) {
          message = 'Sila masukkan nombor telefon Malaysia yang sah. Contoh: 0123456789';
          nextStep = 'phone';
          break;
        }
        updatedCollected.clientPhone = phone;
        if (hasBridgeContext) {
          // Issue already known from bridge — skip area + issue, go straight to email
          message = `${tone.thanks}\n\n${tone.prompt_email}`;
          nextStep = 'email';
        } else {
          message = `${tone.thanks}\n\n${tone.prompt_area}`;
          nextStep = 'area';
        }
        break;
      }

      case 'area': {
        const area = (userInput ?? '').trim();
        if (!area || area.length < 2) {
          message = 'Sila nyatakan jenis isu undang-undang anda.';
          nextStep = 'area';
          break;
        }
        updatedCollected.practiceArea = area;
        message = `${tone.thanks}\n\n${tone.prompt_issue}`;
        nextStep = 'issue';
        break;
      }

      case 'issue': {
        const issue = (userInput ?? '').trim();
        if (!issue || issue.length < 10) {
          message = 'Sila berikan lebih maklumat mengenai isu anda (sekurang-kurangnya 10 aksara).';
          nextStep = 'issue';
          break;
        }
        updatedCollected.issueSummary = issue;
        message = `${tone.thanks}\n\n${tone.prompt_email}`;
        nextStep = 'email';
        break;
      }

      case 'email': {
        const emailInput = (userInput ?? '').trim().toLowerCase();
        const skip = emailInput === 'skip' || emailInput === '';
        const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput);

        if (!skip && !validEmail) {
          message = 'Sila masukkan e-mel yang sah, atau taip "skip" untuk langkau.';
          nextStep = 'email';
          break;
        }

        updatedCollected.clientEmail = skip ? null : emailInput;

        // ── Step 1: Create inquiry (non-fatal) ──────────────────────────
        const finalIssueSummaryEmail =
          updatedCollected.issueSummary ?? bridgeQuestion ?? 'Pertanyaan dari bridge';

        try {
          const result = await createInquiry({
            profileId: profile.id,
            clientName: updatedCollected.clientName,
            clientEmail: updatedCollected.clientEmail,
            clientPhone: updatedCollected.clientPhone,
            practiceArea: updatedCollected.practiceArea ?? null,
            issueSummary: finalIssueSummaryEmail,
            transcript: JSON.stringify(updatedCollected._transcript ?? []),
            bridgeId: bridgeId ?? null,
          });
          inquiryId = result.inquiryId;
        } catch (submitErr) {
          console.error('[donna-chat email] createInquiry error:', submitErr);
        }

        // ── Step 2: Mark bridge COMPLETED — always runs, independent of Step 1 ──
        if (bridgeId) {
          try {
            await completeBridgeOnIntake(bridgeId, {
              clientName:   updatedCollected.clientName   ?? null,
              clientEmail:  updatedCollected.clientEmail  ?? null,
              clientPhone:  updatedCollected.clientPhone  ?? null,
              practiceArea: updatedCollected.practiceArea ?? null,
            });
            console.log('[donna-chat email] bridge', bridgeId, 'marked COMPLETED');
          } catch (bridgeErr) {
            console.error('[donna-chat email] completeBridgeOnIntake error:', bridgeErr);
          }
        }

        message = tone.closing;
        nextStep = 'done';
        done = true;
        break;
      }

      // Digital card 4-question flow
      case 'q1': {
        const phone = (userInput ?? '').replace(/\s/g, '');
        if (!/^(\+?60|0)\d{8,10}$/.test(phone)) {
          message = 'Sila masukkan nombor telefon Malaysia yang sah. Contoh: 0123456789';
          nextStep = 'q1';
          break;
        }
        updatedCollected.clientPhone = phone;
        // Generate context-aware compound questions based on soalan asal
        const soalanAsal = bridgeQuestion ?? 'isu undang-undang anda';
        const contextQuestions = generateContextQuestions(soalanAsal);
        message = `${tone.thanks}\n\n${contextQuestions}`;
        nextStep = 'q2';
        break;
      }

      case 'q2': {
        const factResponse = (userInput ?? '').trim();
        if (!factResponse || factResponse.length < 10) {
          message = 'Sila berikan lebih maklumat. Jawab ketiga-tiga soalan di atas untuk membantu peguam menilai kes anda.';
          nextStep = 'q2';
          break;
        }
        updatedCollected.issueSummary = factResponse;
        message = `${tone.thanks}\n\nBila sebaik-baiknya kami boleh menghubungi anda? (Contoh: hari ini, minggu depan, atau sila nyatakan tarikh)`;
        nextStep = 'q3';
        break;
      }

      case 'q3': {
        const availability = (userInput ?? '').trim();
        if (!availability || availability.length < 2) {
          message = 'Sila nyatakan masa yang sesuai.';
          nextStep = 'q3';
          break;
        }
        updatedCollected.availability = availability;
        message = `${tone.thanks}\n\nBoleh saya dapatkan alamat e-mel anda untuk rekod? (Pilihan — taip "skip" jika tidak mahu)`;
        nextStep = 'q4';
        break;
      }

      case 'q4': {
        const emailInput = (userInput ?? '').trim().toLowerCase();
        const skip = emailInput === 'skip' || emailInput === '';
        const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput);

        if (!skip && !validEmail) {
          message = 'Sila masukkan e-mel yang sah, atau taip "skip" untuk langkau.';
          nextStep = 'q4';
          break;
        }

        updatedCollected.clientEmail = skip ? null : emailInput;

        const finalIssueSummary =
          updatedCollected.issueSummary ?? bridgeQuestion ?? 'Pertanyaan dari digital card';

        // ── Step 1: Create inquiry (non-fatal if duplicate bridgeId) ──
        try {
          const result = await createInquiry({
            profileId: profile.id,
            clientName: updatedCollected.clientName,
            clientEmail: updatedCollected.clientEmail,
            clientPhone: updatedCollected.clientPhone,
            practiceArea: null,
            issueSummary: finalIssueSummary,
            transcript: JSON.stringify(updatedCollected._transcript ?? []),
            bridgeId: bridgeId ?? null,
          });
          inquiryId = result.inquiryId;
        } catch (submitErr) {
          console.error('[donna-chat q4] createInquiry error:', submitErr);
        }

        // ── Step 2: Mark bridge COMPLETED — always runs, independent of Step 1 ──
        if (bridgeId) {
          try {
            await completeBridgeOnIntake(bridgeId, {
              clientName:   updatedCollected.clientName   ?? null,
              clientEmail:  updatedCollected.clientEmail  ?? null,
              clientPhone:  updatedCollected.clientPhone  ?? null,
              practiceArea: null,
            });
            console.log('[donna-chat q4] bridge', bridgeId, 'marked COMPLETED');
          } catch (bridgeErr) {
            console.error('[donna-chat q4] completeBridgeOnIntake error:', bridgeErr);
          }
        } else {
          console.warn('[donna-chat q4] no bridgeId — bridge status NOT updated');
        }

        // Summarize
        const summary = [
          `Terima kasih, ${updatedCollected.clientName}. Maklumat anda telah direkodkan.`,
          ``,
          `Ringkasan:`,
          `• Isu: ${updatedCollected.issueSummary ?? bridgeQuestion ?? '-'}`,
          `• Telefon: ${updatedCollected.clientPhone ?? '-'}`,
          `• Masa sesuai: ${updatedCollected.availability ?? '-'}`,
          updatedCollected.clientEmail ? `• E-mel: ${updatedCollected.clientEmail}` : null,
          ``,
          `Peguam akan beri maklum balas dalam 5 hari bekerja.`,
        ].filter((l) => l !== null).join('\n');
        message = summary;
        nextStep = 'done';
        done = true;
        break;
      }

      default: {
        message = 'Sesi ini telah tamat. Terima kasih!';
        nextStep = 'done';
        done = true;
      }
    }

    return NextResponse.json({
      message,
      nextStep,
      collected: updatedCollected,
      done,
      inquiryId,
    });
  } catch (error) {
    console.error('donna-chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
