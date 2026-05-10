import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Protect admin routes
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-ink-500">
      {/* Sidebar */}
      <aside className="w-64 bg-ink-300 border-r border-gold/20 p-6 overflow-y-auto">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/profile" className="flex items-center gap-2 text-xl font-bold text-cream hover:text-gold-400 transition">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-600 to-gold-500 flex items-center justify-center">
              <span className="text-ink-500 font-bold text-sm">TP</span>
            </div>
            TanyaPeguam
          </Link>
        </div>

        {/* User Info */}
        <div className="mb-8 pb-8 border-b border-gold/20">
          <p className="text-xs text-cream/50 mb-1">Logged in as</p>
          <p className="text-sm font-semibold text-cream truncate">{session.user?.email}</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <NavLink href="/profile" icon="📊" label="Dashboard" />
          <NavLink href="/profile" icon="👤" label="Digital Card" />
          <NavLink href="/donna" icon="🤖" label="Donna AI Config" />
          <NavLink href="/bridges" icon="🔗" label="Bridge Manager" />
          <NavLink href="/billing" icon="💳" label="Billing" />
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-8 border-t border-gold/20">
          <div className="text-xs text-cream/50 mb-4">
            <p>Admin Panel v1.0</p>
            <p>Focus: Input Setup</p>
          </div>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <button
              type="submit"
              className="w-full text-left text-sm text-cream/70 hover:text-red-400 transition py-2"
            >
              🚪 Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-ink-400">
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2 rounded-lg text-cream/70 hover:bg-ink-200/30 hover:text-gold-400 transition"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
