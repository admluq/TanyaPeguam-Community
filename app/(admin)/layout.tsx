import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
      <aside className="w-64 bg-ink-300 border-r border-purple/20 overflow-y-auto flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto flex flex-col">
          {/* Logo */}
          <div className="mb-6">
            <Link
              href="/profile"
              className="flex items-center gap-2 text-xl font-bold text-cream hover:text-purple-400 transition"
            >
              <Image
                src="/tanya-peguam-official-logo-removebg-preview.png"
                alt="TanyaPeguam"
                width={28}
                height={28}
                className="flex-shrink-0"
              />
              TanyaPeguam
            </Link>
          </div>

          {/* User Info */}
          <div className="mb-6 pb-6 border-b border-purple/20">
            <p className="text-xs text-cream/50 mb-1">Logged in as</p>
            <p className="text-sm font-semibold text-cream truncate">
              {session.user?.email}
            </p>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <NavLink href="/profile" label="Digital Card" />
            <NavLink href="/legal-service" label="Legal Service Config" />
            <NavLink href="/donna" label="Donna AI Config" />
            <NavLink href="/bridges" label="Bridge Manager" />
            <NavLink href="#" label="Billing" disabled />
          </nav>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-purple/20">
          <div className="text-xs text-cream/40 mb-3 leading-relaxed">
            <p>Admin Panel v1.0</p>
          </div>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <button
              type="submit"
              className="w-full text-left text-sm text-cream/70 hover:text-red-400 transition py-1"
            >
              Sign Out
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
  label,
  disabled = false,
}: {
  href: string;
  label: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-cream/30 cursor-not-allowed">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-[10px] uppercase tracking-wider text-cream/30 bg-cream/5 px-2 py-0.5 rounded">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-lg text-sm font-medium text-cream/70 hover:bg-ink-200/30 hover:text-purple-400 transition"
    >
      {label}
    </Link>
  );
}
