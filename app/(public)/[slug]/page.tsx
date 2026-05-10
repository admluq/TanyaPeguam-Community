'use client';

import { useEffect, useState } from 'react';

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  whatsapp?: string;
  [key: string]: string | undefined;
}

const socialIcons: Record<string, { icon: string; color: string; label: string }> = {
  facebook: { icon: '📘', color: 'bg-blue-900', label: 'Facebook' },
  instagram: { icon: '📷', color: 'bg-pink-900', label: 'Instagram' },
  tiktok: { icon: '🎵', color: 'bg-black', label: 'TikTok' },
  linkedin: { icon: '💼', color: 'bg-blue-800', label: 'LinkedIn' },
  whatsapp: { icon: '💬', color: 'bg-green-900', label: 'WhatsApp' },
};

const statusColors: Record<string, { bg: string; dot: string; label: string }> = {
  AVAILABLE: { bg: 'bg-green-900', dot: 'bg-green-400', label: 'Available' },
  BUSY: { bg: 'bg-yellow-900', dot: 'bg-yellow-400', label: 'Busy' },
  AWAY: { bg: 'bg-orange-900', dot: 'bg-orange-400', label: 'Away' },
  OFFLINE: { bg: 'bg-gray-700', dot: 'bg-gray-400', label: 'Offline' },
};

export default function DigitalCardPage({ params }: { params: { slug: string } }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`/api/digitalcard/${params.slug}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white">Loading Digital Card...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white">Profile not found</div>
      </div>
    );
  }

  const socialLinks: SocialLinks = profile.socialLinks || {};
  const statusInfo = statusColors[profile.status] || statusColors.OFFLINE;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Digital Card Container */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-gold/30 p-8 shadow-2xl">
          {/* Logo/Avatar Section */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto rounded-full border-2 border-gold/60 flex items-center justify-center bg-gradient-to-br from-gold/20 to-transparent mb-4">
              <span className="text-3xl font-bold text-gold">
                {profile.username?.substring(0, 2).toUpperCase() || 'AA'}
              </span>
            </div>
            <div className="text-xs text-gold mb-1">• Terdaftar •</div>
          </div>

          {/* PEGUAM SECTION */}
          <div className="mb-6 pb-6 border-b border-slate-700">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Peguam</h2>

            <h1 className="text-2xl font-bold text-white mb-2">{profile.user?.name || 'Lawyer'}</h1>

            {profile.username && (
              <p className="text-sm text-gray-400 mb-3">@{profile.username}</p>
            )}

            <div className="flex items-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${statusInfo.dot}`}></div>
              <span className="text-xs font-semibold text-gray-300">{statusInfo.label}</span>
            </div>

            {profile.phone && (
              <a
                href={`https://wa.me/${profile.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 mb-3 p-3 bg-green-900/30 hover:bg-green-900/50 rounded-lg transition"
              >
                <span className="text-lg">💬</span>
                <div>
                  <p className="text-xs text-gray-400">Hubungi Saya</p>
                  <p className="text-sm text-green-400">{profile.phone}</p>
                </div>
              </a>
            )}

            {profile.bio && (
              <p className="text-sm text-gray-300 leading-relaxed">{profile.bio}</p>
            )}
          </div>

          {/* FIRMA SECTION */}
          {(profile.firmName || profile.firmPhone || profile.firmWebsite || profile.firmAddress) && (
            <div className="mb-6 pb-6 border-b border-slate-700">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Firma</h3>

              {profile.firmName && (
                <h4 className="text-lg font-bold text-white mb-3">{profile.firmName}</h4>
              )}

              {profile.firmPhone && (
                <p className="text-sm text-gray-300 mb-2">📞 {profile.firmPhone}</p>
              )}

              {profile.firmWebsite && (
                <a
                  href={profile.firmWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 mb-2 block"
                >
                  🌐 {profile.firmWebsite}
                </a>
              )}

              {profile.firmAddress && (
                <p className="text-sm text-gray-300 mb-3">{profile.firmAddress}</p>
              )}

              <div className="grid grid-cols-2 gap-2">
                {profile.googleMapsUrl && (
                  <a
                    href={profile.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs p-2 bg-orange-900/30 hover:bg-orange-900/50 rounded text-orange-300 transition text-center"
                  >
                    📍 Lihat di Maps
                  </a>
                )}
                {profile.googleReviewUrl && (
                  <a
                    href={profile.googleReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs p-2 bg-yellow-900/30 hover:bg-yellow-900/50 rounded text-yellow-300 transition text-center"
                  >
                    ⭐ Lihat Review
                  </a>
                )}
              </div>
            </div>
          )}

          {/* MEDIA SOSIAL SECTION */}
          {Object.keys(socialLinks).length > 0 && (
            <div className="mb-6 pb-6 border-b border-slate-700">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Media Sosial
              </h3>

              <div className="space-y-2">
                {Object.entries(socialLinks).map(([platform, url]) => {
                  if (!url) return null;
                  const iconData = socialIcons[platform];
                  if (!iconData) return null;

                  return (
                    <a
                      key={platform}
                      href={url.startsWith('http') ? url : `https://${url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 p-3 ${iconData.color} hover:opacity-80 rounded-lg transition`}
                    >
                      <span className="text-lg">{iconData.icon}</span>
                      <span className="text-sm font-semibold text-white">{iconData.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              TanyaPeguam Digital Card
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
