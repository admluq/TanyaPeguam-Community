import type { Profile } from '@prisma/client';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { MapPin, Globe, Mail, MessageCircle } from 'lucide-react';

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const bio = profile.bio
    ? profile.bio.split(' ').slice(0, 30).join(' ') + (profile.bio.split(' ').length > 30 ? '…' : '')
    : null;

  return (
    <header className="text-center animate-fade-in">
      {/* ── Avatar ── */}
      <div className="relative inline-block mb-5">
        <div className="w-32 h-32 rounded-full flex items-center justify-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(212,168,83,0.15), rgba(212,168,83,0.05))',
            border: '3px solid rgba(212,168,83,0.5)',
            boxShadow: '0 0 40px rgba(212,168,83,0.15)',
          }}>
          <span className="font-display italic text-3xl" style={{ color: '#d4a853' }}>
            {profile.monogram ?? profile.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
        {/* Profile picture label */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.2)', color: '#d4a853' }}>
          Profile Picture
        </div>
      </div>

      {/* ── Name ── */}
      <h1 className="font-display text-3xl md:text-4xl leading-tight mb-2" style={{ color: '#eee8dc' }}>
        {profile.name}
      </h1>

      {/* ── Position ── */}
      <p className="text-lg font-medium mb-3" style={{ color: '#d4a853' }}>
        {profile.title}
      </p>

      {/* ── Firm Name ── */}
      <p className="text-base mb-4" style={{ color: '#9490a0' }}>
        {profile.firmFull || profile.firm}
      </p>

      {/* ── Location (State Only) ── */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <MapPin size={16} style={{ color: '#d4a853' }} />
        <span className="text-base" style={{ color: '#9490a0' }}>{profile.location}</span>
      </div>

      {/* ── Available Status ── */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className={`w-3 h-3 rounded-full ${getStatusColor(profile.status)}`} />
        <span className="text-base font-medium" style={{ color: getStatusColor(profile.status) }}>
          {getStatusLabel(profile.status)}
        </span>
      </div>

      {/* ── Bio ── */}
      {bio && (
        <div className="max-w-md mx-auto mb-6">
          <p className="text-base leading-relaxed" style={{ color: '#9490a0' }}>
            {bio}
          </p>
        </div>
      )}

      {/* ── Profile Verified TanyaPeguam ── */}
      {profile.isVerified && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.2)' }}>
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#d4a853', color: '#06060a' }}>✓</span>
          <span className="text-sm font-medium" style={{ color: '#d4a853' }}>Profile Verified TanyaPeguam</span>
        </div>
      )}

      {/* ── Contact & Links ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Globe size={14} style={{ color: '#d4a853' }} />
          <a href={`https://maps.google.com/?q=${encodeURIComponent(profile.location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:opacity-80 transition-opacity"
            style={{ color: '#d4a853' }}>
            Google Location
          </a>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Globe size={14} style={{ color: '#d4a853' }} />
          <a href={profile.firm || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:opacity-80 transition-opacity"
            style={{ color: '#d4a853' }}>
            Firm Website
          </a>
        </div>

        <div className="flex items-center justify-center gap-2">
          <MessageCircle size={14} style={{ color: '#d4a853' }} />
          <span className="text-sm" style={{ color: '#d4a853' }}>Donna AI</span>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Globe size={14} style={{ color: '#d4a853' }} />
          <span className="text-sm" style={{ color: '#d4a853' }}>FB</span>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Globe size={14} style={{ color: '#d4a853' }} />
          <span className="text-sm" style={{ color: '#d4a853' }}>TikTok</span>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Globe size={14} style={{ color: '#d4a853' }} />
          <span className="text-sm" style={{ color: '#d4a853' }}>LinkedIn</span>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Globe size={14} style={{ color: '#d4a853' }} />
          <span className="text-sm" style={{ color: '#d4a853' }}>IG</span>
        </div>
      </div>
    </header>
  );
}
