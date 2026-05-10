import { auth } from '@/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { BridgeCreator } from '@/components/donna/bridge-creator';
import { BridgeList } from '@/components/donna/bridge-list';

export const metadata = { title: 'Bridge Links — Dashboard' };

export default async function BridgePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const bridges = await db.donnaBridge.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { inquiries: true } } },
  });

  const config = await db.donnaConfig.findUnique({
    where: { userId: session.user.id },
    select: { practiceAreas: true },
  });

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold text-text-primary mb-1">Bridge Links</h1>
        <p className="text-text-secondary text-sm">
          Jana pautan konteks dari perbualan Facebook Group untuk diserahkan kepada Donna.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">Jana Bridge Baharu</h2>
          <BridgeCreator practiceAreas={config?.practiceAreas ?? []} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">Bridge Aktif</h2>
          <BridgeList bridges={bridges} />
        </div>
      </div>
    </div>
  );
}
