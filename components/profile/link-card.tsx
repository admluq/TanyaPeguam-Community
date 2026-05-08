'use client';

import { useState } from 'react';
import type { Link as PrismaLink } from '@prisma/client';
import { cn } from '@/lib/utils';
import { LinkIcon } from './link-icon';
import { ExpandedContent } from './expanded-content';

interface LinkCardProps {
  link: PrismaLink;
  animationDelay?: string;
}

export function LinkCard({ link, animationDelay }: LinkCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Determine if this link type has expandable content
  const hasExpandableContent = ['WEBSITE', 'LINKEDIN', 'TIKTOK', 'FACEBOOK'].includes(
    link.type
  );

  // Click handler — expand if expandable, else navigate
  const handleClick = (e: React.MouseEvent) => {
    if (hasExpandableContent) {
      e.preventDefault();
      setExpanded((v) => !v);
    }
    // For non-expandable links, default <a> navigation runs
  };

  const Wrapper = hasExpandableContent ? 'div' : 'a';
  const wrapperProps = hasExpandableContent
    ? { onClick: handleClick }
    : {
        href: link.url ?? '#',
        target: '_blank',
        rel: 'noopener noreferrer',
      };

  return (
    <article
      className={cn(
        'card-base overflow-hidden animate-slide-up',
        expanded && 'border-gold/40'
      )}
      style={{ animationDelay }}
    >
      <Wrapper
        {...(wrapperProps as Record<string, unknown>)}
        className="flex items-center gap-4 p-4 cursor-pointer"
      >
        {/* Icon */}
        <LinkIcon type={link.type} />

        {/* Label & subtitle */}
        <div className="flex-1 min-w-0">
          <p className="font-display text-cream text-base leading-tight">
            {link.label}
          </p>
          {link.subtitle && (
            <p className="text-cream-muted text-xs mt-0.5 truncate">
              {link.subtitle}
            </p>
          )}
        </div>

        {/* Chevron */}
        <span
          className={cn(
            'text-gold/40 text-xs transition-transform duration-300',
            expanded && 'rotate-180 text-gold'
          )}
        >
          ▾
        </span>
      </Wrapper>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-ink-50 pt-4 animate-fade-in">
          <ExpandedContent link={link} />
        </div>
      )}
    </article>
  );
}
