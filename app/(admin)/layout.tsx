import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SetupProgress } from '@/components/SetupProgress';

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

  // Fetch user's profile to check setup status
  const { db } = await import('@/lib/db');
  const profile = await db.lawyerProfile.findUnique({
    where: { userId: session.user.id },
  });

  // Track if user is in initial setup phase
  const isSetupComplete = profile?.setupCompleted ?? false;

  return (
    <div className="flex h-screen bg-ink-500">
      {/* Sidebar */}
      <aside className="w-64 bg-ink-300 border-r border-purple/20 overflow-y-auto flex flex-col">
        {/* Progress Bar - Show only during initial setup */}
        {!isSetupComplete && (
          <div className="flex-shrink-0">
            <SetupProgress currentStep={1} />
          </div>
        )}

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/profile" className="flex items-center gap-2 text-xl font-bold text-cream hover:text-purple-400 transition">
              <Image
                src="/tanya-peguam-official-logo-removebg-preview.png"
                alt="TanyaPeguam"
                width={32}
                height={32}
                className="flex-shrink-0"
              />
              TanyaPeguam
            </Link>
          </div>

          {/* User Info */}
          <div className="mb-8 pb-8 border-b border-purple/20">
            <p className="text-xs text-cream/50 mb-1">Logged in as</p>
            <p className="text-sm font-semibold text-cream truncate">{session.user?.email}</p>
          </div>

          {/* Navigation - Reorganized Step Order */}
          <nav className="space-y-2">
            <NavLink href="/profile" label="Step 1: Digital Card" />
            <NavLink href="/legal-service" label="Step 2: Legal Service Config" />
            <NavLink href="/donna" label="Step 3: Donna AI Config" />
            <NavLink href="/bridges" label="Step 4: Bridge Manager" />
            <NavLink href="#" label="Step 5: Billing" disabled={true} />
          </nav>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 border-t border-purple/20">
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
      <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-lg text-cream/30 cursor-not-allowed">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-cream/20 bg-cream/5 px-2 py-0.5 rounded">Coming Soon</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2 rounded-lg text-cream/70 hover:bg-ink-200/30 hover:text-purple-400 transition"
    >
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
