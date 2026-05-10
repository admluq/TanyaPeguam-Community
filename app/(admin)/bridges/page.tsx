'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type InquiryStatus = 'PENDING' | 'EMAILED' | 'ACCEPTED' | 'REJECTED' | 'DEFLECTED';

interface Inquiry {
  id: string;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  practiceArea: string | null;
  issueSummary: string | null;
  concreteScore: number;
  urgencyTag: string | null;
  sophistication: string | null;
  suggestedTier: string | null;
  deflected: boolean;
  status: InquiryStatus;
  emailSentAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<InquiryStatus, { label: string; dot: string; bg: string }> = {
  PENDING:   { label: 'Menunggu',  dot: 'bg-yellow-400',  bg: 'bg-yellow-900/20 border-yellow-500/20' },
  EMAILED:   { label: 'Diemelkan', dot: 'bg-blue-400',    bg: 'bg-blue-900/20 border-blue-500/20' },
  ACCEPTED:  { label: 'Diterima',  dot: 'bg-green-400',   bg: 'bg-green-900/20 border-green-500/20' },
  REJECTED:  { label: 'Ditolak',   dot: 'bg-red-400',     bg: 'bg-red-900/20 border-red-500/20' },
  DEFLECTED: { label: 'Dilentur',  dot: 'bg-gray-400',    bg: 'bg-gray-900/20 border-gray-500/20' },
};

const URGENCY_COLOR: Record<string, string> = {
  STANDARD: 'text-cream/50',
  MEDIUM:   'text-orange-400',
  HIGH:     'text-red-400',
  CRITICAL: 'text-red-500 font-bold',
};

const TIER_CONFIG: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Konsultasi Percuma', color: 'text-green-400' },
  MED: { label: 'Konsultasi Berbayar', color: 'text-indigo-400' },
  HIGH: { label: 'Penahanan Penuh', color: 'text-purple-400' },
};

const FILTER_TABS: { key: string; label: string }[] = [
  { key: '',          label: 'Semua' },
  { key: 'EMAILED',   label: 'Diemelkan' },
  { key: 'ACCEPTED',  label: 'Diterima' },
  { key: 'REJECTED',  label: 'Ditolak' },
  { key: 'DEFLECTED', label: 'Dilentur' },
];

// Bridge Creator Component
function BridgeCreator() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ bridgeId: string; shortCode: string } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleCreateBridge() {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/bridge/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Gagal mencipta pautan');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setResult(data);
      setQuestion(''); // Clear form
      setAnswer('');
      setCopied(false);
    } catch (err) {
      console.error('Bridge creation error:', err);
      setError('Ralat rangkaian. Sila cuba lagi.');
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    if (result) {
      try {
        await navigator.clipboard.writeText(result.shortCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }
  }

  return (
    <div className="bg-black border-2 border-yellow-500 rounded-xl p-6 mb-6">
      <h3 className="text-sm font-semibold text-cream mb-3 uppercase tracking-wider">
        Jana Pautan Jambatan
      </h3>

      {!result ? (
        <div className="space-y-3">
          {/* Question Input */}
          <div>
            <label className="text-xs text-cream/60 uppercase tracking-wider block mb-1.5">
              Soalan Pelanggan
            </label>
            <textarea
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                setError('');
              }}
              placeholder="Masukkan soalan atau pertanyaan dari Facebook/calon klien..."
              className="w-full bg-ink-400 border border-ink-300/30 rounded-lg p-3 text-cream text-sm placeholder-cream/40 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 resize-none"
              rows={2}
            />
          </div>

          {/* Answer Input */}
          <div>
            <label className="text-xs text-cream/60 uppercase tracking-wider block mb-1.5">
              Nasihat Awal Peguam
            </label>
            <textarea
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                setError('');
              }}
              placeholder="Sertakan nasihat awal atau respons anda kepada soalan ini untuk membantu calon klien menilai kesesuaian..."
              className="w-full bg-ink-400 border border-ink-300/30 rounded-lg p-3 text-cream text-sm placeholder-cream/40 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 resize-none"
              rows={3}
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs bg-red-900/20 rounded p-2 border border-red-900/30">
              {error}
            </div>
          )}

          <button
            onClick={handleCreateBridge}
            disabled={!question.trim() || !answer.trim() || loading}
            className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition ${
              !question.trim() || !answer.trim() || loading
                ? 'bg-purple-500/30 text-cream/40 cursor-not-allowed'
                : 'bg-purple-500 text-ink-500 hover:bg-purple-600 active:scale-95'
            }`}
          >
            {loading ? 'Mencipta...' : 'Jana Pautan'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-ink-400/40 border border-green-500/30 rounded-lg p-4">
            <p className="text-xs text-cream/60 uppercase tracking-wider mb-2">Kod Pautan Jambatan</p>
            <div className="flex items-center gap-2">
              <code className="text-lg font-mono font-bold text-green-400 flex-1">
                {result.shortCode}
              </code>
              <button
                onClick={copyToClipboard}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                  copied
                    ? 'bg-green-500 text-ink-500'
                    : 'bg-purple-500 text-ink-500 hover:bg-purple-600'
                }`}
              >
                {copied ? '✓ Disalin' : 'Salin'}
              </button>
            </div>
            <p className="text-xs text-cream/50 mt-2">
              Berkongsi kod ini dengan calon klien. Mereka akan melihat soalan, nasihat anda, dan borang pendaftaran semasa mengakses widget Donna.
            </p>
          </div>

          <button
            onClick={() => {
              setResult(null);
              setQuestion('');
              setAnswer('');
            }}
            className="w-full py-2 px-4 rounded-lg font-semibold text-sm bg-ink-300/20 text-cream/60 hover:bg-ink-300/30 transition"
          >
            Jana Pautan Lain
          </button>
        </div>
      )}
    </div>
  );
}

export default function BridgesPage() {
  const [inquiries, setInquiries]     = useState<Inquiry[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('');
  const [expanded, setExpanded]       = useState<string | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, [filter]);

  async function fetchInquiries() {
    setLoading(true);
    try {
      const url = `/api/admin/donna-inquiry${filter ? `?status=${filter}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries ?? []);
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('ms-MY', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  const stats = {
    total:    inquiries.length,
    accepted: inquiries.filter((i) => i.status === 'ACCEPTED').length,
    pending:  inquiries.filter((i) => ['PENDING', 'EMAILED'].includes(i.status)).length,
    deflected: inquiries.filter((i) => i.status === 'DEFLECTED').length,
  };

  return (
    <div className="min-h-screen bg-ink-400 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-display font-bold text-purple-gradient mb-1">
              Peti Masuk Pertanyaan
            </h1>
            <Link href="/donna" className="text-purple-400 hover:text-purple-300">
              ← Back: Step 3
            </Link>
          </div>
          <p className="text-sm text-cream/50">
            Semua pertanyaan yang diproses oleh Donna AI
          </p>
          <div className="flex items-center justify-between mt-4 py-4 px-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <span className="text-sm font-semibold text-cream">Step 4 of 5: Bridge Manager</span>
            <span className="text-xs text-cream/60">Manage intake inquiries and create bridge links</span>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Jumlah',    value: stats.total,     color: 'text-cream' },
            { label: 'Menunggu',  value: stats.pending,   color: 'text-yellow-400' },
            { label: 'Diterima',  value: stats.accepted,  color: 'text-green-400' },
            { label: 'Dilentur',  value: stats.deflected, color: 'text-cream/40' },
          ].map((s) => (
            <div key={s.label} className="card-base rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-cream/50 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Bridge Creator */}
        <BridgeCreator />

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition border ${
                filter === tab.key
                  ? 'bg-purple-500 text-ink-500 border-purple-500'
                  : 'bg-ink-300/20 text-cream/60 border-purple/10 hover:border-purple/30 hover:text-cream'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Inquiry List */}
        {loading ? (
          <div className="text-center py-16 text-cream/40">Memuatkan pertanyaan...</div>
        ) : inquiries.length === 0 ? (
          <div className="card-base rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-cream/60 text-sm">Tiada pertanyaan {filter ? 'dalam kategori ini' : 'lagi'}.</p>
            <p className="text-cream/30 text-xs mt-2">
              Pertanyaan akan muncul di sini apabila seseorang berinteraksi dengan Donna Widget anda.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inquiry) => {
              const st = STATUS_CONFIG[inquiry.status];
              const tier = inquiry.suggestedTier ? TIER_CONFIG[inquiry.suggestedTier] : null;
              const isOpen = expanded === inquiry.id;

              return (
                <div
                  key={inquiry.id}
                  className={`card-base rounded-xl border transition ${st.bg}`}
                >
                  {/* Row summary */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : inquiry.id)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-start gap-3">
                      {/* Status dot */}
                      <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`} />

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-cream">
                            {inquiry.clientName ?? 'Tidak Dikenali'}
                          </span>
                          <span className="text-xs text-cream/40">·</span>
                          <span className="text-xs text-cream/50">
                            {inquiry.practiceArea ?? 'Umum'}
                          </span>
                          {inquiry.urgencyTag && inquiry.urgencyTag !== 'STANDARD' && (
                            <span className={`text-xs ${URGENCY_COLOR[inquiry.urgencyTag]}`}>
                              ⚡ {inquiry.urgencyTag}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-cream/50 mt-0.5 truncate max-w-lg">
                          {inquiry.issueSummary ?? '—'}
                        </p>
                      </div>

                      {/* Right meta */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-cream/40">{formatDate(inquiry.createdAt)}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-xs text-cream/40">Skor:</span>
                          <span className="text-xs font-bold text-purple-400">{inquiry.concreteScore}</span>
                        </div>
                      </div>

                      {/* Chevron */}
                      <span className="text-cream/30 ml-1 flex-shrink-0 mt-0.5">
                        {isOpen ? '▲' : '▼'}
                      </span>
                    </div>
                  </button>

                  {/* Expanded detail panel */}
                  {isOpen && (
                    <div className="border-t border-ink-300/20 px-4 pb-4 pt-3 space-y-4">
                      {/* Contact row */}
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-cream/40 uppercase tracking-wider text-[10px] mb-0.5">Telefon</p>
                          <p className="text-cream font-medium">{inquiry.clientPhone ?? '—'}</p>
                        </div>
                        <div>
                          <p className="text-cream/40 uppercase tracking-wider text-[10px] mb-0.5">E-mel</p>
                          <p className="text-cream font-medium truncate">{inquiry.clientEmail ?? '—'}</p>
                        </div>
                        <div>
                          <p className="text-cream/40 uppercase tracking-wider text-[10px] mb-0.5">Tahap Bahasa</p>
                          <p className="text-cream font-medium">{inquiry.sophistication ?? '—'}</p>
                        </div>
                      </div>

                      {/* Scores row */}
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-cream/40 uppercase tracking-wider text-[10px] mb-0.5">Skor Konkrit</p>
                          <p className={`font-bold text-base ${
                            inquiry.concreteScore >= 70 ? 'text-green-400' :
                            inquiry.concreteScore >= 40 ? 'text-yellow-400' : 'text-cream/50'
                          }`}>
                            {inquiry.concreteScore}/100
                          </p>
                        </div>
                        <div>
                          <p className="text-cream/40 uppercase tracking-wider text-[10px] mb-0.5">Kemendesakan</p>
                          <p className={`font-semibold ${URGENCY_COLOR[inquiry.urgencyTag ?? 'STANDARD']}`}>
                            {inquiry.urgencyTag ?? 'STANDARD'}
                          </p>
                        </div>
                        <div>
                          <p className="text-cream/40 uppercase tracking-wider text-[10px] mb-0.5">Tier Dicadang</p>
                          {tier ? (
                            <p className={`font-semibold ${tier.color}`}>{tier.label}</p>
                          ) : (
                            <p className="text-cream/40">—</p>
                          )}
                        </div>
                      </div>

                      {/* Issue summary */}
                      {inquiry.issueSummary && (
                        <div>
                          <p className="text-cream/40 uppercase tracking-wider text-[10px] mb-1">Ringkasan Isu</p>
                          <p className="text-sm text-cream/80 leading-relaxed bg-ink-500/40 rounded-lg p-3">
                            {inquiry.issueSummary}
                          </p>
                        </div>
                      )}

                      {/* Status timeline */}
                      <div className="flex items-center gap-4 text-[10px] text-cream/40 pt-1 border-t border-ink-300/10">
                        <span>Dicipta: {formatDate(inquiry.createdAt)}</span>
                        {inquiry.emailSentAt && <span>Emel: {formatDate(inquiry.emailSentAt)}</span>}
                        {inquiry.acceptedAt && <span className="text-green-400">Diterima: {formatDate(inquiry.acceptedAt)}</span>}
                        {inquiry.rejectedAt && <span className="text-red-400">Ditolak: {formatDate(inquiry.rejectedAt)}</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
