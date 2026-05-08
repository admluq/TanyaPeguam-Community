'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Phone, Mail, Link2 } from 'lucide-react';

type Inquiry = {
  id: string;
  callerName: string | null;
  callerPhone: string | null;
  callerEmail: string | null;
  issueSummary: string;
  practiceArea: string | null;
  concreteScore: number;
  urgencyTag: string;
  conversionTier: string;
  status: string;
  emailSentAt: Date | null;
  createdAt: Date;
  bridge: { source: string | null; refCode: string } | null;
};

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  DEFLECTED: { label: 'Ditolak', class: 'bg-bg-3 text-text-muted' },
  CAPTURED:  { label: 'Ditangkap', class: 'bg-[rgba(251,146,60,0.12)] text-[#fb923c]' },
  EMAILED:   { label: 'Dihantar', class: 'bg-lia-dim text-lia-light' },
  ACCEPTED:  { label: 'Diterima', class: 'bg-[rgba(52,211,153,0.12)] text-[#34d399]' },
  REJECTED:  { label: 'Ditolak', class: 'bg-[rgba(239,68,68,0.12)] text-[#f87171]' },
  EXPIRED:   { label: 'Luput', class: 'bg-bg-3 text-text-muted' },
};

const TIER_MAP: Record<string, { label: string; class: string }> = {
  LOW: { label: 'Rendah', class: 'text-[#34d399]' },
  MED: { label: 'Sederhana', class: 'text-lia-light' },
  HIGH: { label: 'Tinggi', class: 'text-gold' },
};

const URGENCY_MAP: Record<string, string> = {
  STANDARD: 'text-text-muted',
  MEDIUM: 'text-[#fb923c]',
  HIGH: 'text-[#f87171]',
  CRITICAL: 'text-[#ef4444] font-bold',
};

const ALL_STATUSES = ['SEMUA', 'CAPTURED', 'EMAILED', 'ACCEPTED', 'REJECTED', 'DEFLECTED', 'EXPIRED'];

export function InquiryTable({ inquiries }: { inquiries: Inquiry[] }) {
  const [filter, setFilter] = useState('SEMUA');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === 'SEMUA' ? inquiries : inquiries.filter((i) => i.status === filter);

  return (
    <div>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {ALL_STATUSES.map((s) => {
          const count = s === 'SEMUA' ? inquiries.length : inquiries.filter((i) => i.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                filter === s
                  ? 'border-lia-border bg-lia-dim text-lia-light'
                  : 'border-border text-text-muted hover:border-border-hover hover:text-text-secondary'
              }`}
            >
              {STATUS_MAP[s]?.label ?? 'Semua'}
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${filter === s ? 'bg-lia text-white' : 'bg-bg-3'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <p className="text-text-muted text-sm">Tiada pertanyaan dalam kategori ini.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-bg-2 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Pemanggil</th>
                <th className="text-left px-5 py-3 text-text-muted font-medium text-xs uppercase tracking-wider hidden md:table-cell">Kawasan</th>
                <th className="text-left px-5 py-3 text-text-muted font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Skor</th>
                <th className="text-left px-5 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Tier</th>
                <th className="text-left px-5 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-text-muted font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Tarikh</th>
                <th className="w-10 px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((inq) => (
                <>
                  <tr
                    key={inq.id}
                    className="hover:bg-bg-3 cursor-pointer transition-colors"
                    onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-text-primary">{inq.callerName ?? '—'}</div>
                      {inq.bridge && (
                        <div className="flex items-center gap-1 text-[11px] text-lia-light mt-0.5">
                          <Link2 size={10} /> Bridge
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-text-secondary hidden md:table-cell">{inq.practiceArea ?? '—'}</td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-bg-3 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-lia rounded-full"
                            style={{ width: `${(inq.concreteScore / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-muted">{inq.concreteScore}/10</span>
                      </div>
                      <span className={`text-[11px] ${URGENCY_MAP[inq.urgencyTag] ?? 'text-text-muted'}`}>{inq.urgencyTag}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold ${TIER_MAP[inq.conversionTier]?.class ?? 'text-text-muted'}`}>
                        {TIER_MAP[inq.conversionTier]?.label ?? inq.conversionTier}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_MAP[inq.status]?.class ?? 'bg-bg-3 text-text-muted'}`}>
                        {STATUS_MAP[inq.status]?.label ?? inq.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-text-muted text-xs hidden lg:table-cell">
                      {new Date(inq.createdAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-3 py-3.5">
                      {expanded === inq.id
                        ? <ChevronUp size={15} className="text-text-muted" />
                        : <ChevronDown size={15} className="text-text-muted" />
                      }
                    </td>
                  </tr>
                  {expanded === inq.id && (
                    <tr key={`${inq.id}-expanded`} className="bg-bg-3">
                      <td colSpan={7} className="px-5 py-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Maklumat Pemanggil</p>
                            <div className="space-y-1.5">
                              {inq.callerPhone && (
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                  <Phone size={13} className="text-text-muted" />{inq.callerPhone}
                                </div>
                              )}
                              {inq.callerEmail && (
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                  <Mail size={13} className="text-text-muted" />{inq.callerEmail}
                                </div>
                              )}
                              {!inq.callerPhone && !inq.callerEmail && (
                                <p className="text-sm text-text-muted">Tiada maklumat hubungi</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Ringkasan Isu</p>
                            <p className="text-sm text-text-secondary leading-relaxed">{inq.issueSummary}</p>
                          </div>
                        </div>
                        {inq.emailSentAt && (
                          <p className="mt-3 text-[11px] text-text-muted">
                            E-mel ringkasan dihantar: {new Date(inq.emailSentAt).toLocaleString('ms-MY')}
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
