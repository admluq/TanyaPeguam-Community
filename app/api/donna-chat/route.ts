import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/donna-chat
 * Stateless intake step handler.
 *
 * Body:
 *   slug        string  — lawyer's profile slug
 *   step        string  — current state: 'start'|'name'|'phone'|'area'|'issue'|'email'|'done'
 *   userInput   string? — what the user just said
 *   collected   object  — session state carried from client
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
    const { slug, step, userInput, collected = {} } = body;

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
        message = `${tone.greeting}\n\n${tone.prompt_name}`;
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
        message = `${tone.thanks}\n\n${tone.prompt_phone}`;
        nextStep = 'phone';
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
        message = `${tone.thanks}\n\n${tone.prompt_area}`;
        nextStep = 'area';
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

        // ── Submit to donna-inquiry POST ─────────────────────
        try {
          const submitRes = await fetch(
            `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/admin/donna-inquiry`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                profileId: profile.id,
                clientName: updatedCollected.clientName,
                clientEmail: updatedCollected.clientEmail,
                clientPhone: updatedCollected.clientPhone,
                practiceArea: updatedCollected.practiceArea,
                issueSummary: updatedCollected.issueSummary,
                transcript: JSON.stringify(collected._transcript ?? []),
              }),
            }
          );

          if (submitRes.ok) {
            const result = await submitRes.json();
            inquiryId = result.inquiryId;
          }
        } catch (submitErr) {
          console.error('Donna submit error:', submitErr);
        }

        message = tone.closing;
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
