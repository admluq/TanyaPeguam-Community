import { NextRequest, NextResponse } from 'next/server';

// Simple HTML response shown when lawyer clicks accept/reject from email
export function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get('action');
  const name = req.nextUrl.searchParams.get('name') ?? 'pemanggil';

  const isAccept = action === 'accept';
  const html = `
    <!DOCTYPE html>
    <html lang="ms">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${isAccept ? 'Pertanyaan Diterima' : 'Pertanyaan Ditolak'}</title>
      <style>
        body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
               background: #0d0e17; font-family: system-ui, sans-serif; color: #eee8dc; }
        .card { background: #12131f; border: 1px solid rgba(255,255,255,0.07); border-radius: 20px;
                padding: 40px; max-width: 400px; text-align: center; }
        .icon { font-size: 40px; margin-bottom: 16px; }
        h1 { margin: 0 0 8px; font-size: 20px; font-weight: 600; }
        p { margin: 0; font-size: 14px; color: #9490a0; line-height: 1.6; }
        .color-accept { color: #34d399; }
        .color-reject { color: #f87171; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">${isAccept ? '✓' : '✕'}</div>
        <h1 class="${isAccept ? 'color-accept' : 'color-reject'}">
          ${isAccept ? 'Pertanyaan Diterima' : 'Pertanyaan Ditolak'}
        </h1>
        <p>Rekod untuk <strong>${name}</strong> telah dikemaskini. Tiada mesej dihantar kepada pemanggil.</p>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
}
