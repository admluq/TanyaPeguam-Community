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

// ── Q3/Q4 vetting helpers ─────────────────────────────────────────────

/** True when user input reads like a question rather than a direct answer */
function isClientQuestion(text: string): boolean {
  return /\?|apa(kah)?|bagaimana|boleh ke|berapa|macam mana|bila(kah)?|adakah|how|what|when|where|can i|is it|do i|will|how much|does|are there|kenapa|why|siapa|who/i.test(text);
}

/**
 * True when user has given a proper Q3 answer:
 * contains a time indicator OR a consultation mode.
 */
function hasConsultationAnswer(text: string): boolean {
  const hasTime = /pagi|petang|malam|morning|afternoon|evening|isnin|selasa|rabu|khamis|jumaat|sabtu|ahad|monday|tuesday|wednesday|thursday|friday|saturday|sunday|jam\s*\d|pukul|\d\s*:\s*\d\d|\d\s*am|\d\s*pm|next week|minggu depan|esok|tomorrow|hari ini|today|weekday|weekend|hujung minggu/i.test(text);
  const hasMode = /telefon|phone|call|video|zoom|google meet|teams|bersemuka|in.person|face.to.face|online|virtual|whatsapp|wechat/i.test(text);
  return hasTime || hasMode;
}

/**
 * True when user has given a proper Q4 urgency answer (yes/no variant).
 */
function hasUrgencyAnswer(text: string): boolean {
  return /\bya\b|\byes\b|\btidak\b|\bno\b|\bnope\b|\burgent\b|\burgency\b|\bkecemasan\b|\bstandard\b|\bbiasa\b|\bnormal\b|\bsegera\b|\bcepat\b|\bnot urgent\b|\btunggu\b|\bwait\b|\blambat\b/i.test(text);
}

/**
 * Build a contextual FAQ answer using lawyer profile + service config + donna KB.
 * Returns the answer + mandatory outro + the repeat question for the current step.
 */
function buildFAQAnswer(
  question: string,
  svc: Record<string, any> | null,
  donna: Record<string, any> | null,
  lawyerName: string,
  lang: 'ms' | 'en',
  repeatQ: string,
): string {
  const lower = question.toLowerCase();

  const isFeeQ    = /yuran|fee|bayar|berapa|cost|price|charge|how much|percuma|free|rm\s*\d|ringgit/i.test(lower);
  const isHoursQ  = /waktu|jam|bila|hours|time|when.*available|pukul|hari bekerja|working day|operating/i.test(lower);
  const isAreaQ   = /negeri|state|area|location|kawasan|mana|where.*office|where.*based/i.test(lower);
  const isModeQ   = /telefon|phone|video|zoom|bersemuka|physical|in.person|online|mode.*konsult/i.test(lower);

  let answer = '';

  if (isFeeQ) {
    const parts: string[] = [];
    if (lang === 'ms') {
      if (svc?.modKonsultasi === 'PERCUMA') {
        parts.push(`Konsultasi awal dengan ${lawyerName} adalah **PERCUMA**.`);
      } else if (svc?.yuranKonsultasi) {
        parts.push(`Yuran konsultasi standard adalah **RM${svc.yuranKonsultasi}**.`);
      }
      if (svc?.yuranVideoMeeting)       parts.push(`Video meeting: **RM${svc.yuranVideoMeeting}**`);
      if (svc?.yuranMeetingFizikal)     parts.push(`Temujanji bersemuka: **RM${svc.yuranMeetingFizikal}**`);
      if (svc?.yuranKecemasan)          parts.push(`Yuran kecemasan: **RM${svc.yuranKecemasan}**`);
      if (!parts.length) parts.push(`Sila hubungi ${lawyerName} terus untuk maklumat yuran terkini.`);
    } else {
      if (svc?.modKonsultasi === 'PERCUMA') {
        parts.push(`Initial consultation with ${lawyerName} is **FREE**.`);
      } else if (svc?.yuranKonsultasi) {
        parts.push(`Standard consultation fee is **RM${svc.yuranKonsultasi}**.`);
      }
      if (svc?.yuranVideoMeeting)       parts.push(`Video meeting: **RM${svc.yuranVideoMeeting}**`);
      if (svc?.yuranMeetingFizikal)     parts.push(`In-person appointment: **RM${svc.yuranMeetingFizikal}**`);
      if (svc?.yuranKecemasan)          parts.push(`Emergency fee: **RM${svc.yuranKecemasan}**`);
      if (!parts.length) parts.push(`Please contact ${lawyerName} directly for the latest fee information.`);
    }
    answer = parts.join('\n');

  } else if (isHoursQ) {
    const hours = svc?.waktuOperasi ?? null;
    answer = lang === 'ms'
      ? (hours ? `${lawyerName} beroperasi pada **${hours}**.` : `Sila hubungi ${lawyerName} terus untuk mengesahkan waktu operasi.`)
      : (hours ? `${lawyerName} operates on **${hours}**.` : `Please contact ${lawyerName} directly to confirm operating hours.`);

  } else if (isAreaQ) {
    const negeri = svc?.negeriOperasi ?? null;
    answer = lang === 'ms'
      ? (negeri ? `${lawyerName} beroperasi terutamanya di **${negeri}**.` : `Sila hubungi ${lawyerName} untuk mengetahui kawasan operasi.`)
      : (negeri ? `${lawyerName} operates primarily in **${negeri}**.` : `Please contact ${lawyerName} to find out their operating area.`);

  } else if (isModeQ) {
    const hasFee = svc?.yuranVideoMeeting || svc?.yuranMeetingFizikal;
    answer = lang === 'ms'
      ? `${lawyerName} menerima konsultasi melalui telefon, video meeting, dan temujanji bersemuka.${hasFee ? ` Yuran mungkin berbeza mengikut mod yang dipilih.` : ''}`
      : `${lawyerName} accepts consultations via phone, video meeting, and in-person appointment.${hasFee ? ` Fees may vary by mode.` : ''}`;

  } else if (donna?.kbContext) {
    // Fallback: use donna knowledge base
    const kb = (donna.kbContext as string).substring(0, 300);
    answer = lang === 'ms'
      ? `Berdasarkan maklumat yang saya ada: ${kb}${kb.length >= 300 ? '...' : ''}`
      : `Based on the information I have: ${kb}${kb.length >= 300 ? '...' : ''}`;

  } else {
    answer = lang === 'ms'
      ? `Saya tidak mempunyai maklumat spesifik tentang itu. Awak boleh tanya peguam terus semasa konsultasi.`
      : `I don't have specific information on that. You may ask the lawyer directly during consultation.`;
  }

  const outro = lang === 'ms'
    ? `Sebarang soalan khusus saya mohon ajukan kepada peguam.`
    : `For any specific questions, please ask the lawyer directly.`;

  return `${answer}\n\n${outro}\n\n---\n\n${repeatQ}`;
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

    // ── Load profile (full service config + donna config for FAQ handling) ──
    const profile = await db.lawyerProfile.findUnique({
      where: { slug },
      select: {
        id: true,
        firmName: true,
        position: true,
        bio: true,
        donnaConfig: {
          select: { personality: true, kbContext: true, triageRules: true },
        },
        legalServiceConfig: {
          select: {
            emelPertanyaan: true,
            waktuOperasi: true,
            modKonsultasi: true,
            yuranKonsultasi: true,
            yuranKecemasan: true,
            yuranVideoMeeting: true,
            yuranVideoMeetingKecemasan: true,
            yuranMeetingFizikal: true,
            yuranMeetingFizikalKecemasan: true,
            negeriOperasi: true,
          },
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
        const lawyerName3 = profile.user?.name ?? profile.firmName ?? 'peguam';
        const svc3 = profile.legalServiceConfig as Record<string, any> | null;
        const donna3 = profile.donnaConfig as Record<string, any> | null;

        const q3Question = lang3 === 'ms'
          ? [
              `Bila awak ada masa untuk berunding? Dan apakah mod pilihan awak:`,
              `• 📞 Panggilan telefon`,
              `• 💻 Mesyuarat video`,
              `• 🏢 Temujanji bersemuka`,
            ].join('\n')
          : [
              `When are you available to consult? And what is your preferred mode:`,
              `• 📞 Phone call`,
              `• 💻 Video meeting`,
              `• 🏢 In-person appointment`,
            ].join('\n');

        // Empty or too short — re-ask
        if (!preference || preference.length < 2) {
          message = q3Question;
          nextStep = 'q3';
          break;
        }

        // Client is asking a question — answer it then re-ask Q3
        if (isClientQuestion(preference) || !hasConsultationAnswer(preference)) {
          message = buildFAQAnswer(preference, svc3, donna3, lawyerName3, lang3, q3Question);
          nextStep = 'q3';
          break;
        }

        // Proper consultation answer — store and advance
        updatedCollected.consultationPreference = preference;

        const urgencyQ = lang3 === 'ms'
          ? [
              `Faham. Satu lagi perkara — adakah awak perlukan ini diuruskan dengan segera?`,
              ``,
              svc3?.yuranKecemasan
                ? `Yuran kecemasan adalah **RM${svc3.yuranKecemasan}**.`
                : `Yuran kecemasan mungkin dikenakan untuk temujanji segera.`,
              ``,
              `• Ya — Saya perlukan ini secepat mungkin`,
              `• Tidak — Tempoh standard adalah baik`,
            ].filter(Boolean).join('\n')
          : [
              `Understood. One more thing — do you need this handled urgently?`,
              ``,
              svc3?.yuranKecemasan
                ? `Emergency fee is **RM${svc3.yuranKecemasan}**.`
                : `A small emergency fee may apply for urgent appointments.`,
              ``,
              `• Yes — I need this as soon as possible`,
              `• No — standard timeline is fine`,
            ].filter(Boolean).join('\n');

        message  = urgencyQ;
        nextStep = 'q4';
        break;
      }

      // ── Q4: EMERGENCY / URGENCY OPTION ───────────────────────
      case 'q4': {
        const urgency = (userInput ?? '').trim();
        const lang4 = (collected._lang ?? 'ms') as 'ms' | 'en';
        const lawyerName4 = profile.user?.name ?? profile.firmName ?? 'peguam';
        const svc4 = profile.legalServiceConfig as Record<string, any> | null;
        const donna4 = profile.donnaConfig as Record<string, any> | null;

        const q4Question = lang4 === 'ms'
          ? [
              `Adakah awak perlukan ini diuruskan dengan segera?`,
              ``,
              svc4?.yuranKecemasan
                ? `Yuran kecemasan adalah **RM${svc4.yuranKecemasan}**.`
                : `Yuran kecemasan mungkin dikenakan untuk temujanji segera.`,
              ``,
              `• Ya — Saya perlukan ini secepat mungkin`,
              `• Tidak — Tempoh standard adalah baik`,
            ].filter(Boolean).join('\n')
          : [
              `Do you need this handled urgently?`,
              ``,
              svc4?.yuranKecemasan
                ? `Emergency fee is **RM${svc4.yuranKecemasan}**.`
                : `A small emergency fee may apply for urgent appointments.`,
              ``,
              `• Yes — I need this as soon as possible`,
              `• No — standard timeline is fine`,
            ].filter(Boolean).join('\n');

        // Empty — re-ask
        if (!urgency || urgency.length < 1) {
          message  = q4Question;
          nextStep = 'q4';
          break;
        }

        // Client is asking a question — answer it then re-ask Q4
        if (isClientQuestion(urgency) || !hasUrgencyAnswer(urgency)) {
          message  = buildFAQAnswer(urgency, svc4, donna4, lawyerName4, lang4, q4Question);
          nextStep = 'q4';
          break;
        }

        // Proper urgency answer — store and advance
        updatedCollected.urgencyPreference = urgency;

        message = lang4 === 'ms'
          ? [
              `Terima kasih kerana berkongsi semua ini.`,
              ``,
              `Adakah ada lagi yang awak ingin peguam tahu, atau adakah awak berpuas hati dengan apa yang telah dikongsi? Sila tinggalkan sebarang catatan atau pertanyaan tambahan di bawah.`,
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
