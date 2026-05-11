'use client';

import { useCallback, useEffect, useState } from 'react';

type BridgeStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'DELETED';

interface Bridge {
  id: string;
  shortCode: string;
  status: BridgeStatus;
  createdBy: string;
  initialQuestion: string | null;
  initialAnswer: string | null;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  practiceArea: string | null;
  summary: string | null;
  turnCount: number;
  createdAt: string;
  updatedAt: string;
}

const STATUS_STYLE: Record<BridgeStatus, { label: string; dot: string; pill: string; dim?: boolean }> = {
  ACTIVE:    { label: 'Active',   dot: 'bg-green-400',  pill: 'text-green-300 bg-green-900/20 border-green-500/30' },
  COMPLETED: { label: 'Complete', dot: 'bg-blue-400',   pill: 'text-blue-300 bg-blue-900/20 border-blue-500/30' },
  EXPIRED:   { label: 'Expired',   dot: 'bg-yellow-500', pill: 'text-yellow-300 bg-yellow-900/20 border-yellow-600/30', dim: true },
  DELETED:   { label: 'Deleted', dot: 'bg-red-600',    pill: 'text-red-300 bg-red-900/20 border-red-700/30', dim: true },
};

type FilterKey = '' | BridgeStatus;

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: 'ACTIVE',    label: 'Active' },
  { key: 'COMPLETED', label: 'Complete' },
  { key: 'EXPIRED',   label: 'Expired' },
  { key: 'DELETED',   label: 'Deleted' },
  { key: '',          label: 'All' },
];

function buildPublicUrl(shortCode: string): string {
  if (typeof window !== 'undefined') return `${window.location.origin}/b/${shortCode}`;
  return `/b/${shortCode}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ms-MY', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'baru sahaja';
  if (mins < 60) return `${mins}m lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}j lalu`;
  return `${Math.floor(hrs / 24)}h lalu`;
}

// ──────────────────────────────────────────────────────────────────
// Bridge Creator
// ──────────────────────────────────────────────────────────────────
function BridgeCreator({ onCreated }: { onCreated: () => void }) {
  const [question, setQuestion] = useState('');
  const [answer,   setAnswer]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<{ bridgeId: string; shortCode: string } | null>(null);
  const [error,    setError]    = useState('');
  const [copied,   setCopied]   = useState<'code' | 'url' | null>(null);

  async function handleCreate() {
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/bridge/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      });
      if (!res.ok) { setError((await res.json().catch(() => ({}))).error || 'Gagal'); return; }
      const data = await res.json();
      setResult({ bridgeId: data.bridgeId, shortCode: data.shortCode });
      setQuestion(''); setAnswer('');
      onCreated();
    } catch { setError('Ralat rangkaian.'); }
    finally  { setLoading(false); }
  }

  async function copy(text: string, field: 'code' | 'url') {
    try { await navigator.clipboard.writeText(text); setCopied(field); setTimeout(() => setCopied(null), 1800); }
    catch { /* noop */ }
  }

  const url = result ? buildPublicUrl(result.shortCode) : '';

  return (
    <div className="bg-ink-300/40 border border-purple-500/30 rounded-xl p-6 mb-8">
      <h3 className="text-sm font-semibold text-cream mb-1 uppercase tracking-wider">Create Bridge Link</h3>
      <p className="text-xs text-cream/50 mb-4">
        Paste your Facebook question + initial advice → create unique link to share.{' '}
        <span className="text-yellow-400">Expires after 3 days</span> with no response, or{' '}
        <span className="text-yellow-400">30 minutes</span> of inactivity.
      </p>

      {!result ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-cream/60 uppercase tracking-wider block mb-1.5">Lead Question</label>
            <textarea value={question} onChange={e => { setQuestion(e.target.value); setError(''); }}
              placeholder="E.g. Developer fled with my house money. Paid 200k but house not ready."
              className="w-full bg-ink-400 border border-ink-300/30 rounded-lg p-3 text-cream text-sm placeholder-cream/40 focus:outline-none focus:border-purple-500 resize-none" rows={2} />
          </div>
          <div>
            <label className="text-xs text-cream/60 uppercase tracking-wider block mb-1.5">Lawyer's Advice</label>
            <textarea value={answer} onChange={e => { setAnswer(e.target.value); setError(''); }}
              placeholder="E.g. Can file claim at HDA Tribunal. I need S&P and receipt of payment."
              className="w-full bg-ink-400 border border-ink-300/30 rounded-lg p-3 text-cream text-sm placeholder-cream/40 focus:outline-none focus:border-purple-500 resize-none" rows={3} />
          </div>
          {error && <p className="text-red-400 text-xs bg-red-900/20 rounded p-2 border border-red-900/30">{error}</p>}
          <button onClick={handleCreate} disabled={!question.trim() || !answer.trim() || loading}
            className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition ${
              !question.trim() || !answer.trim() || loading
                ? 'bg-purple-500/30 text-cream/40 cursor-not-allowed'
                : 'bg-purple-500 text-ink-500 hover:bg-purple-600 active:scale-95'
            }`}>
            {loading ? 'Creating...' : 'Create Link'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-ink-400/60 border border-green-500/30 rounded-lg p-4">
            <p className="text-xs text-green-400/80 uppercase tracking-wider mb-2">✓ Link Created — Share on Facebook</p>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-green-400 flex-1 break-all">{url}</code>
              <button onClick={() => copy(url, 'url')}
                className={`px-3 py-1.5 rounded text-xs font-semibold flex-shrink-0 transition ${
                  copied === 'url' ? 'bg-green-500 text-ink-500' : 'bg-purple-500 text-ink-500 hover:bg-purple-600'
                }`}>
                {copied === 'url' ? '✓ Copied' : 'Copy URL'}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-ink-400/40 border border-ink-300/30 rounded-lg p-3">
            <span className="text-xs text-cream/50">Code:</span>
            <code className="text-sm font-mono font-bold text-cream flex-1">{result.shortCode}</code>
            <button onClick={() => copy(result.shortCode, 'code')}
              className={`px-2 py-0.5 rounded text-xs transition ${
                copied === 'code' ? 'bg-green-500 text-ink-500' : 'bg-ink-300/50 text-cream/60 hover:bg-ink-300'
              }`}>
              {copied === 'code' ? '✓' : 'Copy'}
            </button>
          </div>
          <button onClick={() => setResult(null)}
            className="w-full py-2 px-4 rounded-lg text-sm bg-ink-300/30 text-cream/60 hover:bg-ink-300/50 transition">
            Create Another Link
          </button>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Semua — Activity Log
// ──────────────────────────────────────────────────────────────────
type LogEntry = {
  key: string;
  time: string;
  shortCode: string;
  question: string | null;
  clientName: string | null;
  eventLabel: string;
  eventColor: string;
  detail?: string;
};

function buildLog(bridges: Bridge[]): LogEntry[] {
  const entries: LogEntry[] = [];

  for (const b of bridges) {
    const st = STATUS_STYLE[b.status];

    // Created
    entries.push({
      key: `${b.id}-created`,
      time: b.createdAt,
      shortCode: b.shortCode,
      question: b.initialQuestion,
      clientName: b.clientName,
      eventLabel: 'Dicipta',
      eventColor: 'text-purple-400',
    });

    // Chat started (has turns)
    if (b.turnCount > 0) {
      entries.push({
        key: `${b.id}-chat`,
        time: b.updatedAt,
        shortCode: b.shortCode,
        question: b.initialQuestion,
        clientName: b.clientName,
        eventLabel: `Sembang ${b.turnCount}/3`,
        eventColor: 'text-green-400',
        detail: b.clientName ? `Nama: ${b.clientName}` : undefined,
      });
    }

    // Terminal states
    if (b.status === 'COMPLETED') {
      entries.push({
        key: `${b.id}-completed`,
        time: b.updatedAt,
        shortCode: b.shortCode,
        question: b.initialQuestion,
        clientName: b.clientName,
        eventLabel: 'Selesai',
        eventColor: 'text-blue-400',
        detail: b.clientName ? `${b.clientName}${b.clientPhone ? ' · ' + b.clientPhone : ''}` : undefined,
      });
    }
    if (b.status === 'EXPIRED') {
      entries.push({
        key: `${b.id}-expired`,
        time: b.updatedAt,
        shortCode: b.shortCode,
        question: b.initialQuestion,
        clientName: null,
        eventLabel: 'Luput',
        eventColor: 'text-yellow-400',
        detail: b.turnCount > 0 ? '30 min inactivity' : 'No response for 3 days',
      });
    }
    if (b.status === 'DELETED') {
      entries.push({
        key: `${b.id}-deleted`,
        time: b.updatedAt,
        shortCode: b.shortCode,
        question: b.initialQuestion,
        clientName: null,
        eventLabel: 'Deleted',
        eventColor: 'text-red-400',
        detail: 'URL tidak aktif',
      });
    }
  }

  return entries.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

function ActivityLog({ bridges }: { bridges: Bridge[] }) {
  const log = buildLog(bridges);

  if (log.length === 0) {
    return (
      <div className="card-base rounded-2xl p-12 text-center">
        <div className="text-4xl mb-4">📋</div>
        <p className="text-cream/60 text-sm">No bridge activity yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <p className="text-xs text-cream/40 mb-3">{log.length} entri aktiviti</p>
      {log.map(ev => (
        <div key={ev.key} className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-ink-300/10 transition group">
          <span className={`text-xs font-semibold w-16 flex-shrink-0 pt-0.5 ${ev.eventColor}`}>
            {ev.eventLabel}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <code className="text-xs font-mono text-purple-400/80">{ev.shortCode}</code>
              {ev.clientName && <span className="text-xs text-cream/60">· {ev.clientName}</span>}
            </div>
            <p className="text-xs text-cream/40 truncate">{ev.detail ?? ev.question ?? '—'}</p>
          </div>
          <div className="flex-shrink-0 text-right opacity-60 group-hover:opacity-100 transition">
            <p className="text-[10px] text-cream/60">{timeAgo(ev.time)}</p>
            <p className="text-[10px] text-cream/30">{formatDate(ev.time)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Bridge Row with inline two-step delete confirm
// ──────────────────────────────────────────────────────────────────
function BridgeRow({
  bridge, expanded, onToggle, onDelete, onMarkCompleted,
}: {
  bridge: Bridge;
  expanded: boolean;
  onToggle: () => void;
  onDelete: (id: string) => Promise<void>;
  onMarkCompleted: (id: string) => Promise<void>;
}) {
  const [copyDone,   setCopyDone]   = useState(false);
  const [confirming, setConfirming] = useState(false); // two-step delete
  const [working,    setWorking]    = useState(false);

  const st       = STATUS_STYLE[bridge.status] ?? STATUS_STYLE.DELETED;
  const url      = buildPublicUrl(bridge.shortCode);
  const canShare = bridge.status === 'ACTIVE';

  async function copyUrl(e: React.MouseEvent) {
    e.stopPropagation();
    try { await navigator.clipboard.writeText(url); setCopyDone(true); setTimeout(() => setCopyDone(false), 1500); }
    catch { /* noop */ }
  }

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return; }
    setWorking(true);
    await onDelete(bridge.id);
    setWorking(false);
    setConfirming(false);
  }

  async function handleComplete() {
    setWorking(true);
    await onMarkCompleted(bridge.id);
    setWorking(false);
  }

  return (
    <div className={`card-base rounded-xl border transition-all ${
      st.dim ? 'opacity-60 border-ink-300/10' : 'border-purple/10 hover:border-purple/30'
    } bg-ink-300/20`}>

      {/* Summary row */}
      <button onClick={onToggle} className="w-full text-left p-4">
        <div className="flex items-start gap-3">
          <div className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-sm font-mono font-bold text-purple-400">{bridge.shortCode}</code>
              <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${st.pill}`}>
                {st.label}
              </span>
              {bridge.clientName && (
                <><span className="text-xs text-cream/30">·</span><span className="text-xs text-cream/70">{bridge.clientName}</span></>
              )}
              {bridge.clientPhone && (
                <span className="text-xs text-cream/50">{bridge.clientPhone}</span>
              )}
              {bridge.turnCount > 0 && (
                <span className="text-[10px] text-cream/40 bg-cream/5 px-1.5 py-0.5 rounded">
                  {bridge.turnCount}/3 jawapan
                </span>
              )}
            </div>
            <p className="text-xs text-cream/50 mt-0.5 line-clamp-1">{bridge.initialQuestion ?? '—'}</p>
          </div>
          <div className="flex-shrink-0 flex flex-col items-end gap-1">
            <p className="text-[10px] text-cream/40">{timeAgo(bridge.createdAt)}</p>
            {canShare ? (
              <button onClick={copyUrl}
                className={`text-[10px] px-2 py-0.5 rounded transition ${
                  copyDone ? 'bg-green-500 text-ink-500' : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/40'
                }`}>
                {copyDone ? '✓ Disalin' : 'Salin URL'}
              </button>
            ) : (
              <span className="text-[10px] text-cream/20">{st.label}</span>
            )}
          </div>
          <span className="text-cream/30 ml-1 flex-shrink-0 mt-1">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-ink-300/30 px-4 pb-4 pt-3 space-y-4">

          {/* URL */}
          <div>
            <p className="text-[10px] text-cream/40 uppercase tracking-wider mb-1">Public Bridge Link</p>
            {canShare ? (
              <code className="text-xs font-mono text-green-400 break-all bg-ink-500/40 block px-2 py-1.5 rounded">{url}</code>
            ) : (
              <span className="text-xs text-cream/30 italic">
                {bridge.status === 'DELETED' ? 'URL disabled — link inactive' : `Link ${st.label.toLowerCase()}`}
              </span>
            )}
          </div>

          {/* Q&A */}
          <div>
            <p className="text-[10px] text-cream/40 uppercase tracking-wider mb-1">Original Question</p>
            <p className="text-sm text-cream/80 whitespace-pre-wrap bg-ink-500/40 rounded p-3 leading-relaxed">
              {bridge.initialQuestion ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-cream/40 uppercase tracking-wider mb-1">Lawyer's Advice</p>
            <p className="text-sm text-cream/80 whitespace-pre-wrap bg-ink-500/40 rounded p-3 leading-relaxed">
              {bridge.initialAnswer ?? '—'}
            </p>
          </div>

          {/* Client info */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Name',   val: bridge.clientName },
              { label: 'Phone', val: bridge.clientPhone },
              { label: 'Email',  val: bridge.clientEmail },
            ].map(f => (
              <div key={f.label}>
                <p className="text-[10px] text-cream/40 uppercase tracking-wider mb-0.5">{f.label}</p>
                <p className="text-xs text-cream font-medium truncate">{f.val ?? '—'}</p>
              </div>
            ))}
          </div>

          {/* Timestamps */}
          <div className="text-[10px] text-cream/30 border-t border-ink-300/10 pt-2 space-y-0.5">
            <p>Created: {formatDate(bridge.createdAt)}</p>
            <p>Updated: {formatDate(bridge.updatedAt)}</p>
          </div>

          {/* Actions — hide for already-deleted */}
          {bridge.status !== 'DELETED' && (
            <div className="flex items-center gap-2 pt-2 border-t border-ink-300/20">
              {bridge.status === 'ACTIVE' && (
                <button onClick={handleComplete} disabled={working}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 disabled:opacity-40 transition">
                  {working ? '...' : 'Mark Complete'}
                </button>
              )}

              {/* Two-step delete */}
              <div className="ml-auto flex items-center gap-2">
                {confirming && (
                  <button onClick={() => setConfirming(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-cream/60 hover:text-cream transition">
                    Cancel
                  </button>
                )}
                <button onClick={handleDelete} disabled={working}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-40 ${
                    confirming
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-red-500/20 text-red-300 hover:bg-red-500/40'
                  }`}>
                  {working ? 'Deleting...' : confirming ? 'Sure? Click again' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────────
export default function BridgeManagerPage() {
  const [bridges,  setBridges]  = useState<Bridge[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<FilterKey>('ACTIVE');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error,    setError]    = useState('');

  const fetchBridges = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/bridges', { cache: 'no-store' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Gagal memuatkan');
      const data = await res.json();
      setBridges(data.bridges ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ralat rangkaian');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBridges(); }, [fetchBridges]);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/bridges/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DELETED' }),
    });
    if (res.ok) {
      await fetchBridges();
      setExpanded(null);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Gagal memadam');
    }
  }

  async function handleMarkCompleted(id: string) {
    const res = await fetch(`/api/admin/bridges/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    if (res.ok) {
      await fetchBridges();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Gagal mengemaskini');
    }
  }

  const filtered = filter ? bridges.filter(b => b.status === filter) : bridges;
  const isSemua  = filter === '';

  const stats = {
    active:    bridges.filter(b => b.status === 'ACTIVE').length,
    completed: bridges.filter(b => b.status === 'COMPLETED').length,
    expired:   bridges.filter(b => b.status === 'EXPIRED').length,
    deleted:   bridges.filter(b => b.status === 'DELETED').length,
  };

  return (
    <div className="min-h-screen bg-ink-400 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-purple-gradient mb-1">Bridge Manager</h1>
          <p className="text-sm text-cream/50">
            Create link from Facebook question → Donna collects info → lawyer receives lead.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Active',   value: stats.active,    color: 'text-green-400',  key: 'ACTIVE' },
            { label: 'Complete', value: stats.completed, color: 'text-blue-400',   key: 'COMPLETED' },
            { label: 'Expired',   value: stats.expired,   color: 'text-yellow-400', key: 'EXPIRED' },
            { label: 'Deleted', value: stats.deleted,   color: 'text-red-400',    key: 'DELETED' },
          ].map(s => (
            <button key={s.label} onClick={() => setFilter(s.key as FilterKey)}
              className={`card-base rounded-xl p-4 text-center transition hover:border-purple/30 border ${
                filter === s.key ? 'border-purple/40 bg-purple-500/10' : 'border-transparent'
              }`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-cream/50 mt-1">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-300/60 hover:text-red-300 ml-4">✕</button>
          </div>
        )}

        {/* Bridge Creator */}
        <BridgeCreator onCreated={fetchBridges} />

        {/* Filter Tabs */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2 flex-wrap">
            {FILTER_TABS.map(tab => (
              <button key={tab.key} onClick={() => setFilter(tab.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition border ${
                  filter === tab.key
                    ? 'bg-purple-500 text-ink-500 border-purple-500'
                    : 'bg-ink-300/20 text-cream/60 border-purple/10 hover:border-purple/30 hover:text-cream'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
          <button onClick={fetchBridges} disabled={loading}
            className="text-xs text-cream/50 hover:text-purple-400 transition disabled:opacity-30">
            {loading ? '...' : '↻ Refresh'}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16 text-cream/40 text-sm">Memuatkan...</div>
        ) : isSemua ? (
          <ActivityLog bridges={bridges} />
        ) : filtered.length === 0 ? (
          <div className="card-base rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">
              {filter === 'ACTIVE' ? '🌉' : filter === 'COMPLETED' ? '✅' : filter === 'EXPIRED' ? '⏱' : '🗑'}
            </div>
            <p className="text-cream/60 text-sm">No {FILTER_TABS.find(t => t.key === filter)?.label.toLowerCase()} bridges.</p>
            {filter === 'ACTIVE' && (
              <p className="text-cream/30 text-xs mt-2">Use the form above to create a new bridge.</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(bridge => (
              <BridgeRow key={bridge.id} bridge={bridge}
                expanded={expanded === bridge.id}
                onToggle={() => setExpanded(expanded === bridge.id ? null : bridge.id)}
                onDelete={handleDelete}
                onMarkCompleted={handleMarkCompleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
