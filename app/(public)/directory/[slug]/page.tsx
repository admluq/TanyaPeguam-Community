import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 60;

const statusStyle: Record<string, { dot: string; label: string; bg: string; border: string }> = {
  AVAILABLE: { dot: 'bg-green-400',  label: 'Available', bg: 'bg-green-900/30',  border: 'border-green-500/30' },
  BUSY:      { dot: 'bg-yellow-400', label: 'Busy',      bg: 'bg-yellow-900/30', border: 'border-yellow-500/30' },
  AWAY:      { dot: 'bg-orange-400', label: 'Away',      bg: 'bg-orange-900/30', border: 'border-orange-500/30' },
  OFFLINE:   { dot: 'bg-red-400',   label: 'Offline',   bg: 'bg-red-900/30',    border: 'border-red-500/30' },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const profile = await db.lawyerProfile.findUnique({
    where: { slug: params.slug },
    select: { username: true, bio: true, user: { select: { name: true } } },
  });
  if (!profile) return { title: 'Lawyer not found' };
  const name = profile.username || profile.user?.name || 'Lawyer';
  return {
    title: `${name} | TanyaPeguam Directory`,
    description: profile.bio || `Lawyer profile on TanyaPeguam`,
  };
}

export async function generateStaticParams() {
  const profiles = await db.lawyerProfile.findMany({
    where: { isPublic: true },
    select: { slug: true },
  });
  return profiles.map((p) => ({ slug: p.slug }));
}

export default async function LawyerProfilePage({ params }: { params: { slug: string } }) {
  const profile = await db.lawyerProfile.findUnique({
    where: { slug: params.slug },
    select: {
      slug: true,
      username: true,
      position: true,
      firmName: true,
      bio: true,
      status: true,
      firmWebsite: true,
      googleMapsUrl: true,
      socialLinks: true,
      isPublic: true,
      donnaConfig: { select: { id: true } },
      user: { select: { name: true } },
    },
  });

  if (!profile || !profile.isPublic) notFound();

  const st = statusStyle[profile.status] ?? statusStyle.OFFLINE;
  const social = (profile.socialLinks as Record<string, string>) ?? {};

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/directory" className="text-purple-400 hover:text-purple-300 mb-8 inline-block text-sm">
          ← Back to Directory
        </Link>

        {/* Profile Card */}
        <div className="border border-white/10 rounded-lg p-8 mb-6 bg-black">

          {/* Identity block */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-cream mb-3">
              {profile.username || profile.user?.name || 'Lawyer'}
            </h1>

            {/* Position */}
            {profile.position && (
              <p className="text-sm text-purple-400 font-semibold uppercase tracking-widest mb-2">
                {profile.position}
              </p>
            )}

            {/* Firm Name */}
            {profile.firmName && (
              <p className="text-lg text-cream/70 mb-3">{profile.firmName}</p>
            )}

            {/* Status */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${st.bg} ${st.border}`}>
              <div className={`w-2 h-2 rounded-full ${st.dot} animate-pulse`} />
              <span className="text-sm text-cream/80 font-medium">{st.label}</span>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mb-8 pb-8 border-b border-white/10">
              <p className="text-cream/80 text-lg leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Contact & Socials */}
          {(social.whatsapp || social.linkedin || social.facebook || social.instagram || social.tiktok || profile.firmWebsite || profile.googleMapsUrl) && (
            <div className="space-y-3">
              {/* WhatsApp */}
              {social.whatsapp && (
                <a
                  href={`https://wa.me/${social.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-white/10 hover:border-green-500/50 rounded-lg text-cream/80 hover:text-cream transition bg-white/[0.03]"
                >
                  <span className="text-xl">💬</span>
                  <div className="flex-1">
                    <p className="text-xs text-cream/40 mb-0.5">WhatsApp</p>
                    <p className="font-medium">{social.whatsapp}</p>
                  </div>
                  <span className="text-white/30 text-sm">→</span>
                </a>
              )}

              {/* Website */}
              {profile.firmWebsite && (
                <a
                  href={profile.firmWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-white/10 hover:border-purple-500/50 rounded-lg text-cream/80 hover:text-cream transition bg-white/[0.03]"
                >
                  <span className="text-xl">🌐</span>
                  <div className="flex-1">
                    <p className="text-xs text-cream/40 mb-0.5">Laman Web</p>
                    <p className="font-medium">{profile.firmWebsite}</p>
                  </div>
                  <span className="text-white/30 text-sm">→</span>
                </a>
              )}

              {/* Google Maps */}
              {profile.googleMapsUrl && (
                <a
                  href={profile.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-white/10 hover:border-blue-500/50 rounded-lg text-cream/80 hover:text-cream transition bg-white/[0.03]"
                >
                  <span className="text-xl">📍</span>
                  <div className="flex-1">
                    <p className="text-xs text-cream/40 mb-0.5">Google Maps</p>
                    <p className="font-medium">Lihat Lokasi</p>
                  </div>
                  <span className="text-white/30 text-sm">→</span>
                </a>
              )}

              {/* LinkedIn */}
              {social.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-white/10 hover:border-blue-400/50 rounded-lg text-cream/80 hover:text-cream transition bg-white/[0.03]"
                >
                  <span className="text-xl">💼</span>
                  <div className="flex-1">
                    <p className="text-xs text-cream/40 mb-0.5">LinkedIn</p>
                    <p className="font-medium">View Profile</p>
                  </div>
                  <span className="text-white/30 text-sm">→</span>
                </a>
              )}

              {/* Facebook */}
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-white/10 hover:border-blue-600/50 rounded-lg text-cream/80 hover:text-cream transition bg-white/[0.03]"
                >
                  <span className="text-xl">📘</span>
                  <div className="flex-1">
                    <p className="text-xs text-cream/40 mb-0.5">Facebook</p>
                    <p className="font-medium">Visit Page</p>
                  </div>
                  <span className="text-white/30 text-sm">→</span>
                </a>
              )}

              {/* Instagram */}
              {social.instagram && (
                <a
                  href={social.instagram.startsWith('http') ? social.instagram : `https://instagram.com/${social.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-white/10 hover:border-pink-500/50 rounded-lg text-cream/80 hover:text-cream transition bg-white/[0.03]"
                >
                  <span className="text-xl">📷</span>
                  <div className="flex-1">
                    <p className="text-xs text-cream/40 mb-0.5">Instagram</p>
                    <p className="font-medium">{social.instagram}</p>
                  </div>
                  <span className="text-white/30 text-sm">→</span>
                </a>
              )}

              {/* TikTok */}
              {social.tiktok && (
                <a
                  href={social.tiktok.startsWith('http') ? social.tiktok : `https://tiktok.com/@${social.tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-white/10 hover:border-white/30 rounded-lg text-cream/80 hover:text-cream transition bg-white/[0.03]"
                >
                  <span className="text-xl">🎵</span>
                  <div className="flex-1">
                    <p className="text-xs text-cream/40 mb-0.5">TikTok</p>
                    <p className="font-medium">{social.tiktok}</p>
                  </div>
                  <span className="text-white/30 text-sm">→</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
