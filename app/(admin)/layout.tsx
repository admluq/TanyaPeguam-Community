import { auth } from '@/auth';
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
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 p-6 overflow-y-auto">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/admin" className="flex items-center gap-2 text-xl font-bold text-white hover:text-blue-400 transition">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">TP</span>
            </div>
            TanyaPeguam
          </Link>
        </div>

        {/* User Info */}
        <div className="mb-8 pb-8 border-b border-slate-700">
          <p className="text-xs text-gray-400 mb-1">Logged in as</p>
          <p className="text-sm font-semibold text-white truncate">{session.user?.email}</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <NavLink href="/admin" icon="📊" label="Dashboard" />
          <NavLink href="/admin/profile" icon="👤" label="Digital Card" />
          <NavLink href="/admin/donna" icon="🤖" label="Donna AI Config" />
          <NavLink href="/admin/bridges" icon="🔗" label="Bridge Manager" />
          <NavLink href="/admin/billing" icon="💳" label="Billing" />
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-8 border-t border-slate-700">
          <div className="text-xs text-gray-500 mb-4">
            <p>Admin Panel v1.0</p>
            <p>Focus: Input Setup</p>
          </div>
          <form action={async () => { "use server"; }}>
            <button
              formAction={async () => {
                'use server';
                // TODO: signOut implementation
              }}
              className="w-full text-left text-sm text-gray-300 hover:text-red-400 transition py-2"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
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
      className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-slate-700 hover:text-white transition"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
