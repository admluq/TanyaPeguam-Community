'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Settings,
  Link2,
  LogOut,
  BookOpen,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/setup', label: 'Setup', icon: Settings },
    { href: '/dashboard/bridges', label: 'Bridges', icon: Link2 },
    { href: '/dashboard/logs', label: 'Logs', icon: BookOpen },
  ];

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    // TODO: Implement sign-out logic
    console.log('Sign out clicked');
    router.push('/');
  };

  return (
    <aside className="w-64 bg-ink-300 border-r border-ink-50 flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-6 border-b border-ink-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-500 flex items-center justify-center">
            <span className="text-ink-400 font-bold text-sm">D</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-cream text-sm leading-tight">
              Donna AI
            </p>
            <p className="text-cream-muted text-xs">Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
              isActive(href)
                ? 'bg-gold/15 text-gold border border-gold/30'
                : 'text-cream-muted hover:text-cream hover:bg-ink-200 border border-transparent'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
            {isActive(href) && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold" />
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-ink-50 space-y-3">
        {/* Version badge */}
        <div className="text-xs text-cream-muted text-center">
          <p>Donna v2.0</p>
        </div>

        {/* Sign out button */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm font-medium hover:bg-danger/20 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
