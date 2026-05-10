import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

type InquiryEmailOptions = {
  to: string;
  lawyerName: string;
  callerName: string | null;
  callerPhone: string | null;
  callerEmail: string | null;
  practiceArea: string | null;
  issueSummary: string;
  concreteScore: number;
  urgencyTag: string;
  conversionTier: string;
  tierLabel: string;
  acceptUrl: string;
  rejectUrl: string;
};

export async function sendInquiryEmail(opts: InquiryEmailOptions) {
  const urgencyColor: Record<string, string> = {
    STANDARD: '#9490a0',
    MEDIUM: '#fb923c',
    HIGH: '#f87171',
    CRITICAL: '#ef4444',
  };

  const tierColor: Record<string, string> = {
    LOW: '#34d399',
    MED: '#818cf8',
    HIGH: '#d4a853',
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="margin:0;padding:0;background:#0d0e17;font-family:Inter,system-ui,sans-serif;color:#eee8dc;">
      <div style="max-width:560px;margin:0 auto;padding:32px 24px;">

        <div style="margin-bottom:24px;">
          <span style="font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#9490a0;">DONNA AI</span>
          <h1 style="margin:8px 0 4px;font-size:22px;font-weight:600;color:#eee8dc;">Pertanyaan Baharu</h1>
          <p style="margin:0;font-size:14px;color:#9490a0;">Ringkasan pertanyaan yang diterima Donna untuk ${opts.lawyerName}</p>
        </div>

        <div style="background:#12131f;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:24px;margin-bottom:16px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#5e5a6e;width:130px;">Nama</td>
            <td style="padding:6px 0;font-size:14px;color:#eee8dc;">${opts.callerName ?? '—'}</td></tr>
            <tr><td style="padding:6px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#5e5a6e;">Telefon</td>
            <td style="padding:6px 0;font-size:14px;color:#eee8dc;">${opts.callerPhone ?? '—'}</td></tr>
            <tr><td style="padding:6px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#5e5a6e;">E-mel</td>
            <td style="padding:6px 0;font-size:14px;color:#eee8dc;">${opts.callerEmail ?? '—'}</td></tr>
            <tr><td style="padding:6px 0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#5e5a6e;">Kawasan</td>
            <td style="padding:6px 0;font-size:14px;color:#eee8dc;">${opts.practiceArea ?? '—'}</td></tr>
          </table>
        </div>

        <div style="background:#12131f;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:24px;margin-bottom:16px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#5e5a6e;">Ringkasan Isu</p>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#eee8dc;">${opts.issueSummary}</p>
        </div>

        <div style="background:#12131f;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:20px;margin-bottom:24px;display:flex;gap:20px;">
          <div style="flex:1;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#5e5a6e;">Skor Konkrit</p>
            <p style="margin:0;font-size:24px;font-weight:700;color:#818cf8;">${opts.concreteScore}/10</p>
          </div>
          <div style="flex:1;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#5e5a6e;">Kemendesakan</p>
            <p style="margin:0;font-size:16px;font-weight:700;color:${urgencyColor[opts.urgencyTag] ?? '#9490a0'};">${opts.urgencyTag}</p>
          </div>
          <div style="flex:1;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#5e5a6e;">Tier Dicadang</p>
            <p style="margin:0;font-size:16px;font-weight:700;color:${tierColor[opts.conversionTier] ?? '#9490a0'};">${opts.tierLabel}</p>
          </div>
        </div>

        <div style="display:flex;gap:12px;margin-bottom:32px;">
          <a href="${opts.acceptUrl}" style="flex:1;display:block;text-align:center;background:#34d399;color:#0d0e17;font-weight:700;font-size:14px;padding:14px;border-radius:12px;text-decoration:none;">
            ✓ Terima Pertanyaan
          </a>
          <a href="${opts.rejectUrl}" style="flex:1;display:block;text-align:center;background:#1d1e2e;color:#f87171;font-weight:600;font-size:14px;padding:14px;border-radius:12px;text-decoration:none;border:1px solid rgba(248,113,113,0.2);">
            ✕ Tolak
          </a>
        </div>

        <p style="font-size:11px;color:#5e5a6e;text-align:center;margin:0;">
          Menekan butang tidak menghantar sebarang mesej kepada pemanggil.<br/>
          Ini hanya untuk rekod peribadi anda.
        </p>

      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Donna AI" <${process.env.SMTP_USER}>`,
      to: opts.to,
      subject: `[Donna] Pertanyaan Baharu — ${opts.callerName ?? 'Tidak Dikenali'} · ${opts.practiceArea ?? 'Umum'}`,
      html,
    });
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}
