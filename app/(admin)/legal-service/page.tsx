'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const MALAYSIAN_STATES = [
  'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
  'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Sabah',
  'Sarawak', 'Selangor', 'Terengganu',
  'Kuala Lumpur', 'Labuan', 'Putrajaya',
];

const BAR_BODIES = [
  'Majlis Peguam Malaysia (Bar Council)',
  'Persatuan Peguam Sabah',
  'Persatuan Peguam Sarawak',
];

const OPERATING_HOURS = [
  { value: 'isnin-jumaat-9-5', label: 'Isnin–Jumaat, 9am–5pm' },
  { value: 'isnin-sabtu-9-6', label: 'Isnin–Sabtu, 9am–6pm' },
  { value: 'setiap-hari-9-5', label: 'Setiap hari, 9am–5pm' },
];

const SERVICE_TIERS = [
  {
    value: 'LOW',
    label: 'Low',
    desc: 'Basic consultation & document review',
    color: 'border-green-500/40 bg-green-500/10 text-green-300',
    activeColor: 'border-green-400 bg-green-500/30 text-green-200',
  },
  {
    value: 'MEDIUM',
    label: 'Medium',
    desc: 'Full representation & advisory',
    color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
    activeColor: 'border-yellow-400 bg-yellow-500/30 text-yellow-200',
  },
  {
    value: 'HIGH',
    label: 'High',
    desc: 'Complex litigation & premium service',
    color: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
    activeColor: 'border-purple-400 bg-purple-500/30 text-purple-200',
  },
];

export default function LegalServiceConfigPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    // Jurisdiction
    negeriOperasi: '',
    badanPeguam: [] as string[],

    // Hours & Fees
    waktuOperasi: 'isnin-jumaat-9-5',
    modKonsultasi: 'PERCUMA' as 'PERCUMA' | 'BERBAYAR',
    yuranKonsultasi: '',
    yuranKecemasan: '',
    yuranVideoMeeting: '',
    yuranVideoMeetingKecemasan: '',
    yuranMeetingFizikal: '',
    yuranMeetingFizikalKecemasan: '',

    // Contact
    emelPertanyaan: '',

    // Service Tier (multi-select)
    tierPerkhidmatan: [] as ('LOW' | 'MEDIUM' | 'HIGH')[],
  });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) fetchConfig();
  }, [session]);

  async function fetchConfig() {
    try {
      const res = await fetch('/api/admin/legal-service');
      if (res.ok) {
        const data = await res.json();
        const c = data.config;
        if (!c) return;
        setForm({
          negeriOperasi: c.negeriOperasi || '',
          badanPeguam: c.badanPeguam || [],
          waktuOperasi: c.waktuOperasi || 'isnin-jumaat-9-5',
          modKonsultasi: c.modKonsultasi || 'PERCUMA',
          yuranKonsultasi: c.yuranKonsultasi?.toString() || '',
          yuranKecemasan: c.yuranKecemasan?.toString() || '',
          yuranVideoMeeting: c.yuranVideoMeeting?.toString() || '',
          yuranVideoMeetingKecemasan: c.yuranVideoMeetingKecemasan?.toString() || '',
          yuranMeetingFizikal: c.yuranMeetingFizikal?.toString() || '',
          yuranMeetingFizikalKecemasan: c.yuranMeetingFizikalKecemasan?.toString() || '',
          emelPertanyaan: c.emelPertanyaan || '',
          tierPerkhidmatan: (c.tierPerkhidmatan || []) as ('LOW' | 'MEDIUM' | 'HIGH')[],
        });
      }
    } catch (err) {
      console.error('Failed to fetch legal service config:', err);
    }
  }

  function toggleBadanPeguam(body: string) {
    setForm((f) => ({
      ...f,
      badanPeguam: f.badanPeguam.includes(body)
        ? f.badanPeguam.filter((b) => b !== body)
        : [...f.badanPeguam, body],
    }));
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/legal-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center text-cream">Loading...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cream mb-2">Legal Service Config</h1>
          <p className="text-cream/60">Configure jurisdiction, fees, services, and service tier for Donna AI triage</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Bidang Kuasa ── */}
          <section className="card-base border border-purple/20 rounded-lg p-6 space-y-5">
            <div>
              <h2 className="text-base font-bold text-cream mb-0.5">Bidang Kuasa</h2>
              <p className="text-xs text-cream/50">Negeri operasi dan badan peguam anda.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-cream mb-2">Negeri Operasi Utama</label>
              <select
                value={form.negeriOperasi}
                onChange={(e) => setForm({ ...form, negeriOperasi: e.target.value })}
                className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream focus:outline-none focus:border-purple-500"
              >
                <option value="">Pilih negeri...</option>
                {MALAYSIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-cream mb-3">Badan Peguam</label>
              <div className="space-y-2">
                {BAR_BODIES.map((body) => (
                  <button
                    key={body}
                    type="button"
                    onClick={() => toggleBadanPeguam(body)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition ${
                      form.badanPeguam.includes(body)
                        ? 'bg-purple-600/20 border-purple-400 text-cream'
                        : 'bg-ink-300 border-purple/20 text-cream/70 hover:border-purple/40'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      form.badanPeguam.includes(body) ? 'border-purple-400 bg-purple-500' : 'border-cream/30'
                    }`}>
                      {form.badanPeguam.includes(body) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span className="text-sm">{body}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Waktu & Yuran ── */}
          <section className="card-base border border-purple/20 rounded-lg p-6 space-y-5">
            <div>
              <h2 className="text-base font-bold text-cream mb-0.5">Waktu & Yuran</h2>
              <p className="text-xs text-cream/50">Tetapkan waktu operasi dan struktur yuran anda.</p>
            </div>

            {/* Operating Hours */}
            <div>
              <label className="block text-sm font-semibold text-cream mb-3">Waktu Operasi</label>
              <div className="space-y-2">
                {OPERATING_HOURS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, waktuOperasi: opt.value })}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition ${
                      form.waktuOperasi === opt.value
                        ? 'bg-purple-600/20 border-purple-400 text-cream'
                        : 'bg-ink-300 border-purple/20 text-cream/70 hover:border-purple/40'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      form.waktuOperasi === opt.value ? 'border-purple-400 bg-purple-500' : 'border-cream/30'
                    }`}>
                      {form.waktuOperasi === opt.value && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span className="text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* First Consultation Mode */}
            <div>
              <label className="block text-sm font-semibold text-cream mb-3">Mod Konsultasi Pertama</label>
              <div className="space-y-2">
                {(['PERCUMA', 'BERBAYAR'] as const).map((mod) => (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => setForm({ ...form, modKonsultasi: mod })}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition ${
                      form.modKonsultasi === mod
                        ? 'bg-purple-600/20 border-purple-400 text-cream'
                        : 'bg-ink-300 border-purple/20 text-cream/70 hover:border-purple/40'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      form.modKonsultasi === mod ? 'border-purple-400 bg-purple-500' : 'border-cream/30'
                    }`}>
                      {form.modKonsultasi === mod && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <span className="text-sm font-medium">{mod === 'PERCUMA' ? 'Percuma' : 'Berbayar'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fee Fields - disabled when PERCUMA */}
            <div className={`grid grid-cols-2 gap-4 ${form.modKonsultasi === 'PERCUMA' ? 'opacity-50 pointer-events-none' : ''}`}>
              <div>
                <label className={`block text-xs font-semibold mb-2 ${form.modKonsultasi === 'PERCUMA' ? 'text-cream/40' : 'text-cream/70'}`}>Yuran Konsultasi (RM)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/50 text-sm">RM</span>
                  <input
                    type="number"
                    value={form.yuranKonsultasi}
                    onChange={(e) => setForm({ ...form, yuranKonsultasi: e.target.value })}
                    disabled={form.modKonsultasi === 'PERCUMA'}
                    placeholder="0"
                    className={`w-full rounded-lg pl-10 pr-4 py-2 focus:outline-none transition ${form.modKonsultasi === 'PERCUMA' ? 'bg-ink-200 border border-cream/20 text-cream/40 cursor-not-allowed' : 'bg-ink-300 border border-purple/30 text-cream focus:border-purple-500'}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-2 ${form.modKonsultasi === 'PERCUMA' ? 'text-cream/40' : 'text-cream/70'}`}>Yuran Kecemasan (RM)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/50 text-sm">RM</span>
                  <input
                    type="number"
                    value={form.yuranKecemasan}
                    onChange={(e) => setForm({ ...form, yuranKecemasan: e.target.value })}
                    disabled={form.modKonsultasi === 'PERCUMA'}
                    placeholder="0"
                    className={`w-full rounded-lg pl-10 pr-4 py-2 focus:outline-none transition ${form.modKonsultasi === 'PERCUMA' ? 'bg-ink-200 border border-cream/20 text-cream/40 cursor-not-allowed' : 'bg-ink-300 border border-purple/30 text-cream focus:border-purple-500'}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-2 ${form.modKonsultasi === 'PERCUMA' ? 'text-cream/40' : 'text-cream/70'}`}>Yuran Video Meeting (RM)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/50 text-sm">RM</span>
                  <input
                    type="number"
                    value={form.yuranVideoMeeting}
                    onChange={(e) => setForm({ ...form, yuranVideoMeeting: e.target.value })}
                    disabled={form.modKonsultasi === 'PERCUMA'}
                    placeholder="0"
                    className={`w-full rounded-lg pl-10 pr-4 py-2 focus:outline-none transition ${form.modKonsultasi === 'PERCUMA' ? 'bg-ink-200 border border-cream/20 text-cream/40 cursor-not-allowed' : 'bg-ink-300 border border-purple/30 text-cream focus:border-purple-500'}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-2 ${form.modKonsultasi === 'PERCUMA' ? 'text-cream/40' : 'text-cream/70'}`}>Video Meeting Kecemasan (RM)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/50 text-sm">RM</span>
                  <input
                    type="number"
                    value={form.yuranVideoMeetingKecemasan}
                    onChange={(e) => setForm({ ...form, yuranVideoMeetingKecemasan: e.target.value })}
                    disabled={form.modKonsultasi === 'PERCUMA'}
                    placeholder="0"
                    className={`w-full rounded-lg pl-10 pr-4 py-2 focus:outline-none transition ${form.modKonsultasi === 'PERCUMA' ? 'bg-ink-200 border border-cream/20 text-cream/40 cursor-not-allowed' : 'bg-ink-300 border border-purple/30 text-cream focus:border-purple-500'}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-2 ${form.modKonsultasi === 'PERCUMA' ? 'text-cream/40' : 'text-cream/70'}`}>Yuran Meeting Fizikal (RM)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/50 text-sm">RM</span>
                  <input
                    type="number"
                    value={form.yuranMeetingFizikal}
                    onChange={(e) => setForm({ ...form, yuranMeetingFizikal: e.target.value })}
                    disabled={form.modKonsultasi === 'PERCUMA'}
                    placeholder="0"
                    className={`w-full rounded-lg pl-10 pr-4 py-2 focus:outline-none transition ${form.modKonsultasi === 'PERCUMA' ? 'bg-ink-200 border border-cream/20 text-cream/40 cursor-not-allowed' : 'bg-ink-300 border border-purple/30 text-cream focus:border-purple-500'}`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-2 ${form.modKonsultasi === 'PERCUMA' ? 'text-cream/40' : 'text-cream/70'}`}>Meeting Fizikal Kecemasan (RM)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/50 text-sm">RM</span>
                  <input
                    type="number"
                    value={form.yuranMeetingFizikalKecemasan}
                    onChange={(e) => setForm({ ...form, yuranMeetingFizikalKecemasan: e.target.value })}
                    disabled={form.modKonsultasi === 'PERCUMA'}
                    placeholder="0"
                    className={`w-full rounded-lg pl-10 pr-4 py-2 focus:outline-none transition ${form.modKonsultasi === 'PERCUMA' ? 'bg-ink-200 border border-cream/20 text-cream/40 cursor-not-allowed' : 'bg-ink-300 border border-purple/30 text-cream focus:border-purple-500'}`}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── Emel Pertanyaan ── */}
          <section className="card-base border border-purple/20 rounded-lg p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-cream mb-0.5">Emel Pertanyaan</h2>
              <p className="text-xs text-cream/50">Emel untuk menerima pertanyaan klien dari Donna AI.</p>
            </div>
            <input
              type="email"
              value={form.emelPertanyaan}
              onChange={(e) => setForm({ ...form, emelPertanyaan: e.target.value })}
              placeholder="contoh@peguam.com"
              className="w-full bg-ink-300 border border-purple/30 rounded-lg px-4 py-2 text-cream focus:outline-none focus:border-purple-500"
            />
          </section>


          {/* ── Tier Perkhidmatan ── */}
          <section className="card-base border border-purple/20 rounded-lg p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-cream mb-0.5">Tier Perkhidmatan</h2>
              <p className="text-xs text-cream/50">Tahap perkhidmatan yang ditawarkan — digunakan oleh Donna untuk menapis pertanyaan.</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {SERVICE_TIERS.map((tier) => {
                const isSelected = form.tierPerkhidmatan.includes(tier.value as 'LOW' | 'MEDIUM' | 'HIGH');
                return (
                  <button
                    key={tier.value}
                    type="button"
                    onClick={() => {
                      setForm({
                        ...form,
                        tierPerkhidmatan: isSelected
                          ? form.tierPerkhidmatan.filter((t) => t !== tier.value)
                          : [...form.tierPerkhidmatan, tier.value as 'LOW' | 'MEDIUM' | 'HIGH'],
                      });
                    }}
                    className={`flex flex-col items-center gap-2 px-4 py-5 rounded-lg border-2 transition text-center ${
                      isSelected ? tier.activeColor : tier.color
                    }`}
                  >
                    <span className="text-lg font-bold">{tier.label}</span>
                    <span className="text-xs opacity-80 leading-snug">{tier.desc}</span>
                    {isSelected && (
                      <span className="text-xs font-bold mt-1 opacity-90">✓ Dipilih</span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Messages */}
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg text-sm">
              ✓ Konfigurasi disimpan!
            </div>
          )}

          {/* Step Indicator */}
          <div className="flex items-center justify-between py-4 px-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <span className="text-sm font-semibold text-cream">Step 2 of 5: Legal Service Config</span>
            <span className="text-xs text-cream/60">Set operating hours, fees, and service tiers</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <Link href="/profile" className="flex-1">
              <button
                type="button"
                className="w-full bg-ink-200/30 hover:bg-ink-200/50 text-cream font-semibold py-3 px-6 rounded-lg transition"
              >
                ← Back: Step 1
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-cream font-semibold py-3 px-6 rounded-lg transition"
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
            <Link href="/donna" className="flex-1">
              <button
                type="button"
                className="w-full bg-purple-600 hover:bg-purple-700 text-cream font-semibold py-3 px-6 rounded-lg transition"
              >
                Next: Step 3 - Donna AI →
              </button>
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}
