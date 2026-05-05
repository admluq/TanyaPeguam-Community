import type { Link } from '@prisma/client';
import { ExpandedWebsite } from './expanded/expanded-website';
import { ExpandedLinkedIn } from './expanded/expanded-linkedin';
import { ExpandedTikTok } from './expanded/expanded-tiktok';
import { ExpandedFacebook } from './expanded/expanded-facebook';

interface ExpandedContentProps {
  link: Link;
}

/**
 * Dispatcher — renders different expanded UI based on link type.
 * Phase 4 will replace static metadata with live cached data.
 */
export function ExpandedContent({ link }: ExpandedContentProps) {
  switch (link.type) {
    case 'WEBSITE':
      return <ExpandedWebsite link={link} />;
    case 'LINKEDIN':
      return <ExpandedLinkedIn link={link} />;
    case 'TIKTOK':
      return <ExpandedTikTok link={link} />;
    case 'FACEBOOK':
      return <ExpandedFacebook link={link} />;
    default:
      return null;
  }
}
