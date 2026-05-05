import type { Profile } from '@prisma/client';
import { cn } from '@/lib/utils';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const monogram = profile.monogram ?? profile.name.slice(0, 2).toUpperCase();

  return (
    <header className="text-center animate-fade-in">

      {/* ── Avatar with spinning conic ring ─────────────── */}
      <div className="relative inline-block mb-6">
        {/* Spinning ring */}
        <div
          className="absolute inset-[-3px] rounded-full animate-spin-slow"
          style={{
            background:
              'conic-gradient(from 0deg, #c9a961, #f5edd5, #dec486, #7c6128, #c9a961)',
          }}
        />
        {/* Gap between ring and avatar */}
        <div className="absolute inset-[-1px] rounded-full bg-ink-400" />

        {/* Avatar */}
        <div className="relative w-24 h-24 rounded-full bg-ink-200 border border-ink-50 flex items-center justify-center z-10">
          {/* Inner subtle ring */}
          <div className="absolute inset-2 rounded-full border border-gold/15" />
          <span className="font-display italic text-gold text-3xl select-none z-10">
            {monogram}
          </span>
        </div>

        {/* Verified checkmark badge */}
        {profile.isVerified && (
          <div className="absolute -bottom-1 -right-1 z-20 w-7 h-7 rounded-full bg-gold border-2 border-ink-400 flex items-center justify-center shadow-lg">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l2.5 2.5L10 3.5" stroke="#0a0a0c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}

        {/* Gold glow behind avatar */}
        <div className="absolute inset-0 rounded-full bg-gold/20 blur-2xl -z-10 animate-gold-shimmer" />
      </div>

      {/* ── Name ────────────────────────────────────────── */}
      <h1 className="font-display text-cream text-3xl md:text-4xl leading-tight mb-1.5 tracking-tight">
        {profile.name}
      </h1>

      {/* ── Title ───────────────────────────────────────── */}
      <p className="text-gold text-[11px] font-medium uppercase tracking-[0.22em] mb-1">
        {profile.title}
      </p>

      {/* ── Firm full name ───────────────────────────────── */}
      {profile.firmFull && (
        <p className="text-cream-muted text-xs mb-5">
          {profile.firmFull}
        </p>
      )}

      {/* ── Badge chips ─────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-2 mb-5">
        {/* Location */}
        <BadgePill>{profile.location}</BadgePill>

        {/* Status */}
        <BadgePill className="gap-1.5">
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full animate-pulse',
              getStatusColor(profile.status)
            )}
          />
          {getStatusLabel(profile.status)}
        </BadgePill>

        {/* Practice areas */}
        {profile.practiceAreas.map((area) => (
          <BadgePill key={area}>{area}</BadgePill>
        ))}
      </div>

      {/* ── TP Verified badge ────────────────────────────── */}
      {profile.isVerified && (
        <a
          href={process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanyapeguam.com'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 bg-ink-200 border border-ink-50 hover:border-gold/35 rounded-full px-4 py-2 transition-all duration-200 group"
        >
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gold text-ink-400 text-[9px] font-bold font-mono shrink-0">
            TP
          </span>
          <span className="text-xs text-cream-muted group-hover:text-cream transition-colors">
            Disahkan oleh{' '}
            <span className="text-gold">TanyaPeguam.com</span>
          </span>
          <span className="text-cream-muted/50 text-xs">↗</span>
        </a>
      )}
    </header>
  );
}

// ─── Reusable badge pill ──────────────────────────────
function BadgePill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded-full border border-ink-50 bg-ink-200/60 text-cream-muted text-xs',
        className
      )}
    >
      {children}
    </span>
  );
}
