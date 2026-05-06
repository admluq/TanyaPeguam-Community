import type { Profile } from '@prisma/client';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const monogram = profile.monogram ?? profile.name.slice(0, 2).toUpperCase();

  return (
    <header className="text-center animate-fade-in">
      {/* Avatar with spinning gradient ring */}
      <div className="relative inline-block mb-6">
        {/* Gold glow behind */}
        <div className="absolute inset-0 rounded-full bg-gold/20 blur-2xl -z-10 animate-gold-shimmer" />

        {/* Spinning conic ring */}
        <div
          className="w-24 h-24 rounded-full animate-spin-slow p-[2px]"
          style={{
            background: 'conic-gradient(from 0deg, #c9a961, #f5edd5, #dec486, #7c6128, #c9a961)',
          }}
        >
          {/* Static inner avatar */}
          <div className="w-full h-full rounded-full bg-ink-300 flex items-center justify-center">
            <span className="font-display italic text-gold text-3xl">{monogram}</span>
          </div>
        </div>

        {/* Verified checkmark badge */}
        {profile.isVerified && (
          <div className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full bg-gold border-2 border-ink-300 flex items-center justify-center">
            <svg className="w-3 h-3" fill="white" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        )}
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

      {/* Badges */}
      <div className="flex flex-wrap justify-center gap-2 mb-5">
        <BadgePill>{profile.location}</BadgePill>
        <BadgePill>
          <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(profile.status)}`} />
          {getStatusLabel(profile.status)}
        </BadgePill>
        {profile.practiceAreas.map((area) => (
          <BadgePill key={area}>{area}</BadgePill>
        ))}
      </div>

      {/* TP verified pill */}
      {profile.isVerified && (
        <a
          href={process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanyapeguam.com'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 hover:border-gold/60 text-xs text-cream-muted hover:text-cream transition-all"
        >
          <span className="inline-flex items-center justify-center w-4 h-4 rounded border border-gold/50 text-gold text-[9px] font-mono">
            TP
          </span>
          Disahkan oleh TanyaPeguam.com
          <span className="text-gold/40 text-[10px]">↗</span>
        </a>
      )}
    </header>
  );
}

function BadgePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-ink-50 bg-ink-200/50 text-cream-muted text-xs">
      {children}
    </span>
  );
}
