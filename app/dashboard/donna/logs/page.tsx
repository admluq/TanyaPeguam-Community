import { auth } from '@/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { InquiryTable } from '@/components/donna/inquiry-table';

export const metadata = { title: 'Log Pertanyaan — Dashboard' };

export default async function LogsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const inquiries = await db.donnaInquiry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { bridge: { select: { source: true, refCode: true } } },
  });

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold text-text-primary mb-1">Log Pertanyaan</h1>
        <p className="text-text-secondary text-sm">
          Semua pertanyaan yang diterima Donna, termasuk status dan skor triage.
        </p>
      </div>

      <InquiryTable inquiries={inquiries} />
    </div>
  );
}
