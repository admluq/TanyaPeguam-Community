import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/db';
import TypingIndicator from '@/components/TypingIndicator';

const CHIPS = [
  'Isu hartanah / konveyan',
  'Perceraian & keluarga',
  'Kes jenayah',
  'Kontrak perniagaan',
  'Isu pekerjaan',
  'Hutang & kebankrapan',
];

const STATS = [
  { value: '3',    label: 'Peguam Disahkan' },
  { value: '24/7', label: 'Donna AI Aktif' },
  { value: 'Free', label: 'Konsultasi Awal' },
];

export default async function HomePage() {
  const profiles = await prisma.profile.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 12,
    select: {
      slug: true, name: true, title: true, firm: true, firmFull: true,
      monogram: true, location: true, practiceAreas: true, status: true, isVerified: true,
    },
  });

  return (
    <div className="min-h-screen" style={{ background: '#06060a' }}>

      {/* ── Geometric background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full"
          style={{ border: '1px solid rgba(139,92,246,0.08)' }} />
        <div className="absolute top-8 left-8 w-52 h-52 rounded-full"
          style={{ border: '1px solid rgba(139,92,246,0.05)' }} />
        <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full"
          style={{ border: '1px solid rgba(139,92,246,0.07)' }} />
        <div className="absolute bottom-12 right-12 w-64 h-64 rounded-full"
          style={{ border: '1px solid rgba(212,168,83,0.05)' }} />
        {/* Subtle gradient blobs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(ellipse, #7c3aed, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(ellipse, #d4a853, transparent 70%)', filter: 'blur(40px)' }} />
        {/* Plus marks */}
        {[
          { top: '9rem', left: '5rem',  size: 24, color: 'rgba(139,92,246,0.9)', opacity: 0.2 },
          { top: '6rem', right: '8rem', size: 20, color: 'rgba(212,168,83,0.9)', opacity: 0.18 },
          { bottom: '10rem', left: '3.5rem', size: 28, color: 'rgba(139,92,246,0.9)', opacity: 0.13 },
          { bottom: '14rem', right: '6rem',  size: 22, color: 'rgba(139,92,246,0.9)', opacity: 0.17 },
        ].map((p, i) => (
          <div key={i} className="absolute" style={{ top: p.top, left: (p as any).left, right: (p as any).right, bottom: p.bottom, opacity: p.opacity }}>
            <div className="relative" style={{ width: p.size, height: p.size }}>
              <div className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2" style={{ background: p.color }} />
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2" style={{ background: p.color }} />
            </div>
          </div>
        ))}
        {/* Dot grids */}
        <div className="absolute top-1/2 left-6 -translate-y-1/2 grid grid-cols-3 gap-3 opacity-[0.08]">
          {[...Array(9)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full" style={{ background: 'rgba(139,92,246,0.9)' }} />)}
        </div>
        <div className="absolute top-1/3 right-6 grid grid-cols-3 gap-3 opacity-[0.08]">
          {[...Array(9)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full" style={{ background: 'rgba(212,168,83,0.9)' }} />)}
        </div>
      </div>

      {/* ── NAV ── */}
      <nav className="relative z-20" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 animate-fade-in">
            <Image src="/logo.png" alt="TanyaPeguam" width={36} height={36} className="rounded-md" />
            <span className="font-bold text-xl tracking-tight" style={{ color: '#ffffff' }}>TanyaPeguam</span>
            <span className="hidden sm:inline text-xs px-2.5 py-1 rounded-full font-semibold ml-1"
              style={{ background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}>
              Beta
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/admluq" className="text-lg hidden sm:block transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Untuk Peguam
            </Link>
            <Link href="https://app.tanyapeguam.com"
              className="text-lg font-semibold px-5 py-2.5 rounded-lg transition-all hover:opacity-90"
              style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}>
              Tanya Donna →
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* ── HERO ── */}
        <section className="py-16 lg:py-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left */}
          <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-medium mb-7"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.22)', color: '#a78bfa' }}>
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              Donna AI tersedia sekarang
            </div>

            <h1 className="font-display leading-[1.08] mb-5"
              style={{ fontSize: 'clamp(2.6rem, 5vw, 3.75rem)', color: '#ffffff', letterSpacing: '-0.01em' }}>
              Penyelesaian digital<br />
              untuk peguam{' '}
              <span style={{
                background: 'linear-gradient(135deg, #e8c07a, #d4a853)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontStyle: 'italic',
              }}>
                profesional
              </span>
            </h1>

            <p className="text-base leading-relaxed mb-10 max-w-md" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Kad perniagaan digital interaktif untuk peguam Malaysia —
              satu platform profesional untuk konsultasi, rujukan, dan
              khidmat undang-undang anda.
            </p>

            <div className="flex items-center gap-8">
              {STATS.map((s, i) => (
                <div key={i}>
                  <p className="text-2xl font-bold mb-0.5" style={{
                    background: 'linear-gradient(135deg, #e8c07a, #d4a853)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>{s.value}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Donna chat card */}
          <div className="animate-fade-up" style={{ animationDelay: '250ms' }}>
            <p className="text-base uppercase tracking-[0.2em] font-medium text-center mb-4"
              style={{ color: 'rgba(255,255,255,0.25)' }}>
              Pembantu Peribadi Peguam
            </p>
            <div className="lia-border-wrap shadow-[0_0_60px_rgba(124,58,237,0.1)]">
              <div className="lia-border-inner">

                {/* Header */}
                <div className="px-5 py-4 flex items-center gap-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(124,58,237,0.04)' }}>
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-base"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', boxShadow: '0 0 20px rgba(124,58,237,0.45)', fontFamily: 'Georgia, serif' }}>
                      D
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2" style={{ borderColor: '#12131f' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>Donna</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>AI Undang-Undang · TanyaPeguam</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400 font-medium">Dalam Talian</span>
                  </div>
                </div>

                {/* Chat body */}
                <div className="p-5 space-y-4">
                  {/* Message */}
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold text-white text-sm"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', fontFamily: 'Georgia, serif', boxShadow: '0 0 12px rgba(124,58,237,0.3)' }}>
                      D
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
                        style={{ background: 'rgba(124,58,237,0.09)', border: '1px solid rgba(124,58,237,0.14)', color: '#eee8dc' }}>
                        Selamat datang! 👋
                        <br /><br />
                        Saya <strong style={{ color: '#a78bfa' }}>Donna</strong>, pembantu peribadi Peguam anda.
                        <br /><br />
                        Saya boleh bantu anda tinggalkan pesanan kepada peguam atau atur temujanji.
                        <br /><br />
                        Apa yang saya boleh bantu hari ini?
                      </div>
                      <p className="text-[11px] ml-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Donna • Sekarang</p>
                    </div>
                  </div>

                  {/* Typing */}
                  <div className="flex gap-3 items-center">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 opacity-50 font-bold text-white text-sm"
                      style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.2)', fontFamily: 'Georgia, serif' }}>
                      D
                    </div>
                    <TypingIndicator />
                  </div>

                  {/* Chips */}
                  <div className="pl-11 flex flex-wrap gap-2">
                    {CHIPS.map((chip) => (
                      <button key={chip} className="chip">{chip}</button>
                    ))}
                  </div>

                  {/* Input */}
                  <Link href="https://app.tanyapeguam.com"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all group mt-1"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span className="flex-1 text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>Taip soalan anda di sini…</span>
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', boxShadow: '0 0 10px rgba(124,58,237,0.3)' }}>
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </Link>

                  <p className="text-center text-[11px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
                    Percuma · Sulit · Tanpa pendaftaran
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div id="peguam" className="flex justify-center mb-10">
          <div className="relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(139,92,246,0.08))',
              border: '1px solid rgba(124,58,237,0.45)',
              boxShadow: '0 0 32px rgba(124,58,237,0.25), 0 0 64px rgba(124,58,237,0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}>
            {/* Glow blob behind */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.15), transparent 70%)', filter: 'blur(8px)' }} />
            <span className="text-2xl relative z-10">💎</span>
            <p className="relative z-10 text-base font-bold uppercase tracking-[0.25em]"
              style={{ color: '#c4b5fd' }}>
              Peguam Berdaftar
            </p>
            <span className="text-2xl relative z-10">💎</span>
          </div>
        </div>

        {/* ── LAWYER GRID ── */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-24">
          {profiles.map((p, i) => (
            <Link key={p.slug} href={`/${p.slug}`}
              className="group rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 animate-fade-up hover:border-purple-600/30 hover:bg-purple-950/20"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                animationDelay: `${400 + i * 70}ms`,
              }}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-display text-base"
                  style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.18)', color: '#d4a853' }}>
                  {p.monogram ?? p.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm leading-tight truncate" style={{ color: '#ffffff' }}>{p.name}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{p.title}</p>
                </div>
                {p.isVerified && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5" style={{ color: '#7c3aed' }}>
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold truncate" style={{ color: '#d4a853' }}>{p.firmFull ?? p.firm}</p>
                <p className="text-xs flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.5 }}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                  </svg>
                  {p.location}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(p.practiceAreas as string[]).slice(0, 3).map((area) => (
                  <span key={area} className="text-[11px] px-2 py-0.5 rounded-md"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)' }}>
                    {area}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {p.status === 'AVAILABLE' ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#34d399' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Available
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: '#fb923c' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />Busy
                  </span>
                )}
                <span className="text-xs font-medium transition-colors group-hover:text-violet-400"
                  style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Lihat profil →
                </span>
              </div>
            </Link>
          ))}
        </section>
      </div>

      {/* ── FOOTER ── */}
      <footer className="relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="TanyaPeguam" width={18} height={18} className="rounded opacity-50" />
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              © 2025 <span style={{ color: '#d4a853' }}>TanyaPeguam.com</span> · D7 Holdings Sdn Bhd
            </p>
          </div>
          <div className="flex items-center gap-5 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            <Link href="#" className="hover:text-white transition-colors">Privasi</Link>
            <Link href="#" className="hover:text-white transition-colors">Terma</Link>
            <Link href="#" className="hover:text-white transition-colors">Hubungi Kami</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
