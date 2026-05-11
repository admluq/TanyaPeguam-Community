import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBridgeByShortCode } from '@/lib/bridge';
import DonnaWidget from '@/components/DonnaWidget';

interface PageProps {
  params: Promise<{ shortCode: string }>;
}

export default async function BridgeIntakePage({ params }: PageProps) {
  const { shortCode } = await params;
  const bridge = await getBridgeByShortCode(shortCode);

  if (!bridge) notFound();
  if (bridge.status === 'DELETED') notFound();

  const isClosed = bridge.status === 'EXPIRED' || bridge.status === 'COMPLETED';

  const lawyerName = (bridge.profile as any).username || bridge.profile.user.name || 'Peguam';
  const position   = (bridge.profile as any).position as string | null | undefined;
  const firmName   = bridge.profile.firmName ?? 'firma guaman ini';

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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── LEFT: Profile + Soalan Asal ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Lawyer Identity */}
            <div>
              <p className="text-[10px] text-cream/40 uppercase tracking-widest mb-3">
                Anda dijemput oleh
              </p>
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

            {/* Soalan Asal */}
            {bridge.initialQuestion && (
              <div>
                <div className="rounded-xl border border-purple-500/25 bg-purple-900/10 p-5 mb-4">
                  <p className="text-[10px] text-purple-400 uppercase tracking-widest font-semibold mb-3">
                    Soalan Asal
                  </p>
                  <p className="text-sm text-cream/85 whitespace-pre-wrap leading-relaxed">
                    {bridge.initialQuestion}
                  </p>
                </div>

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
                    initialMessages={[{ role: 'donna', text: initialGreeting }]}
                    embedded={true}
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
