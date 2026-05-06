import { MessageCircle, Phone, CalendarDays } from 'lucide-react';

interface QuickActionsProps {
  waLink?: string | null;
  phoneHref?: string | null;
  bookingLink?: string | null;
}

export function QuickActions({ waLink, phoneHref, bookingLink }: QuickActionsProps) {
  // Don't render if nothing to show
  if (!waLink && !phoneHref && !bookingLink) return null;

  return (
    <div className="grid grid-cols-3 gap-3 mt-6 mb-2 animate-slide-up" style={{ animationDelay: '120ms' }}>

      {/* WhatsApp */}
      {waLink ? (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center gap-2.5 bg-emerald-950/50 border border-emerald-900/50 hover:border-emerald-700/60 hover:bg-emerald-950/80 rounded-2xl p-4 transition-all duration-200 active:scale-95"
        >
          <div className="w-11 h-11 rounded-full bg-emerald-900/50 group-hover:bg-emerald-800/60 flex items-center justify-center transition-colors">
            <MessageCircle className="w-5 h-5 text-emerald-400" strokeWidth={1.8} />
          </div>
          <span className="text-[11px] font-medium text-emerald-400 text-center leading-tight">
            WhatsApp
          </span>
        </a>
      ) : (
        <div /> // empty slot
      )}

      {/* Telefon */}
      {phoneHref ? (
        <a
          href={phoneHref}
          className="group flex flex-col items-center gap-2.5 bg-ink-200 border border-gold/20 hover:border-gold/45 hover:bg-ink-100 rounded-2xl p-4 transition-all duration-200 active:scale-95"
        >
          <div className="w-11 h-11 rounded-full bg-gold/10 group-hover:bg-gold/18 flex items-center justify-center transition-colors">
            <Phone className="w-5 h-5 text-gold" strokeWidth={1.8} />
          </div>
          <span className="text-[11px] font-medium text-gold text-center leading-tight">
            Telefon
          </span>
        </a>
      ) : (
        <div />
      )}

      {/* Temujanji */}
      {bookingLink ? (
        <a
          href={bookingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center gap-2.5 bg-ink-200 border border-ink-50 hover:border-gold/25 rounded-2xl p-4 transition-all duration-200 active:scale-95"
        >
          <div className="w-11 h-11 rounded-full bg-ink-100 group-hover:bg-ink-50/40 flex items-center justify-center transition-colors">
            <CalendarDays className="w-5 h-5 text-cream-muted group-hover:text-cream transition-colors" strokeWidth={1.8} />
          </div>
          <span className="text-[11px] font-medium text-cream-muted group-hover:text-cream text-center leading-tight transition-colors">
            Temujanji
          </span>
        </a>
      ) : (
        <div />
      )}

    </div>
  );
}
