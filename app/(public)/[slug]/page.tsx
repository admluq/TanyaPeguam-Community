'use client';

import { useEffect, useState } from 'react';
import LawyerAvatar from '@/components/LawyerAvatar';

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  whatsapp?: string;
}

const statusConfig: Record<string, { dot: string; label: string }> = {
  AVAILABLE: { dot: 'bg-green-400',  label: 'Available' },
  BUSY:      { dot: 'bg-yellow-400', label: 'Busy' },
  AWAY:      { dot: 'bg-orange-400', label: 'Away' },
  OFFLINE:   { dot: 'bg-gray-500',   label: 'Offline' },
};

export default function DigitalCardPage({ params }: { params: { slug: string } }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/digitalcard/${params.slug}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-cream/50 text-sm">
        Profil tidak dijumpai.
      </div>
    );
  }

  const displayName: string  = profile.username || profile.user?.name || 'Peguam';
  const socialLinks: SocialLinks = profile.socialLinks || {};
  const statusInfo = statusConfig[profile.status] || statusConfig.OFFLINE;

  return (
    <div className="min-h-screen bg-black text-cream">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/directory" className="text-sm text-cream/50 hover:text-purple-400 transition">
            ← TanyaPeguam
          </a>
          <span className="text-xs text-cream/30 font-mono">{params.slug}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ── LEFT: Identity ──────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Avatar + name block */}
            <div className="flex items-start gap-4">
              <LawyerAvatar
                avatarUrl={profile.avatarUrl}
                googleImage={profile.user?.image}
                name={displayName}
                size={64}
                className="rounded-2xl"
              />
              <div className="pt-1">
                <h1 className="text-2xl font-bold text-cream leading-tight">{displayName}</h1>
                {profile.position && (
                  <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest mt-1">
                    {profile.position}
                  </p>
                )}
                {profile.firmName && (
                  <p className="text-sm text-cream/55 mt-0.5">{profile.firmName}</p>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
              <span className="text-xs text-cream/60">{statusInfo.label}</span>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="border-t border-white/10 pt-5">
                <p className="text-sm text-cream/75 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Verified badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-900/10 w-fit">
              <span className="text-purple-400 text-xs">✦</span>
              <span className="text-xs text-purple-300 font-semibold">TanyaPeguam Verified</span>
            </div>
          </div>

          {/* ── RIGHT: Contact & Links ──────────────────────── */}
          <div className="lg:col-span-3 flex flex-col gap-5">

            <p className="text-[10px] text-cream/40 uppercase tracking-widest">Hubungi</p>

            {/* WhatsApp */}
            {socialLinks.whatsapp && (
              <a
                href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-4 rounded-xl border border-white/10 hover:border-green-500/40 hover:bg-green-900/10 transition group"
              >
                <span className="text-xl">💬</span>
                <div>
                  <p className="text-xs text-cream/40 mb-0.5">WhatsApp</p>
                  <p className="text-sm font-semibold text-cream group-hover:text-green-300 transition">
                    {socialLinks.whatsapp}
                  </p>
                </div>
              </a>
            )}

            {/* Firm website */}
            {profile.firmWebsite && (
              <a
                href={profile.firmWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-4 rounded-xl border border-white/10 hover:border-purple-500/40 hover:bg-purple-900/10 transition group"
              >
                <span className="text-xl">🌐</span>
                <div>
                  <p className="text-xs text-cream/40 mb-0.5">Laman Web</p>
                  <p className="text-sm font-semibold text-cream group-hover:text-purple-300 transition">
                    {profile.firmWebsite.replace(/^https?:\/\//, '')}
                  </p>
                </div>
              </a>
            )}

            {/* Google Maps */}
            {profile.googleMapsUrl && (
              <a
                href={profile.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-4 rounded-xl border border-white/10 hover:border-blue-500/40 hover:bg-blue-900/10 transition group"
              >
                <span className="text-xl">📍</span>
                <div>
                  <p className="text-xs text-cream/40 mb-0.5">Lokasi Firma</p>
                  <p className="text-sm font-semibold text-cream group-hover:text-blue-300 transition">
                    {profile.firmAddress || 'Lihat di Google Maps'}
                  </p>
                </div>
              </a>
            )}

            {/* Social icons row */}
            {(socialLinks.linkedin || socialLinks.facebook || socialLinks.instagram || socialLinks.tiktok) && (
              <div className="border-t border-white/10 pt-5">
                <p className="text-[10px] text-cream/40 uppercase tracking-widest mb-3">Media Sosial</p>
                <div className="flex gap-3">
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl border border-white/10 hover:border-blue-400/50 hover:bg-blue-900/20 flex items-center justify-center transition text-lg"
                      title="LinkedIn"
                    >
                      in
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl border border-white/10 hover:border-blue-500/50 hover:bg-blue-900/20 flex items-center justify-center transition text-sm font-bold text-blue-400"
                      title="Facebook"
                    >
                      f
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl border border-white/10 hover:border-pink-500/50 hover:bg-pink-900/20 flex items-center justify-center transition text-lg"
                      title="Instagram"
                    >
                      📸
                    </a>
                  )}
                  {socialLinks.tiktok && (
                    <a
                      href={socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/5 flex items-center justify-center transition text-lg"
                      title="TikTok"
                    >
                      🎵
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Google Review */}
            {profile.googleReviewUrl && (
              <div className="border-t border-white/10 pt-5">
                <a
                  href={profile.googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition"
                >
                  ⭐ Tinggalkan ulasan Google
                </a>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-white/10 mt-10 py-6 text-center">
        <p className="text-xs text-cream/25">🏛️ TanyaPeguam · Digital Card</p>
      </footer>

    </div>
  );
}
