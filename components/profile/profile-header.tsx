import type { Profile } from '@prisma/client';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <header className="text-center animate-fade-in">
      {/* Monogram avatar circle */}
      <div className="relative inline-block mb-6">
        <div className="w-24 h-24 rounded-full border-2 border-gold/60 flex items-center justify-center bg-ink-300 relative">
          <span className="font-display italic text-gold text-3xl">
            {profile.monogram ?? profile.name.slice(0, 2).toUpperCase()}
          </span>
          {/* Subtle inner ring */}
          <div className="absolute inset-1 rounded-full border border-gold/20" />
        </div>
        {/* Glow */}
        <div className="absolute inset-0 rounded-full bg-gold/20 blur-2xl -z-10 animate-gold-shimmer" />
      </div>

      {/* Name */}
      <h1 className="font-display text-cream text-3xl md:text-4xl leading-tight mb-2">
        {profile.name}
      </h1>

      {/* Title · Firm */}
      <p className="text-gold text-xs uppercase tracking-[0.25em] mb-5">
        {profile.title}
        {profile.firm && (
          <>
            <span className="mx-2 text-gold/40">·</span>
            {profile.firm}
          </>
        )}
      </p>

      {/* Badges row */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {/* Location */}
        <BadgePill>{profile.location}</BadgePill>

        {/* Status */}
        <BadgePill>
          <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(profile.status)}`} />
          {getStatusLabel(profile.status)}
        </BadgePill>

        {/* Practice areas */}
        {profile.practiceAreas.map((area) => (
          <BadgePill key={area}>{area}</BadgePill>
        ))}
      </div>

      {/* Verification badge */}
      {profile.isVerified && (
        <p className="inline-flex items-center gap-2 text-xs text-cream-muted">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-gold/40 text-gold text-[10px] font-mono">
            TP
          </span>
          <span>
            Profil Disahkan{' '}
            <span className="mx-1 text-gold/40">·</span>{' '}
            <a
              href={process.env.NEXT_PUBLIC_SITE_URL}
              className="text-gold hover:text-gold-300 transition-colors"
            >
              TanyaPeguam.com
            </a>
          </span>
        </p>
      )}
    </header>
  );
}

// ─── Badge pill (small tag) ─────────────────────────
function BadgePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-ink-50 bg-ink-200/50 text-cream-muted text-xs">
      {children}
    </span>
  );
}
