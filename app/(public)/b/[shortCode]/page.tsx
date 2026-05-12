import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBridgeByShortCode, updateChatPhase } from '@/lib/bridge';
import DonnaWidget from '@/components/DonnaWidget';
import LawyerAvatar from '@/components/LawyerAvatar';
import NasihatPeguam from '@/components/NasihatPeguam';

interface PageProps {
  params: Promise<{ shortCode: string }>;
}

export default async function BridgeIntakePage({ params }: PageProps) {
  const { shortCode } = await params;
  const bridge = await getBridgeByShortCode(shortCode);

  if (!bridge) notFound();
  if (bridge.status === 'DELETED') notFound();

  const isClosed = bridge.status === 'EXPIRED' || bridge.status === 'COMPLETED';

  // Greeting is served statically from initialGreeting — advance DB phase so
  // the first user message is processed as name_phone, not echoed as another greeting.
  if (!isClosed && bridge.chatPhase === 'start') {
    await updateChatPhase(bridge.id, 'name_phone');
  }

  const lawyerName = (bridge.profile as any).username || bridge.profile.user.name || 'Peguam';
  const position   = (bridge.profile as any).position as string | null | undefined;
  const firmName   = bridge.profile.firmName ?? 'firma guaman ini';
  const avatarUrl  = (bridge.profile as any).avatarUrl as string | null | undefined;
  const googleImage = bridge.profile.user.image as string | null | undefined;

  function shortSummary(text: string | null | undefined): string {
    if (!text) return '';
    const words = text.trim().split(/\s+/);
    if (words.length <= 8) return text.trim();
    return words.slice(0, 8).join(' ') + '...';
  }

  // Build the greeting shown inside Donna on start
  const initialGreeting = [
    `Hi, Selamat Datang!`,
    `Saya Donna, pembantu digital Peguam ${lawyerName} bagi Firma ${firmName}.`,
    bridge.initialQuestion
      ? `\nTadi awak ada ajukan soalan di Facebook TanyaPeguam berkaitan '${shortSummary(bridge.initialQuestion)}'.`
      : null,
    `\nUntuk membantu peguam menilai kes awak dengan lebih lanjut, boleh saya dapatkan nama penuh dan nombor telefon awak?`,
  ]
    .filter(Boolean)
    .join('\n');

  // Hydrate chat history from DB transcript so widget resumes where it left off.
  // Greeting is always the first message; existing turns are appended after.
  type WidgetMsg = { role: 'donna' | 'user'; text: string };
  const existingTurns = Array.isArray(bridge.chatTranscript)
    ? (bridge.chatTranscript as Array<{ role: string; content: string }>)
        .filter((t) => t.role === 'user' || t.role === 'assistant')
        .map((t): WidgetMsg => ({
          role: t.role === 'assistant' ? 'donna' : 'user',
          text: t.content,
        }))
    : [];
  const hydratedMessages: WidgetMsg[] = [
    { role: 'donna', text: initialGreeting },
    ...existingTurns,
  ];

  return (
    <div className="min-h-screen bg-black text-cream">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-cream/50 hover:text-purple-400 transition">
            ← TanyaPeguam
          </Link>
          <code className="text-xs text-cream/40 font-mono">Sesi: {bridge.shortCode}</code>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:items-start">

          {/* ── LEFT: Profile + Soalan Asal ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Lawyer Identity */}
            <div>
              <p className="text-[10px] text-cream/40 uppercase tracking-widest mb-4">
                Anda dijemput oleh
              </p>
              <LawyerAvatar
                avatarUrl={avatarUrl}
                googleImage={googleImage}
                name={lawyerName}
                size={72}
                className="rounded-2xl mb-3"
              />
              <h1 className="text-2xl font-bold text-cream mb-1">{lawyerName}</h1>
              {position && (
                <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest mb-1">
                  {position}
                </p>
              )}
              {firmName && (
                <p className="text-sm text-cream/55">{firmName}</p>
              )}
            </div>

            {/* Lawyer's Advice */}
            {bridge.initialAnswer && (
              <div>
                <NasihatPeguam text={bridge.initialAnswer} />

                {/* Link to lawyer's digital card */}
                <Link
                  href={`/${bridge.profile.slug}`}
                  className="group block w-full px-6 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition border border-purple-500/50"
                >
                  <div className="text-sm text-purple-200 mb-1">Lihat DigitalCard</div>
                  <div className="text-lg font-bold mb-2">{lawyerName}</div>
                  <div className="text-sm font-semibold text-purple-300 group-hover:text-white transition">
                    Klik Di Sini
                  </div>
                </Link>
              </div>
            )}

            {/* Closed state info */}
            {isClosed && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
                <p className="text-sm text-cream/70">
                  Sesi ini telah {bridge.status === 'COMPLETED' ? 'selesai' : 'tamat'}.
                </p>
                <p className="text-xs text-cream/40 mt-2">
                  Sila hubungi peguam terus, atau buat sesi baharu.
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT: Chat Box ── */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-white/10 overflow-hidden bg-black/60">
              {/* Chat area — notification is now inside DonnaWidget, shown/hidden based on step */}
              <div className="p-5">
                {isClosed ? (
                  <p className="text-center text-sm text-cream/50 py-6">
                    Sesi ini telah ditutup.
                  </p>
                ) : (
                  <DonnaWidget
                    slug={bridge.profile.slug}
                    bridgeId={bridge.id}
                    bridgeQuestion={bridge.initialQuestion ?? undefined}
                    initialGreeting={initialGreeting}
                    initialMessages={hydratedMessages}
                    embedded={true}
                    initialDone={bridge.chatPhase === 'done'}
                  />
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
