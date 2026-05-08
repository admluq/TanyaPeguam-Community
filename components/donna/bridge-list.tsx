'use client';

import { useState } from 'react';
import { Copy, Check, MousePointer, Calendar, ChevronDown } from 'lucide-react';

type Bridge = {
  id: string;
  refCode: string;
  source: string | null;
  question: string;
  practiceArea: string | null;
  clickCount: number;
  isActive: boolean;
  createdAt: Date;
  _count: { inquiries: number };
};

export function BridgeList({ bridges }: { bridges: Bridge[] }) {
  if (bridges.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-text-muted text-sm">Belum ada bridge link. Jana yang pertama sekarang.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bridges.map((b) => <BridgeCard key={b.id} bridge={b} />)}
    </div>
  );
}

function BridgeCard({ bridge }: { bridge: Bridge }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanyapeguam.com';
  const url = `${baseUrl}/bridge/${bridge.refCode}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bridge.isActive ? 'bg-[rgba(52,211,153,0.12)] text-[#34d399]' : 'bg-bg-3 text-text-muted'}`}>
              {bridge.isActive ? 'Aktif' : 'Tidak aktif'}
            </span>
            {bridge.practiceArea && (
              <span className="text-[10px] text-text-muted bg-bg-3 px-2 py-0.5 rounded-full">{bridge.practiceArea}</span>
            )}
          </div>
          <p className="text-sm text-text-primary font-medium truncate">{bridge.source ?? 'Bridge'} · #{bridge.refCode}</p>
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-lia-light hover:text-lia transition-colors flex-shrink-0 bg-lia-dim border border-lia-border px-2.5 py-1.5 rounded-lg"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Disalin' : 'Salin'}
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1"><MousePointer size={11} />{bridge.clickCount} klik</span>
        <span className="flex items-center gap-1"><Calendar size={11} />{new Date(bridge.createdAt).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}</span>
        <span>{bridge._count.inquiries} pertanyaan</span>
      </div>

      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-1 text-[11px] text-text-muted hover:text-text-secondary mt-2 transition-colors"
      >
        <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        {expanded ? 'Sembunyikan' : 'Lihat soalan'}
      </button>

      {expanded && (
        <p className="mt-2 text-xs text-text-secondary leading-relaxed bg-bg-3 rounded-lg p-3 border border-border">
          {bridge.question}
        </p>
      )}
    </div>
  );
}
