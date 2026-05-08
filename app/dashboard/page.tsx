import { auth } from '@/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Wand2, Link2, FileText, CheckCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;

  const [config, inquiries, bridges] = await Promise.all([
    db.donnaConfig.findUnique({ where: { userId } }),
    db.donnaInquiry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    db.donnaBridge.count({ where: { userId, isActive: true } }),
  ]);

  const totalInquiries = await db.donnaInquiry.count({ where: { userId } });
  const accepted = await db.donnaInquiry.count({ where: { userId, status: 'ACCEPTED' } });
  const pending = await db.donnaInquiry.count({ where: { userId, status: 'EMAILED' } });

  const firstName = session.user.name?.split(' ')[0] ?? 'Peguam';

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold text-text-primary mb-1">
          Selamat datang, {firstName}
        </h1>
        <p className="text-text-secondary text-sm">
          Panel kawalan Donna AI anda
        </p>
      </div>

      {/* Setup CTA — only shown if wizard incomplete */}
      {!config?.isComplete && (
        <div className="mb-8 rounded-2xl border border-lia-border bg-lia-dim p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-lia-dim border border-lia-border flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-lia-light" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-text-primary mb-1">Tetapan Donna belum lengkap</h2>
            <p className="text-sm text-text-secondary mb-4">
              Selesaikan wizard 5 langkah untuk mengaktifkan Donna pada profil anda.
            </p>
            <Link
              href="/dashboard/donna/setup"
              className="inline-flex items-center gap-2 bg-lia text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-lia/90 transition-colors"
            >
              <Wand2 size={15} />
              Mulakan Tetapan
            </Link>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Jumlah Pertanyaan" value={totalInquiries} icon={FileText} color="gold" />
        <StatCard label="Diterima" value={accepted} icon={CheckCircle} color="green" />
        <StatCard label="Menunggu Semakan" value={pending} icon={Clock} color="amber" />
        <StatCard label="Bridge Aktif" value={bridges} icon={Link2} color="purple" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <QuickLink
          href="/dashboard/donna/setup"
          icon={Wand2}
          title="Tetapan Donna"
          desc="Urus tetapan wizard, kawasan amalan & yuran"
          complete={config?.isComplete}
        />
        <QuickLink
          href="/dashboard/donna/bridge"
          icon={Link2}
          title="Bridge Links"
          desc="Jana pautan konteks dari kumpulan FB anda"
        />
        <QuickLink
          href="/dashboard/donna/logs"
          icon={FileText}
          title="Log Pertanyaan"
          desc="Semak dan urus semua pertanyaan masuk"
        />
      </div>

      {/* Recent inquiries */}
      {inquiries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">Pertanyaan Terkini</h2>
            <Link href="/dashboard/donna/logs" className="text-sm text-lia-light hover:text-lia transition-colors">
              Lihat semua →
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-bg-2 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Nama</th>
                  <th className="text-left px-5 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Kawasan</th>
                  <th className="text-left px-5 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Tahap</th>
                  <th className="text-left px-5 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-bg-3 transition-colors">
                    <td className="px-5 py-3.5 text-text-primary font-medium">{inq.callerName ?? '—'}</td>
                    <td className="px-5 py-3.5 text-text-secondary">{inq.practiceArea ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <TierBadge tier={inq.conversionTier} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={inq.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: 'gold' | 'green' | 'amber' | 'purple';
}) {
  const colors = {
    gold: 'text-gold border-border-gold bg-[rgba(212,168,83,0.06)]',
    green: 'text-[#34d399] border-[rgba(52,211,153,0.2)] bg-[rgba(52,211,153,0.06)]',
    amber: 'text-[#fb923c] border-[rgba(251,146,60,0.2)] bg-[rgba(251,146,60,0.06)]',
    purple: 'text-lia-light border-lia-border bg-lia-dim',
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <Icon size={18} />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
  );
}

function QuickLink({ href, icon: Icon, title, desc, complete }: {
  href: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  complete?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group glass-card rounded-2xl p-5 block hover:border-border-gold transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-lia-dim border border-lia-border flex items-center justify-center">
          <Icon size={16} className="text-lia-light" />
        </div>
        {complete !== undefined && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${complete ? 'bg-[rgba(52,211,153,0.15)] text-[#34d399]' : 'bg-[rgba(251,146,60,0.15)] text-[#fb923c]'}`}>
            {complete ? 'Lengkap' : 'Belum selesai'}
          </span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1 group-hover:text-gold transition-colors">{title}</h3>
      <p className="text-xs text-text-muted leading-relaxed">{desc}</p>
    </Link>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, string> = {
    LOW: 'bg-[rgba(52,211,153,0.12)] text-[#34d399]',
    MED: 'bg-lia-dim text-lia-light',
    HIGH: 'bg-[rgba(212,168,83,0.12)] text-gold',
  };
  const label: Record<string, string> = { LOW: 'Rendah', MED: 'Sederhana', HIGH: 'Tinggi' };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${map[tier] ?? 'bg-bg-3 text-text-muted'}`}>
      {label[tier] ?? tier}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DEFLECTED: 'bg-bg-3 text-text-muted',
    CAPTURED: 'bg-[rgba(251,146,60,0.12)] text-[#fb923c]',
    EMAILED: 'bg-lia-dim text-lia-light',
    ACCEPTED: 'bg-[rgba(52,211,153,0.12)] text-[#34d399]',
    REJECTED: 'bg-[rgba(239,68,68,0.12)] text-[#f87171]',
    EXPIRED: 'bg-bg-3 text-text-muted',
  };
  const label: Record<string, string> = {
    DEFLECTED: 'Ditolak', CAPTURED: 'Ditangkap', EMAILED: 'Dihantar',
    ACCEPTED: 'Diterima', REJECTED: 'Ditolak', EXPIRED: 'Luput',
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${map[status] ?? 'bg-bg-3 text-text-muted'}`}>
      {label[status] ?? status}
    </span>
  );
}
