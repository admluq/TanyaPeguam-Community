import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response('Service unavailable', { status: 503 });
  }

  const { message, lawyerName, practiceAreas } = await req.json();

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const system = `Kamu adalah Lia, pembantu undang-undang AI yang bertugas membantu bakal klien ${lawyerName}, peguam pakar dalam ${(practiceAreas as string[]).join(', ')}.

Jawab dalam Bahasa Malaysia yang mesra, ringkas, dan profesional. Berikan maklumat umum yang berguna, dan galakkan pengguna untuk berhubung terus dengan ${lawyerName} untuk konsultasi lanjut.

Penting: Kamu memberikan maklumat umum sahaja — bukan nasihat undang-undang profesional. Sentiasa ingatkan pengguna untuk mendapatkan nasihat peguam untuk situasi spesifik mereka.`;

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-5',
    max_tokens: 512,
    system,
    messages: [{ role: 'user', content: message }],
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          controller.enqueue(new TextEncoder().encode(event.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
