import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response('Service unavailable', { status: 503 });
  }

  const { message, lawyerName, practiceAreas, conversationHistory } = await req.json();

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const system = `Kamu adalah Lia, pembantu onboarding AI untuk ${lawyerName}, peguam pakar dalam ${(practiceAreas as string[]).join(', ')}.

TUJUAN UTAMA: Bantu pengguna membuat temujanji konsultasi berbayar dengan ${lawyerName} pada kadar RM20.

ALIRAN PERBUALAN:
1. Jika pengguna belum berikan nama, tanya nama mereka terlebih dahulu.
2. Tanya secara ringkas apakah isu undang-undang yang mereka hadapi (satu soalan sahaja).
3. Apabila kamu sudah tahu nama dan isu mereka, konfirmkan butiran dan beritahu mereka untuk klik butang WhatsApp di bawah untuk mengesahkan temujanji RM20.

PERATURAN PENTING:
- JANGAN memberi nasihat undang-undang atau menjawab soalan undang-undang secara terperinci.
- Jika pengguna tanya soalan undang-undang, jawab: "Soalan yang bagus — itulah sebabnya saya cadangkan anda berbincang terus dengan ${lawyerName} semasa sesi konsultasi RM20."
- Sentiasa fokus pada proses booking. Pendek dan mesra.
- Jawab dalam Bahasa Malaysia sahaja.
- Jangan tanya lebih dari satu soalan dalam satu masa.
- Apabila nama dan isu sudah diketahui, tutup perbualan dengan jelas dan minta pengguna klik butang WhatsApp.`;

  const history = (conversationHistory as { role: string; content: string }[] | undefined) ?? [];

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-5',
    max_tokens: 300,
    system,
    messages: [
      ...history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ],
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
