import { auth } from '@/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { SetupWizard } from '@/components/donna/setup-wizard';

export const metadata = { title: 'Tetapan Donna — Dashboard' };

export default async function DonnaSetupPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const config = await db.donnaConfig.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold text-text-primary mb-1">
          Tetapan Donna
        </h1>
        <p className="text-text-secondary text-sm">
          {config?.isComplete
            ? 'Kemaskini konfigurasi Donna anda'
            : 'Selesaikan wizard 5 langkah untuk mengaktifkan Donna'}
        </p>
      </div>

      <SetupWizard
        initial={config as Parameters<typeof SetupWizard>[0]['initial']}
        userEmail={session.user.email ?? ''}
      />
    </div>
  );
}
