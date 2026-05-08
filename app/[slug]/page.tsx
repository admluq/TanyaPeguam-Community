import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { ProfileHeader } from '@/components/profile/profile-header';
import { LinkCard } from '@/components/profile/link-card';
import { BookingCard } from '@/components/profile/booking-card';
import { ProfileFooter } from '@/components/profile/profile-footer';

export async function generateStaticParams() {
  const profiles = await prisma.profile.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return profiles.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const profile = await prisma.profile.findUnique({
    where: { slug: params.slug },
    select: { name: true, title: true, firm: true, location: true, bio: true, metaTitle: true, metaDescription: true },
  });
  if (!profile) return { title: 'Profil tidak dijumpai' };
  const title = profile.metaTitle ?? `${profile.name} — ${profile.title}`;
  const description = profile.metaDescription ?? profile.bio ?? `${profile.name}, ${profile.title} di ${profile.location}.`;
  return { title, description, openGraph: { title, description, type: 'profile' }, twitter: { card: 'summary', title, description } };
}

const SOCIAL_TYPES = ['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'TWITTER', 'LINKEDIN'];

export default async function ProfilePage({ params }: { params: { slug: string } }) {
  const profile = await prisma.profile.findUnique({
    where: { slug: params.slug, isActive: true },
    include: {
      links: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } },
    },
  });

  if (!profile) notFound();

  const socials   = profile.links.filter((l) => SOCIAL_TYPES.includes(l.type));
  const website   = profile.links.filter((l) => l.type === 'WEBSITE');
  const other     = profile.links.filter((l) => !['WHATSAPP', 'AI_CHAT', 'WEBSITE', ...SOCIAL_TYPES].includes(l.type));

  return (
    <main className="relative min-h-screen" style={{ background: '#06060a' }}>

      {/* ── Geometric background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full"
          style={{ border: '1px solid rgba(139,92,246,0.07)' }} />
        <div className="absolute top-8 left-8 w-52 h-52 rounded-full"
          style={{ border: '1px solid rgba(139,92,246,0.05)' }} />
        <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full"
          style={{ border: '1px solid rgba(139,92,246,0.06)' }} />
        <div className="absolute bottom-12 right-12 w-64 h-64 rounded-full"
          style={{ border: '1px solid rgba(212,168,83,0.04)' }} />
        {/* Gradient blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(ellipse, #7c3aed, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(ellipse, #d4a853, transparent 70%)', filter: 'blur(40px)' }} />
        {/* Plus marks */}
        <div className="absolute top-36 left-8 opacity-20">
          <div className="relative w-5 h-5">
            <div className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2" style={{ background: 'rgba(139,92,246,0.9)' }} />
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2" style={{ background: 'rgba(139,92,246,0.9)' }} />
          </div>
        </div>
        <div className="absolute top-24 right-8 opacity-15">
          <div className="relative w-5 h-5">
            <div className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2" style={{ background: 'rgba(212,168,83,0.9)' }} />
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2" style={{ background: 'rgba(212,168,83,0.9)' }} />
          </div>
        </div>
        <div className="absolute bottom-48 right-8 opacity-15">
          <div className="relative w-6 h-6">
            <div className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2" style={{ background: 'rgba(139,92,246,0.9)' }} />
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2" style={{ background: 'rgba(139,92,246,0.9)' }} />
          </div>
        </div>
        {/* Dot grids */}
        <div className="absolute top-1/3 left-3 grid grid-cols-3 gap-2.5 opacity-[0.07]">
          {[...Array(9)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full" style={{ background: 'rgba(139,92,246,0.9)' }} />)}
        </div>
        <div className="absolute top-2/3 right-3 grid grid-cols-3 gap-2.5 opacity-[0.07]">
          {[...Array(9)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full" style={{ background: 'rgba(212,168,83,0.9)' }} />)}
        </div>
      </div>

      <div className="relative max-w-md mx-auto px-5 py-12">

        {/* ── HEADER ── */}
        <ProfileHeader profile={profile} />

        <div className="mt-8 space-y-3">

          {/* ── GOOGLE REVIEW + MAPS ROW ── */}
          <div className="grid grid-cols-2 gap-3">
            {/* Google Review placeholder */}
            <div className="rounded-2xl p-4 flex flex-col items-center justify-center gap-2 min-h-[88px]"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < 4 ? '#fbbf24' : 'none'} stroke={i < 4 ? 'none' : '#3d3a4a'}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p className="text-xs font-medium" style={{ color: '#9490a0' }}>Google Review</p>
              <p className="text-[10px]" style={{ color: '#3d3a4a' }}>Tiada ulasan lagi</p>
            </div>

            {/* Google Maps placeholder */}
            <div className="rounded-2xl p-4 flex flex-col items-center justify-center gap-2 min-h-[88px]"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="rgba(212,168,83,0.3)" stroke="#d4a853" strokeWidth="1.5"/>
                <circle cx="12" cy="9" r="2.5" fill="#d4a853"/>
              </svg>
              <p className="text-xs font-medium" style={{ color: '#9490a0' }}>Lokasi Pejabat</p>
              <p className="text-[10px]" style={{ color: '#d4a853' }}>Lihat di Maps →</p>
            </div>
          </div>

          {/* 1. DONNA — always shown, primary contact method */}
          <BookingCard lawyerName={profile.name} />

          {/* 3. WEBSITE */}
          {website.map((link) => (
            <a
              key={link.id}
              href={link.url ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl transition-all group"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(99,102,241,0.05))',
                border: '1px solid rgba(99,102,241,0.22)',
              }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.8"/>
                  <path d="M2 12h20M12 2c-2.5 3-4 6.5-4 10s1.5 7 4 10M12 2c2.5 3 4 6.5 4 10s-1.5 7-4 10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base leading-tight" style={{ color: '#eee8dc' }}>{link.label}</p>
                {link.subtitle && (
                  <p className="text-xs mt-0.5" style={{ color: '#818cf8' }}>{link.subtitle}</p>
                )}
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 opacity-40 group-hover:opacity-80 transition-opacity">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          ))}

          {/* OTHER */}
          {other.map((link, i) => (
            <LinkCard key={link.id} link={link} animationDelay={`${i * 60}ms`} />
          ))}

          {/* 4. SOCIALS — always last */}
          {socials.length > 0 && (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {socials.map((link, i) => (
                <div key={link.id} style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <LinkCard link={link} />
                </div>
              ))}
            </div>
          )}

        </div>

        {/* ── FOOTER ── */}
        <ProfileFooter />
      </div>
    </main>
  );
}
