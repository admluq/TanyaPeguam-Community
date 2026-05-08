'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Wand2,
  Link2,
  FileText,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Gambaran Keseluruhan', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/donna/setup', label: 'Tetapan Donna', icon: Wand2 },
  { href: '/dashboard/donna/bridge', label: 'Bridge Links', icon: Link2 },
  { href: '/dashboard/donna/logs', label: 'Log Pertanyaan', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-border bg-bg-2 min-h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center">
            <span className="text-white font-display font-semibold text-sm">T</span>
          </div>
          <div>
            <span className="block text-sm font-bold text-text-primary tracking-tight">TanyaPeguam</span>
            <span className="block text-[10px] text-text-muted uppercase tracking-widest">Dashboard</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${active
                  ? 'bg-lia-dim text-lia-light border border-lia-border'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-3'
                }
              `}
            >
              <Icon size={16} className={active ? 'text-lia-light' : 'text-text-muted group-hover:text-text-secondary'} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-lia opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Donna badge */}
      <div className="px-4 pb-3">
        <div className="rounded-xl border border-border-gold bg-[rgba(212,168,83,0.05)] p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center text-[10px] font-bold text-white">D</div>
            <span className="text-xs font-semibold text-gold">Donna AI</span>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">Pembantu peribadi AI anda untuk urus pertanyaan klien.</p>
        </div>
      </div>

      {/* Sign out */}
      <div className="px-3 py-3 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-bg-3 transition-all duration-150 group"
        >
          <LogOut size={16} className="text-text-muted group-hover:text-text-secondary" />
          Log Keluar
        </button>
      </div>
    </aside>
  );
}
