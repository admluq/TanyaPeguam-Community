'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  whatsapp?: string;
}

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
      <div className="min-h-screen bg-gradient-to-b from-ink-400 via-ink-500 to-ink-600 flex items-center justify-center">
        <div className="text-cream">Loading Digital Card...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ink-400 via-ink-500 to-ink-600 flex items-center justify-center">
        <div className="text-cream">Profile not found</div>
      </div>
    );
  }

  const socialLinks: SocialLinks = profile.socialLinks || {};
  const statusInfo = statusColors[profile.status] || statusColors.OFFLINE;
  const initials = (profile.user?.name || 'AA').split(' ').map((n: string) => n[0]).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-400 via-ink-500 to-ink-600 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-12">
          <a href="/directory" className="text-gold-400 hover:text-gold-300 text-sm">
            ← Back to Directory
          </a>
          <a href="/" className="text-cream/60 hover:text-cream text-sm">
            Home
          </a>
        </div>

        {/* Digital Card */}
        <div className="card-base rounded-2xl p-8">
          {/* Avatar & Name Section */}
          <div className="text-center mb-8 pb-8 border-b border-ink-300/20">
            {/* Avatar */}
            <div className="w-24 h-24 mx-auto rounded-full border-2 border-gold/40 flex items-center justify-center bg-gradient-to-br from-gold/10 to-gold/5 mb-6">
              <span className="text-4xl font-bold text-gold-400">{initials}</span>
            </div>

            {/* Name */}
            <h1 className="text-3xl font-display font-bold text-gold-gradient mb-2">{profile.user?.name || 'Lawyer'}</h1>

            {/* Position */}
            {profile.position && (
              <p className="text-sm text-gold-400 font-semibold uppercase tracking-widest mb-3">
                {profile.position}
              </p>
            )}

            {/* Firm Name */}
            {profile.firmName && (
              <p className="text-base text-cream/80 mb-4">{profile.firmName}</p>
            )}

            {/* Location & Status */}
            <div className="flex items-center justify-center gap-4">
              {profile.googleMapsUrl && (
                <a
                  href={profile.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cream/60 hover:text-gold-400 transition"
                >
                  📍 Rawang, Selangor
                </a>
              )}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bg}`}>
                <div className={`w-2 h-2 rounded-full ${statusInfo.dot}`}></div>
                <span className="text-xs font-semibold text-cream/80">{statusInfo.label}</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mb-8 pb-8 border-b border-ink-300/20">
              <p className="text-cream/80 leading-relaxed text-sm">{profile.bio}</p>
            </div>
          )}

          {/* TanyaPeguam Badge & Location Links */}
          <div className="grid grid-cols-2 gap-4 mb-8 pb-8 border-b border-ink-300/20">
            {/* Verified Badge */}
            <div className="bg-ink-300/20 hover:bg-ink-300/30 border border-gold/20 hover:border-gold/40 rounded-lg p-4 text-center transition">
              <div className="text-xl mb-2">✓</div>
              <p className="text-xs text-cream/60">Profil Disahkan</p>
              <p className="text-xs text-gold-400 font-semibold">TanyaPeguam.com</p>
            </div>

            {/* Google Review */}
            {profile.googleMapsUrl && (
              <a
                href={profile.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-ink-300/20 hover:bg-ink-300/30 border border-gold/20 hover:border-gold/40 rounded-lg p-4 text-center transition"
              >
                <div className="text-lg mb-2">⭐</div>
                <p className="text-xs text-cream/60">Google Review</p>
                <p className="text-xs text-gold-400 font-semibold">Lihat Review</p>
              </a>
            )}
          </div>

          {/* Contact Buttons */}
          <div className="space-y-3 mb-8 pb-8 border-b border-ink-300/20">
            {/* WhatsApp */}
            {socialLinks.whatsapp && (
              <a
                href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-green-900/30 hover:bg-green-900/50 rounded-lg transition"
              >
                <span className="text-xl">💬</span>
                <div className="flex-1">
                  <p className="text-xs text-cream/60">Hubungi Saya</p>
                  <p className="text-sm font-semibold text-green-400">{socialLinks.whatsapp}</p>
                </div>
                <span className="text-cream/40">→</span>
              </a>
            )}

            {/* Website */}
            {profile.firmWebsite && (
              <a
                href={profile.firmWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-gold-900/20 hover:bg-gold-900/30 border border-gold/20 hover:border-gold/40 rounded-lg transition"
              >
                <span className="text-xl">🌐</span>
                <div className="flex-1">
                  <p className="text-xs text-cream/60">Firma Website</p>
                  <p className="text-sm font-semibold text-gold-400">{profile.firmWebsite}</p>
                </div>
                <span className="text-cream/40">→</span>
              </a>
            )}
          </div>

          {/* Social Links */}
          {Object.keys(socialLinks).length > 1 && (
            <div className="space-y-2">
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-ink-300/20 hover:bg-ink-300/30 border border-gold/10 hover:border-gold/30 rounded-lg transition text-sm"
                >
                  <span>📘</span>
                  <span className="flex-1 font-semibold text-blue-300">Facebook</span>
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-ink-300/20 hover:bg-ink-300/30 border border-gold/10 hover:border-gold/30 rounded-lg transition text-sm"
                >
                  <span>📷</span>
                  <span className="flex-1 font-semibold text-pink-300">{socialLinks.instagram}</span>
                </a>
              )}
              {socialLinks.tiktok && (
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-ink-300/20 hover:bg-ink-300/30 border border-gold/10 hover:border-gold/30 rounded-lg transition text-sm"
                >
                  <span>🎵</span>
                  <span className="flex-1 font-semibold text-cream/80">{socialLinks.tiktok}</span>
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-ink-300/20 hover:bg-ink-300/30 border border-gold/10 hover:border-gold/30 rounded-lg transition text-sm"
                >
                  <span>💼</span>
                  <span className="flex-1 font-semibold text-blue-300">LinkedIn</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-xs text-cream/40">
          <p>🏛️ TanyaPeguam Digital Card</p>
        </div>
      </div>
    </div>
  );
}
