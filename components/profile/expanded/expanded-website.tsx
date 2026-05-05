import type { Link } from '@prisma/client';
import { getMetadata, type WebsiteMetadata } from '@/types/profile';
import { ArrowUpRight } from 'lucide-react';

interface ExpandedWebsiteProps {
  link: Link;
}

export function ExpandedWebsite({ link }: ExpandedWebsiteProps) {
  const meta = getMetadata<WebsiteMetadata>(link);

  return (
    <div className="space-y-3">
      {/* Browser frame mockup */}
      <div className="rounded-lg overflow-hidden border border-ink-50">
        {/* Browser chrome */}
        <div className="bg-ink-100 px-3 py-2 flex items-center gap-2 border-b border-ink-50">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 ml-2 px-3 py-1 bg-ink-300 rounded text-cream-muted text-xs truncate">
            {meta?.domain ?? new URL(link.url ?? 'https://example.com').hostname}
          </div>
        </div>

        {/* Preview body — placeholder for now (Phase 4: real screenshot) */}
        <div className="aspect-video bg-ink-300 flex flex-col items-center justify-center text-cream-muted text-xs gap-2">
          {meta?.screenshotUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={meta.screenshotUrl}
              alt={`Screenshot of ${meta.domain}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <Globe className="w-12 h-12 text-ink-50" />
              <p>Live preview akan dijana</p>
              <p className="text-[10px]">(Phase 4: ScreenshotOne integration)</p>
            </>
          )}
        </div>
      </div>

      {/* CTA */}
      <a
        href={link.url ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gold/40 hover:border-gold hover:bg-gold/5 text-gold text-sm transition-all"
      >
        <ArrowUpRight className="w-4 h-4" />
        Buka laman penuh
      </a>
    </div>
  );
}

// Inline icon since lucide-react Globe is in icon map but not imported here
function Globe({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
