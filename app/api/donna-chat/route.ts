import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { createInquiry } from '@/lib/inquiry';
import { completeBridgeOnIntake } from '@/lib/bridge';

// ── Q1: Context-aware probing questions about the problem (Malay) ─────
function generateProbingQuestions(issue: string): string {
  const lower = issue.toLowerCase();

  const isTermination = /buang|pecat|resign|terminate|kerjasama|tamat|gaji|majikan|kerja/.test(lower);
  const isContract    = /kontrak|perjanjian|deal|agreement|bayar|hutang/.test(lower);
  const isProperty    = /hartanah|tanah|rumah|bangunan|property|developer|pemaju|konveyan/.test(lower);
  const isFamily      = /perkahwinan|cerai|anak|warisan|keluarga|pusaka|nafkah/.test(lower);

  const jangan = `\nJangan risau, awak boleh terangkan dalam bahasa inggeris atau bahasa melayu.`;

  if (isTermination) return [
    `Untuk membantu peguam menilai kes pekerjaan awak, sila jawab soalan berikut:`,
    ``,
    `1. Bila awak ditamatkan dan bagaimana ia dimaklumkan — secara lisan atau bertulis? Siapa yang memaklumkan awak?`,
    `2. Berapa lama awak bekerja dan dalam jawatan apa? Adakah awak ada kontrak atau Surat Tawaran?`,
    `3. Apakah sebab (jika ada) yang majikan berikan untuk penamatan tersebut?`,
  ].join('\n') + jangan;

  if (isContract) return [
    `Untuk membantu peguam menilai pertikaian kontrak awak, sila jawab:`,
    ``,
    `1. Apakah yang telah dipersetujui dan siapa pihak-pihak yang terlibat? Adakah ia bertulis atau lisan?`,
    `2. Bila peraturan ini bermula dan apa yang telah dilakukan/dibayar setakat ini?`,
    `3. Apakah pelanggaran atau isu khusus yang berlaku dan bila ia bermula?`,
  ].join('\n') + jangan;

  if (isProperty) return [
    `Untuk membantu peguam menilai kes hartanah awak, sila jawab:`,
    ``,
    `1. Apakah jenis hartanah yang terlibat dan apakah isu — pembelian, pemilikan, sewaan, atau pertikaian?`,
    `2. Siapa pihak-pihak lain yang terlibat (pemaju, penjual, bank, penyewa)?`,
    `3. Adakah sebarang bayaran telah dibuat? Apakah status semasa hartanah tersebut?`,
  ].join('\n') + jangan;

  if (isFamily) return [
    `Untuk membantu peguam memahami kes keluarga awak, sila jawab:`,
    ``,
    `1. Apakah hubungan awak dengan pihak lain dan apakah hasil yang awak cari?`,
    `2. Adakah kanak-kanak atau aset bersama yang terlibat?`,
    `3. Adakah sebarang perjanjian atau perintah mahkamah terdahulu berkaitan perkara ini?`,
  ].join('\n') + jangan;

  return [
    `Untuk membantu peguam menilai kes awak, sila jawab:`,
    ``,
    `1. Bila situasi ini bermula dan siapa pihak-pihak yang terlibat?`,
    `2. Apakah tindakan atau keputusan yang telah diambil setakat ini?`,
    `3. Apakah hasil yang awak harapkan untuk dicapai?`,
  ].join('\n') + jangan;
}

// ── Q2: Context-aware document recommendations ────────────────────────
function generateDocumentRecommendations(issue: string, lang: 'ms' | 'en' = 'ms'): string {
  const lower = issue.toLowerCase();

  const isTermination = /buang|pecat|resign|terminate|kerjasama|tamat|gaji|majikan|kerja/.test(lower);
  const isContract    = /kontrak|perjanjian|deal|agreement|bayar|hutang/.test(lower);
  const isProperty    = /hartanah|tanah|rumah|bangunan|property|developer|pemaju|konveyan/.test(lower);
  const isFamily      = /perkahwinan|cerai|anak|warisan|keluarga|pusaka|nafkah/.test(lower);

  let docsEn: string;
  let docsMs: string;

  if (isTermination) {
    docsEn = [
      `• Employment contract / Letter of Offer`,
      `• Termination letter or show-cause letter`,
      `• Last 3 months' payslips`,
      `• Any related emails or written warnings`,
      `• Attendance or performance records`,
    ].join('\n');
    docsMs = [
      `• Kontrak pekerjaan atau Surat Tawaran`,
      `• Surat penamatan atau surat tunjuk sebab`,
      `• Gaji 3 bulan terakhir`,
      `• Sebarang emel atau amaran bertulis`,
      `• Rekod kehadiran atau prestasi kerja`,
    ].join('\n');
  } else if (isContract) {
    docsEn = [
      `• Original contract or agreement`,
      `• Any amendments or addendums`,
      `• Proof of payment or transactions`,
      `• Related correspondence (emails, letters)`,
      `• Invoices or receipts`,
    ].join('\n');
    docsMs = [
      `• Kontrak atau perjanjian asal`,
      `• Pindaan atau lampiran tambahan`,
      `• Bukti pembayaran atau transaksi`,
      `• Surat-menyurat berkaitan (emel/surat)`,
      `• Invois atau resit`,
    ].join('\n');
  } else if (isProperty) {
    docsEn = [
      `• Sale & Purchase Agreement (SPA)`,
      `• Land title or ownership document`,
      `• Payment receipts (deposit, instalments)`,
      `• Correspondence with developer/seller/bank`,
      `• Bank loan statement (if applicable)`,
    ].join('\n');
    docsMs = [
      `• Perjanjian Jual Beli (SPA)`,
      `• Dokumen hak milik atau pemilikan hartanah`,
      `• Resit pembayaran (deposit, ansuran)`,
      `• Surat-menyurat dengan pemaju/penjual/bank`,
      `• Penyata pinjaman bank (jika berkaitan)`,
    ].join('\n');
  } else if (isFamily) {
    docsEn = [
      `• Marriage certificate`,
      `• Children's birth certificates (if relevant)`,
      `• Any existing court orders or agreements`,
      `• Joint asset documents (property, bank accounts)`,
      `• Will or inheritance documents (if relevant)`,
    ].join('\n');
    docsMs = [
      `• Sijil nikah`,
      `• Sijil kelahiran anak-anak (jika berkaitan)`,
      `• Sebarang perintah mahkamah atau perjanjian`,
      `• Dokumen aset bersama (hartanah, akaun bank)`,
      `• Surat wasiat atau dokumen warisan (jika berkaitan)`,
    ].join('\n');
  } else {
    docsEn = [
      `• Any contract or agreement related to the matter`,
      `• Proof of payment or transactions`,
      `• Related correspondence (emails, messages, letters)`,
      `• Identity document (MyKad)`,
      `• Any other relevant evidence or records`,
    ].join('\n');
    docsMs = [
      `• Sebarang kontrak atau perjanjian berkaitan`,
      `• Bukti pembayaran atau transaksi`,
      `• Surat-menyurat berkaitan (emel/mesej/surat)`,
      `• Dokumen pengenalan diri (MyKad)`,
      `• Sebarang bukti atau rekod lain yang berkaitan`,
    ].join('\n');
  }

  const docs = lang === 'ms' ? docsMs : docsEn;

  if (lang === 'ms') {
    return [
      `Berdasarkan kes awak, saya mengesyorkan awak mengumpulkan dokumen-dokumen berikut sebelum konsultasi dengan peguam:`,
      ``,
      docs,
      ``,
      `Sila cari dan sediakan dokumen-dokumen ini — ia akan mempercepatkan penilaian peguam terhadap kes awak. Taip "ok" atau beritahu saya jika ada pertanyaan tentang dokumen-dokumen tersebut.`,
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

// ── Language detection ────────────────────────────────────────────────
function detectLanguage(text: string): 'ms' | 'en' {
  const msWords = /\b(saya|anda|yang|untuk|dengan|tidak|ada|boleh|ini|itu|dan|atau|kepada|dari|dalam|pada|akan|sudah|pernah|juga|lebih|perlu|kami|kita|awak|dia|mereka|sebab|kerana|tetapi|tapi|macam|mana|bila|kalau|jika|dah|lah|kan|la|nak|bagi|oleh)\b/gi;
  const matches = text.match(msWords);
  return matches && matches.length >= 2 ? 'ms' : 'en';
}

/**
 * POST /api/donna-chat
 *
 * Intake flow (applies to both bridge and digital card):
 *   start → name_phone → email_opt → q1 → q2 → q3 → q4 → q5 → done
 *
 *   start      : Initial greeting, transitions to 'name_phone'
 *   name_phone : Collect full name + phone in one message
 *   email_opt  : Collect email (optional, "skip" allowed) — Malay
 *   q1         : Context-aware probing questions (Malay) — detects reply language
 *   q2         : Document recommendations (lang-aware)
 *   q3         : Share docs to lawyer email + case ref + consultation preference (lang-aware)
 *   q4         : Emergency / sooner appointment option (lang-aware)
 *   q5         : Final remarks — wrap up and submit (lang-aware)
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
        user: { select: { email: true, name: true } },
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
        } else {
          const lawyerDisplayName = profile.user?.name ?? null;
          const nameClause = lawyerDisplayName
            ? `pembantu digital Peguam ${lawyerDisplayName} bagi Firma ${firmName}`
            : `pembantu digital ${firmName}`;
          message = `Hi, Selamat Datang!\nSaya Donna, ${nameClause}.\n\nBoleh saya dapatkan nama penuh dan nombor telefon awak?`;
        }
        nextStep = 'name_phone';
        break;
      }

      // ── STEP 1: NAME + PHONE (combined) ───────────────────────
      case 'name_phone': {
        const raw = (userInput ?? '').trim();
        const phoneMatch = raw.match(/(\+?60|0)\d{8,10}/);
        if (!phoneMatch) {
          message = 'Sila berikan nama penuh dan nombor telefon awak. Contoh: Sharifah Adila 0123456789';
          nextStep = 'name_phone';
          break;
        }
        const phone = phoneMatch[0];
        const name  = raw.replace(phone, '').replace(/[,;]/g, '').trim();
        if (!name || name.length < 2) {
          message = 'Sila berikan nama penuh dan nombor telefon awak. Contoh: Sharifah Adila 0123456789';
          nextStep = 'name_phone';
          break;
        }
        updatedCollected.clientName  = name;
        updatedCollected.clientPhone = phone;
        message = `Baik! Boleh saya dapatkan alamat emel awak juga? (Taip "skip" jika awak tidak mahu berkongsi)`;
        nextStep = 'email_opt';
        break;
      }

      // ── STEP 3: EMAIL (OPTIONAL) ──────────────────────────────
      case 'email_opt': {
        const emailInput = (userInput ?? '').trim().toLowerCase();
        const skip       = emailInput === 'skip' || emailInput === '';
        const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput);

        if (!skip && !validEmail) {
          message = 'Sila masukkan alamat emel yang sah, atau taip "skip" untuk meneruskan. Terima kasih!';
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
          message = 'Sila berikan maklumat lebih lanjut untuk membantu peguam menilai kes awak. Cuba jawab semua soalan di atas.';
          nextStep = 'q1';
          break;
        }
        updatedCollected.issueSummary = answer;

        // Detect language from user's reply and persist for remaining steps
        const detectedLang = detectLanguage(answer);
        updatedCollected._lang = detectedLang;

        // Generate document recommendations based on issue context
        const issueForDocs = bridgeQuestion ?? answer;
        message = generateDocumentRecommendations(issueForDocs, detectedLang);
        nextStep = 'q2';
        break;
      }

      // ── Q2: USER ACKNOWLEDGES DOCUMENTS OR ASKS QUESTION ──────
      case 'q2': {
        const userResponse = (userInput ?? '').trim().toLowerCase();
        const lang2 = (collected._lang ?? 'ms') as 'ms' | 'en';

        // Check if user typed "ok" or just confirmed
        if (userResponse === 'ok') {
          // User confirmed documents, move to q3
          updatedCollected.docsAcknowledged = true;
          const emailLine = lawyerEmail
            ? `📧 **${lawyerEmail}**`
            : lang2 === 'ms'
              ? `📧 *(sila hubungi peguam terus)*`
              : `📧 *(please contact the lawyer directly)*`;

          const refLine = caseRef
            ? lang2 === 'ms'
              ? `Sila nyatakan **Rujukan Kes: ${caseRef}** dalam subjek emel awak.`
              : `Please include **Case Reference: ${caseRef}** in your email subject.`
            : ``;

          message = lang2 === 'ms'
            ? [
                `Apabila awak telah mengumpulkan dokumen, awak boleh menghantarnya terus kepada peguam di:`,
                ``,
                emailLine,
                refLine,
                ``,
                `Ini akan membantu peguam menyemak kes awak sebelum konsultasi.`,
                ``,
                `Sekarang, bila awak ada masa untuk berunding? Dan apakah mod pilihan awak:`,
                `• 📞 Panggilan telefon`,
                `• 💻 Mesyuarat video`,
                `• 🏢 Temujanji bersemuka`,
              ].filter(l => l !== undefined).join('\n')
            : [
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
        } else {
          // User asked a question — answer ONE (1) question only
          // Reference original question + lawyer's context
          const originalQuestion = bridgeQuestion ?? collected.issueSummary ?? '';
          let answerText = '';

          // Chain of Thought: Analyze the question
          if (userResponse.length > 0) {
            // Example: Handle document format questions
            if (userResponse.includes('asal') || userResponse.includes('original') ||
                userResponse.includes('fotokopi') || userResponse.includes('copy') ||
                userResponse.includes('gambar') || userResponse.includes('image')) {
              answerText = lang2 === 'ms'
                ? `Boleh, salinan digital atau gambar dokumen yang jelas sudah memadai untuk penilaian awal peguam. Seperti dalam Jawapan Peguam tadi, dokumen ini penting bagi mengesahkan konteks dalam Soalan Asal awak tentang "${originalQuestion.substring(0, 60)}...".\n\nSebarang soalan khusus saya mohon ajukan kepada peguam.`
                : `Yes, a clear digital copy or photo of the document is acceptable for the lawyer's initial assessment. As mentioned in the lawyer's previous response, this document is important for confirming the context of your original question about "${originalQuestion.substring(0, 60)}...".\n\nFor any specific questions, please ask the lawyer directly.`;
            } else {
              // Generic answer for other questions
              answerText = lang2 === 'ms'
                ? `Pertanyaan awak berkaitan dokumen-dokumen untuk kes awak tentang "${originalQuestion.substring(0, 60)}...". Peguam akan memberikan panduan lebih terperinci semasa konsultasi berdasarkan dokumen yang awak sediakan.\n\nSebarang soalan khusus saya mohon ajukan kepada peguam.`
                : `Your question is related to the documents needed for your case about "${originalQuestion.substring(0, 60)}...". The lawyer will provide more detailed guidance during the consultation based on the documents you prepare.\n\nFor any specific questions, please ask the lawyer directly.`;
            }

            message = answerText;
            // Auto-move to q3 after answering
            updatedCollected.docsAcknowledged = true;

            // Add closing + next question
            const nextQMessage = lang2 === 'ms'
              ? `\n\n---\n\nSekarang, bila awak ada masa untuk berunding? Dan apakah mod pilihan awak:\n• 📞 Panggilan telefon\n• 💻 Mesyuarat video\n• 🏢 Temujanji bersemuka`
              : `\n\n---\n\nNow, when are you available to consult? And what is your preferred mode:\n• 📞 Phone call\n• 💻 Video meeting\n• 🏢 In-person appointment`;

            message += nextQMessage;
            nextStep = 'q3';
          }
        }
        break;
      }

      // ── Q3: CONSULTATION PREFERENCE & AVAILABILITY ───────────
      case 'q3': {
        const preference = (userInput ?? '').trim();
        const lang3 = (collected._lang ?? 'ms') as 'ms' | 'en';
        if (!preference || preference.length < 2) {
          message = lang3 === 'ms'
            ? 'Sila beritahu saya ketersediaan dan mod konsultasi pilihan awak.'
            : 'Please let us know your availability and preferred consultation mode.';
          nextStep = 'q3';
          break;
        }
        updatedCollected.consultationPreference = preference;

        message = lang3 === 'ms'
          ? [
              `Faham. Satu lagi perkara — adakah awak perlukan ini diuruskan dengan segera?`,
              ``,
              `Saya boleh mengatur temujanji seawal mungkin, namun **yuran kecemasan** mungkin dikenakan.`,
              ``,
              `• Ya — Saya perlukan ini secepat mungkin`,
              `• Tidak — Tempoh standard adalah baik`,
            ].join('\n')
          : [
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

        const lang4 = (collected._lang ?? 'ms') as 'ms' | 'en';
        message = lang4 === 'ms'
          ? [
              `Terima kasih kerana berkongsi semua ini.`,
              ``,
              `Adakah ada lagi yang anda ingin peguam tahu, atau adakah anda berpuas hati dengan apa yang telah dikongsi? Sila tinggalkan sebarang catatan atau pertanyaan tambahan di bawah.`,
              ``,
              `*(Taip "tiada" jika tiada yang hendak ditambah)*`,
            ].join('\n')
          : [
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
        const lang5 = (collected._lang ?? 'ms') as 'ms' | 'en';
        updatedCollected.remarks = (remarks !== 'none' && remarks !== 'tiada') ? remarks : null;

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

        message = lang5 === 'ms'
          ? [
              `Terima kasih, ${updatedCollected.clientName ?? 'awak'}! Pertanyaan awak telah direkodkan.`,
              ``,
              `Peguam akan menyemak kes awak dan memberikan maklum balas dalam masa **5 hari bekerja**.`,
              ``,
              `Sementara itu, sila kumpulkan dokumen yang telah saya sebutkan dan hantarkan kepada peguam melalui emel dengan rujukan kes awak${caseRef ? ` **(${caseRef})**` : ''}.`,
            ].join('\n')
          : [
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
        message  = 'Sesi ini telah tamat. Terima kasih!';
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
