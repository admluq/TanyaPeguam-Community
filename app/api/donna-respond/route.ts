import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/donna-respond?token=<token>&action=accept|reject
 *
 * Magic link handler — silently updates inquiry status when the
 * lawyer clicks Accept or Reject in the email notification.
 *
 * No login required. Token is single-use proof of intent.
 * Returns a minimal HTML confirmation page (no client JS needed).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const action = searchParams.get('action');

  if (!token || !action || !['accept', 'reject'].includes(action)) {
    return htmlResponse('❌ Pautan Tidak Sah', 'Pautan ini tidak sah atau telah tamat tempoh.', '#f87171');
  }

  try {
    // Look up by the correct token field
    const isAccept = action === 'accept';
    const inquiry = await db.donnaInquiry.findFirst({
      where: isAccept ? { acceptToken: token } : { rejectToken: token },
      select: { id: true, status: true, clientName: true },
    });

    if (!inquiry) {
      return htmlResponse('❌ Pertanyaan Tidak Dijumpai', 'Token tidak sepadan dengan mana-mana pertanyaan.', '#f87171');
    }

    // Already actioned — idempotent, just confirm
    if (inquiry.status === 'ACCEPTED' || inquiry.status === 'REJECTED') {
      const alreadyLabel = inquiry.status === 'ACCEPTED' ? 'diterima' : 'ditolak';
      return htmlResponse(
        '✓ Sudah Diproses',
        `Pertanyaan ini telah ${alreadyLabel} sebelum ini.`,
        '#9490a0'
      );
    }

    // Update status
    await db.donnaInquiry.update({
      where: { id: inquiry.id },
      data: {
        status: isAccept ? 'ACCEPTED' : 'REJECTED',
        acceptedAt: isAccept ? new Date() : undefined,
        rejectedAt: isAccept ? undefined : new Date(),
      },
    });

    const clientLabel = inquiry.clientName ?? 'Pertanyaan ini';
    return isAccept
      ? htmlResponse('✓ Pertanyaan Diterima', `${clientLabel} telah ditandakan sebagai Diterima. Sila hubungi mereka secepat mungkin.`, '#34d399')
      : htmlResponse('Pertanyaan Ditolak', `${clientLabel} telah ditandakan sebagai Ditolak.`, '#9490a0');
  } catch (error) {
    console.error('donna-respond error:', error);
    return htmlResponse('Ralat', 'Terdapat masalah semasa memproses respons anda. Sila cuba lagi.', '#f87171');
  }
}

function htmlResponse(title: string, message: string, accentColor: string) {
  const html = `<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — Donna AI</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0d0e17;
      color: #eee8dc;
      font-family: Inter, system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #12131f;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 20px;
      padding: 48px 40px;
      max-width: 420px;
      width: 100%;
      text-align: center;
    }
    .accent { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 600; color: ${accentColor}; margin-bottom: 12px; }
    p { font-size: 15px; color: #9490a0; line-height: 1.6; margin-bottom: 28px; }
    a {
      display: inline-block;
      background: #1d1e2e;
      color: #eee8dc;
      font-size: 13px;
      font-weight: 600;
      padding: 10px 20px;
      border-radius: 10px;
      text-decoration: none;
      border: 1px solid rgba(255,255,255,0.08);
    }
    a:hover { border-color: ${accentColor}; }
    .brand { margin-top: 32px; font-size: 11px; color: #5e5a6e; letter-spacing: 0.1em; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="card">
    <div class="accent">⚖️</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/bridges">Lihat Semua Pertanyaan →</a>
    <div class="brand">Donna AI · TanyaPeguam</div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
