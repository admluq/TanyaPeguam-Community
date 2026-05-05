import type { LinkType } from '@prisma/client';
import {
  MessageCircle,
  Globe,
  Linkedin,
  Instagram,
  Facebook,
  Music2,
  Twitter,
  Youtube,
  Mail,
  Phone,
  Sparkles,
  Link as LinkIconBase,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkIconProps {
  type: LinkType;
  className?: string;
}

// Map each link type to icon + brand color tone
const ICON_MAP: Record<LinkType, { Icon: typeof MessageCircle; bg: string; iconColor: string }> = {
  WHATSAPP:  { Icon: MessageCircle, bg: 'bg-emerald-950 border-emerald-900',     iconColor: 'text-emerald-400' },
  WEBSITE:   { Icon: Globe,         bg: 'bg-sky-950 border-sky-900',             iconColor: 'text-sky-400'    },
  LINKEDIN:  { Icon: Linkedin,      bg: 'bg-blue-950 border-blue-900',           iconColor: 'text-blue-400'   },
  INSTAGRAM: { Icon: Instagram,     bg: 'bg-pink-950 border-pink-900',           iconColor: 'text-pink-400'   },
  FACEBOOK:  { Icon: Facebook,      bg: 'bg-blue-950 border-blue-900',           iconColor: 'text-blue-400'   },
  TIKTOK:    { Icon: Music2,        bg: 'bg-ink-100 border-ink-50',              iconColor: 'text-cream'      },
  TWITTER:   { Icon: Twitter,       bg: 'bg-ink-100 border-ink-50',              iconColor: 'text-cream'      },
  YOUTUBE:   { Icon: Youtube,       bg: 'bg-red-950 border-red-900',             iconColor: 'text-red-400'    },
  EMAIL:     { Icon: Mail,          bg: 'bg-ink-100 border-ink-50',              iconColor: 'text-cream'      },
  PHONE:     { Icon: Phone,         bg: 'bg-ink-100 border-ink-50',              iconColor: 'text-cream'      },
  AI_CHAT:   { Icon: Sparkles,      bg: 'bg-ink-100 border-gold/30',             iconColor: 'text-gold'       },
  CUSTOM:    { Icon: LinkIconBase,  bg: 'bg-ink-100 border-ink-50',              iconColor: 'text-cream'      },
};

export function LinkIcon({ type, className }: LinkIconProps) {
  const config = ICON_MAP[type] ?? ICON_MAP.CUSTOM;
  const { Icon, bg, iconColor } = config;

  return (
    <div
      className={cn(
        'shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center',
        bg,
        className
      )}
    >
      <Icon className={cn('w-5 h-5', iconColor)} strokeWidth={2} />
    </div>
  );
}
