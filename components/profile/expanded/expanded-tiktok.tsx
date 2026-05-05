import type { Link } from '@prisma/client';
import { getMetadata, type TikTokMetadata } from '@/types/profile';
import { Play } from 'lucide-react';

interface ExpandedTikTokProps {
  link: Link;
}

export function ExpandedTikTok({ link }: ExpandedTikTokProps) {
  const meta = getMetadata<TikTokMetadata>(link);
  const videos = meta?.videos ?? [];

  return (
    <div className="space-y-3">
      {videos.length === 0 ? (
        <p className="text-center text-cream-muted text-sm py-4">
          Tiada video terkini
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {videos.slice(0, 4).map((video) => (
            <div
              key={video.id}
              className="relative aspect-[3/4] rounded-lg overflow-hidden bg-ink-300 border border-ink-50 group cursor-pointer"
            >
              {/* Thumbnail (Phase 4: real TikTok oEmbed) */}
              {video.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={video.thumbnailUrl}
                  alt={video.caption}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-ink-100 to-ink-300" />
              )}

              {/* Play icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/60 transition-colors">
                  <Play className="w-4 h-4 text-cream fill-cream" />
                </div>
              </div>

              {/* Caption */}
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-cream text-[11px] line-clamp-3 leading-snug">
                  {video.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <a
        href={link.url ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-ink-50 hover:border-gold/40 text-cream text-sm transition-all"
      >
        <Play className="w-4 h-4" />
        Tonton semua video
      </a>
    </div>
  );
}
