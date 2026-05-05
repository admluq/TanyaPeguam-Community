import type { Link } from '@prisma/client';
import { getMetadata, type LinkedInMetadata } from '@/types/profile';
import { ThumbsUp, MessageSquare, Share2, Linkedin, BadgeCheck } from 'lucide-react';

interface ExpandedLinkedInProps {
  link: Link;
}

export function ExpandedLinkedIn({ link }: ExpandedLinkedInProps) {
  const meta = getMetadata<LinkedInMetadata>(link);
  const posts = meta?.manualPosts ?? [];

  return (
    <div className="space-y-3">
      {/* Posts */}
      {posts.length === 0 ? (
        <p className="text-center text-cream-muted text-sm py-4">
          Tiada siaran terkini
        </p>
      ) : (
        posts.map((post, i) => (
          <article
            key={i}
            className="bg-ink-300 border border-ink-50 rounded-lg p-4"
          >
            {/* Author row */}
            <header className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-ink-100 border border-gold/30 flex items-center justify-center">
                <span className="text-gold text-xs font-display">
                  {/* Author monogram from profile name (TBC: pass profile down) */}
                  •
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="flex items-center gap-1 text-cream text-sm font-medium">
                  Datuk Wan Azmir
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />
                </p>
                <p className="text-cream-muted text-[10px]">{post.postedAt}</p>
              </div>
            </header>

            {/* Content */}
            <div className="text-cream/90 text-sm leading-relaxed whitespace-pre-line">
              {renderMarkdownLite(post.content)}
            </div>

            {/* Reactions */}
            <footer className="flex items-center gap-4 mt-3 pt-3 border-t border-ink-50 text-cream-muted text-xs">
              <button className="flex items-center gap-1 hover:text-gold transition-colors">
                <ThumbsUp className="w-3.5 h-3.5" />
                Suka
              </button>
              <button className="flex items-center gap-1 hover:text-gold transition-colors">
                <MessageSquare className="w-3.5 h-3.5" />
                Komen
              </button>
              <button className="flex items-center gap-1 hover:text-gold transition-colors">
                <Share2 className="w-3.5 h-3.5" />
                Kongsi
              </button>
            </footer>
          </article>
        ))
      )}

      {/* CTA */}
      <a
        href={link.url ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800 text-blue-300 text-sm transition-all"
      >
        <Linkedin className="w-4 h-4" />
        Ikuti di LinkedIn
      </a>
    </div>
  );
}

/**
 * Light markdown renderer — handles **bold** only.
 * For more, use a library like react-markdown.
 */
function renderMarkdownLite(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-gold/90">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
