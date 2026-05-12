import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/db';

const PRACTICE_AREAS = [
  'Isu hartanah / konveyan',
  'Perceraian & keluarga',
  'Kes jenayah',
  'Kontrak perniagaan',
  'Isu pekerjaan',
  'Hutang & kebankrapan',
];

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect('/profile');

  // Fetch count of public lawyer profiles
  let lawyerCount = 0;
  try {
    lawyerCount = await db.lawyerProfile.count({ where: { isPublic: true } });
  } catch { /* DB unreachable — show fallback */ }

  return (
    <div className="min-h-screen text-cream" style={{
      background: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)'
    }}>

      {/* Subtle decorative grid dots */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="relative flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Image
            src="/tanya-peguam-official-logo-removebg-preview.png"
            alt="TanyaPeguam"
            width={36}
            height={36}
            className="flex-shrink-0"
          />
          <span className="text-lg font-bold text-cream">TanyaPeguam</span>
          <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30 font-medium">
            Beta
          </span>
        </div>

        <Link href="/login">
          <button className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition text-sm border border-purple-500 shadow-lg shadow-purple-900/30">
            Untuk Peguam
          </button>
        </Link>
      </nav>

      {/* ── Hero Section ────────────────────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-73px)]">

        {/* Left Column */}
        <div>
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/25 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse flex-shrink-0" />
            <span className="text-sm text-purple-300 font-medium">Cuba Donna AI sekarang</span>
          </div>

          {/* Heading */}
          <h1 className="font-display font-bold leading-tight mb-6">
            <div className="text-3xl lg:text-4xl text-cream mb-2">
              Penyelesaian Digital Untuk
            </div>
            <div className="text-5xl lg:text-6xl italic text-gold-400">
              Peguam Profesional
            </div>
          </h1>

          {/* Subtitle */}
          <p className="text-cream/55 text-lg leading-relaxed mb-10 max-w-lg">
            Kad perniagaan digital interaktif untuk peguam Malaysia —
            satu platform profesional untuk konsultasi, rujukan, dan
            khidmat undang-undang anda.
          </p>

          {/* Stats Row */}
          <div className="flex items-center gap-10 mb-6">
            <div>
              <p className="text-3xl font-bold text-gold-400">{lawyerCount}</p>
              <p className="text-xs text-cream/35 mt-1">Peguam Disahkan</p>
            </div>
            <div className="w-px h-10 bg-white/8" />
            <div>
              <p className="text-3xl font-bold text-gold-400">24/7</p>
              <p className="text-xs text-cream/35 mt-1">Donna AI Aktif</p>
            </div>
            <div className="w-px h-10 bg-white/8" />
            <div>
              <p className="text-3xl font-bold text-gold-400">Free</p>
              <p className="text-xs text-cream/35 mt-1">Konsultasi Awal</p>
            </div>
          </div>

          {/* Full-Width Directory Button */}
          <Link href="/directory">
            <button className="w-full px-8 py-4 bg-purple-600 border-2 border-purple-400 text-white font-bold rounded-lg transition text-lg tracking-wide shadow-lg hover:shadow-[0_0_30px_rgba(168,85,245,0.8)] hover:bg-purple-500">
              Lihat Peguam Berdaftar →
            </button>
          </Link>
        </div>

        {/* Right Column — Donna Demo Widget */}
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-cream/25 uppercase text-center mb-5">
            Pembantu Peribadi Peguam
          </p>

          <div className="rounded-2xl border border-white/8 overflow-hidden shadow-2xl shadow-black/60 bg-ink-100">

            {/* Widget Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-ink-200">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    D
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-ink-200" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-cream">Donna</p>
                  <p className="text-xs text-cream/40">AI Undang-Undang · TanyaPeguam</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs text-green-400 font-medium">Dalam Talian</span>
              </div>
            </div>

            {/* Messages */}
            <div className="p-4 space-y-3 bg-ink-100">
              {/* Donna message */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-1">
                  D
                </div>
                <div className="bg-ink-300 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
                  <p className="text-sm text-cream/90">Selamat datang! 👋</p>
                  <p className="text-sm text-cream/90 mt-1.5">
                    Saya <span className="text-purple-400 font-medium">Donna</span>, pembantu peribadi Peguam anda.
                  </p>
                  <p className="text-sm text-cream/90 mt-1.5">
                    Saya boleh bantu anda tinggalkan pesanan kepada peguam atau atur temujanji.
                  </p>
                  <p className="text-sm text-cream/90 mt-1.5">
                    Apa yang saya boleh bantu hari ini?
                  </p>
                  <p className="text-[10px] text-cream/25 mt-2">Donna • Sekarang</p>
                </div>
              </div>

              {/* Typing indicator */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  D
                </div>
                <div className="bg-ink-300 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cream/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cream/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cream/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>

              {/* Practice area chips */}
              <div className="flex flex-wrap gap-2 pl-11">
                {PRACTICE_AREAS.map((area) => (
                  <span
                    key={area}
                    className="px-3 py-1 text-xs bg-ink-200 border border-white/8 rounded-full text-cream/60"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div className="px-4 py-3 border-t border-white/5 bg-ink-200 flex items-center gap-3">
              <span className="flex-1 text-sm text-cream/30 select-none">Taip soalan anda di sini...</span>
              <div className="w-8 h-8 rounded-lg bg-purple-600/60 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">→</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
