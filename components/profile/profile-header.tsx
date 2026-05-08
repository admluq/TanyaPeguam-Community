import type { Profile } from '@prisma/client';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

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
        <div className="w-24 h-24 rounded-full flex items-center justify-center relative"
          style={{
            background: 'linear-gradient(135deg, rgba(212,168,83,0.15), rgba(212,168,83,0.05))',
            border: '2px solid rgba(212,168,83,0.5)',
            boxShadow: '0 0 40px rgba(212,168,83,0.15)',
          }}>
          <span className="font-display italic text-3xl" style={{ color: '#d4a853' }}>
            {profile.monogram ?? profile.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="absolute inset-1.5 rounded-full border" style={{ borderColor: 'rgba(212,168,83,0.15)' }} />
        </div>
        {/* Profile picture label */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.2)', color: '#d4a853' }}>
          + Foto
        </div>
      </div>

      {/* ── Name ── */}
      <h1 className="font-display text-3xl md:text-4xl leading-tight mb-2 mt-3" style={{ color: '#eee8dc' }}>
        {profile.name}
      </h1>

      {/* ── Title · Firm Full ── */}
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.22em] font-medium" style={{ color: '#d4a853' }}>
          {profile.title}
        </p>
        {profile.firmFull && (
          <p className="text-xs uppercase tracking-[0.18em] font-medium mt-0.5" style={{ color: 'rgba(212,168,83,0.6)' }}>
            {profile.firmFull}
          </p>
        )}
      </div>

      {/* ── Row 1: Location + Status ── */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#9490a0' }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.6 }}>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
          </svg>
          {profile.location}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
          style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
          <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(profile.status)}`} />
          {getStatusLabel(profile.status)}
        </span>
      </div>

      {/* ── Separator ── */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="h-px w-12" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(212,168,83,0.3)' }} />
        <div className="h-px w-12" style={{ background: 'rgba(255,255,255,0.07)' }} />
      </div>

      {/* ── Row 2: Practice areas ── */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-5">
        {(profile.practiceAreas as string[]).map((area) => (
          <span key={area} className="inline-flex items-center px-3 py-1 rounded-full text-xs"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b6780' }}>
            {area}
          </span>
        ))}
      </div>

      {/* ── Bio ── */}
      {bio && (
        <p className="text-sm leading-relaxed mb-5 max-w-xs mx-auto" style={{ color: '#9490a0' }}>
          {bio}
        </p>
      )}

      {/* ── Verification badge ── */}
      {profile.isVerified && (
        <div className="inline-flex items-center gap-2 text-xs mb-1">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded font-bold text-[9px]"
            style={{ background: 'rgba(212,168,83,0.12)', border: '1px solid rgba(212,168,83,0.3)', color: '#d4a853' }}>
            TP
          </span>
          <span style={{ color: '#5e5a6e' }}>
            Profil Disahkan
            <span className="mx-1.5" style={{ color: 'rgba(212,168,83,0.3)' }}>·</span>
            <a href="/" className="transition-colors" style={{ color: '#d4a853' }}>
              TanyaPeguam.com
            </a>
          </span>
        </div>
      )}
    </header>
  );
}
