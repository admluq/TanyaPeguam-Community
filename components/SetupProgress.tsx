'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SetupStatusResponse, SetupStep } from '@/app/api/admin/setup-status/route';

export default function SetupProgress() {
  const [data, setData] = useState<SetupStatusResponse | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('setup-progress-dismissed') === 'true';
    if (wasDismissed) {
      setDismissed(true);
      setLoading(false);
      return;
    }
    fetch('/api/admin/setup-status')
      .then((r) => r.json())
      .then((json: SetupStatusResponse) => {
        setData(json);
        if (json.allDone) {
          sessionStorage.setItem('setup-progress-dismissed', 'true');
          setDismissed(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function dismiss() {
    sessionStorage.setItem('setup-progress-dismissed', 'true');
    setDismissed(true);
  }

  if (loading || dismissed || !data || data.allDone) return null;

  const pct = Math.round((data.completedCount / data.totalCount) * 100);

  return (
    <div className="mb-8 rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-blue-900/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <div>
          <h2 className="text-base font-bold text-cream">Persediaan Akaun</h2>
          <p className="text-xs text-cream/50 mt-0.5">
            {data.completedCount} daripada {data.totalCount} langkah selesai
          </p>
        </div>
        <button
          onClick={dismiss}
          className="text-cream/25 hover:text-cream/60 transition text-lg leading-none"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-6 pb-4">
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-400 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-right text-[10px] text-cream/30 mt-1">{pct}%</p>
      </div>

      {/* Steps */}
      <div className="px-6 pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
        {data.steps.map((step, i) => (
          <StepCard key={step.id} step={step} index={i} />
        ))}
      </div>
    </div>
  );
}

function StepCard({ step, index }: { step: SetupStep; index: number }) {
  const inner = (
    <div
      className={`group flex flex-col gap-1.5 rounded-lg border px-4 py-3 transition h-full ${
        step.done
          ? 'border-green-500/30 bg-green-900/10'
          : 'border-white/10 bg-white/[0.03] hover:border-purple-500/40 hover:bg-purple-900/10 cursor-pointer'
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition ${
            step.done
              ? 'bg-green-500 text-white'
              : 'bg-white/10 text-cream/40 group-hover:bg-purple-500/40 group-hover:text-white'
          }`}
        >
          {step.done ? '✓' : index + 1}
        </div>
        <span
          className={`text-xs font-semibold leading-tight ${
            step.done ? 'text-green-400' : 'text-cream/80 group-hover:text-cream transition'
          }`}
        >
          {step.label}
        </span>
      </div>
      <p className="text-[11px] text-cream/35 leading-snug pl-7">{step.description}</p>
      {!step.done && (
        <p className="text-[10px] text-purple-400 pl-7 group-hover:text-purple-300 transition">
          Mulakan →
        </p>
      )}
    </div>
  );

  return step.done ? inner : <Link href={step.href}>{inner}</Link>;
}
