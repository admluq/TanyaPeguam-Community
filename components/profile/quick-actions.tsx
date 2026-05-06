import type { Link as PrismaLink } from '@prisma/client';
import { MessageCircle, Phone, CalendarDays } from 'lucide-react';

interface QuickActionsProps {
  links: PrismaLink[];
  lawyerName: string;
}

export function QuickActions({ links, lawyerName }: QuickActionsProps) {
  const wa = links.find((l) => l.type === 'WHATSAPP');
  const ph = links.find((l) => l.type === 'PHONE');

  const temujanjiUrl = wa?.url
    ? `${wa.url}?text=${encodeURIComponent(`Salam ${lawyerName}, saya ingin membuat temujanji konsultasi.`)}`
    : null;

  return (
    <div className="mt-6 grid grid-cols-3 gap-2 animate-fade-in" style={{ animationDelay: '150ms' }}>
      <QuickBtn
        href={wa?.url ?? null}
        label="WhatsApp"
        colorClass="bg-emerald-950 border-emerald-800 hover:border-emerald-600 text-emerald-400"
      >
        <MessageCircle className="w-5 h-5" />
      </QuickBtn>

      <QuickBtn
        href={ph?.url ?? null}
        label="Telefon"
        colorClass="bg-gold/10 border-gold/30 hover:border-gold/60 text-gold"
      >
        <Phone className="w-5 h-5" />
      </QuickBtn>

      <QuickBtn
        href={temujanjiUrl}
        label="Temujanji"
        colorClass="bg-sky-950 border-sky-800 hover:border-sky-600 text-sky-400"
      >
        <CalendarDays className="w-5 h-5" />
      </QuickBtn>
    </div>
  );
}

function QuickBtn({
  href,
  label,
  colorClass,
  children,
}: {
  href: string | null;
  label: string;
  colorClass: string;
  children: React.ReactNode;
}) {
  const base = `flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all duration-200 ${colorClass}`;

  if (!href) {
    return (
      <div className={`${base} opacity-40 cursor-not-allowed`}>
        {children}
        <span className="text-[11px] font-medium">{label}</span>
      </div>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={base}>
      {children}
      <span className="text-[11px] font-medium">{label}</span>
    </a>
  );
}
