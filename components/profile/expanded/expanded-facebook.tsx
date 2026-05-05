import type { Link } from '@prisma/client';
import { getMetadata, type FacebookMetadata } from '@/types/profile';
import { Star, Facebook } from 'lucide-react';
import { formatCount, formatRating } from '@/lib/utils';

interface ExpandedFacebookProps {
  link: Link;
}

export function ExpandedFacebook({ link }: ExpandedFacebookProps) {
  const meta = getMetadata<FacebookMetadata>(link);
  const stats = meta?.stats;
  const latestPost = meta?.latestPost;

  return (
    <div className="space-y-3">
      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <StatCell
            label="Suka"
            value={formatCount(stats.likes)}
          />
          <StatCell
            label="Pengikut"
            value={formatCount(stats.followers)}
          />
          <StatCell
            label="Rating"
            value={
              <span className="inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                {formatRating(stats.rating)}
              </span>
            }
          />
        </div>
      )}

      {/* Latest post preview */}
      {latestPost && (
        <article className="bg-ink-300 border border-ink-50 rounded-lg p-3.5">
          <p className="text-cream-muted text-[10px] uppercase tracking-wider mb-2">
            Siaran terkini
          </p>
          <p className="text-cream/90 text-sm leading-relaxed">{latestPost}</p>
        </article>
      )}

      {/* CTA */}
      <a
        href={link.url ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800 text-blue-300 text-sm transition-all"
      >
        <Facebook className="w-4 h-4" />
        Buka Facebook
      </a>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-ink-300 border border-ink-50 rounded-lg p-3 text-center">
      <p className="font-display text-cream text-2xl leading-none">{value}</p>
      <p className="text-cream-muted text-[10px] uppercase tracking-wider mt-1.5">
        {label}
      </p>
    </div>
  );
}
