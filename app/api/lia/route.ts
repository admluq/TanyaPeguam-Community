import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  // Guard: API key must be configured
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'Lia AI belum dikonfigurasi.' },
      { status: 503 }
    );
  }

  try {
    const { messages, lawyerName, practiceAreas } = await req.json();

    if (!messages || !lawyerName) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    // ── System prompt — persona per lawyer ───────────────
    const system = `Anda adalah Lia, pembantu digital profesional untuk ${lawyerName}, seorang peguam berpengalaman di Malaysia.

Peranan anda:
- Jawab soalan undang-undang awam dalam Bahasa Malaysia dengan ringkas, tepat, dan mesra
- Fokus kepada undang-undang Malaysia: Akta Kerja 1955, Kanun Tanah Negara, Akta Kontrak 1950, Akta Syarikat 2016, prosedur mahkamah sivil, dll
- Sentiasa nyatakan disclaimer bahawa jawapan adalah maklumat umum sahaja, bukan nasihat guaman rasmi
- Galakkan pengguna untuk berhubung terus dengan ${lawyerName} jika mereka memerlukan perwakilan guaman
- Bidang kepakaran ${lawyerName}: ${(practiceAreas as string[]).join(', ')}
- Jika soalan di luar skop undang-undang, balas dengan sopan

Gaya jawapan: Ringkas (3–5 poin atau ayat), profesional, dan empati. Sentiasa akhiri dengan cadangan untuk menghubungi ${lawyerName} jika perlu bantuan lanjut.`;

    // ── Stream response from Claude ───────────────────────
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 600,
      system,
      messages,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } catch (err) {
          console.error('[Lia stream error]', err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store',
        'X-Accel-Buffering': 'no', // disable Nginx buffering for streaming
      },
    });
  } catch (err) {
    console.error('[Lia API error]', err);
    return NextResponse.json(
      { error: 'Ralat berlaku. Cuba semula.' },
      { status: 500 }
    );
  }
}
