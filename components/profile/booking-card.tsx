'use client';

import { useState } from 'react';

interface BookingCardProps {
  lawyerName: string;
  animationDelay?: string;
}

type Step = 'idle' | 'chat' | 'form' | 'success';

const DONNA_PROMPTS = [
  'Apa jenis kes yang saya hadapi?',
  'Berapa kos konsultasi?',
  'Boleh saya tempah temujanji?',
  'Apakah dokumen yang diperlukan?',
];

export function BookingCard({ lawyerName, animationDelay }: BookingCardProps) {
  const [step, setStep] = useState<Step>('idle');
  const [form, setForm] = useState({ name: '', email: '', phone: '', issue: '' });
  const [loading, setLoading] = useState(false);

  const firstName = lawyerName.split(' ').slice(-2).join(' ');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    setStep('success');
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    color: '#eee8dc',
    width: '100%',
    fontSize: '0.875rem',
    padding: '0.625rem 0.875rem',
    borderRadius: '0.75rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  } as React.CSSProperties;

  return (
    <>
      {/* ── Trigger card ── */}
      <article
        className="overflow-hidden animate-slide-up"
        style={{
          animationDelay,
          background: 'linear-gradient(135deg, rgba(212,168,83,0.07) 0%, rgba(212,168,83,0.03) 100%)',
          border: '1px solid rgba(212,168,83,0.22)',
          borderRadius: '1rem',
        }}
      >
        <button
          onClick={() => setStep('chat')}
          className="w-full flex items-center gap-4 p-4 cursor-pointer text-left group"
        >
          {/* Donna avatar */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #b8893a, #d4a853, #e8c07a)',
                boxShadow: '0 0 20px rgba(212,168,83,0.3)',
              }}>
              <span className="text-white font-bold text-lg" style={{ fontFamily: 'Georgia, serif' }}>D</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2"
              style={{ borderColor: '#0d0e17' }} />
          </div>

          {/* Label */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base leading-tight" style={{ color: '#eee8dc' }}>
              Tanya Donna
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#d4a853' }}>
              Pembantu peribadi {firstName} · Dalam talian
            </p>
          </div>

          {/* Arrow */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all group-hover:translate-x-0.5"
            style={{ background: 'rgba(212,168,83,0.12)', border: '1px solid rgba(212,168,83,0.22)' }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="#d4a853" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>
      </article>

      {/* ── Modal ── */}
      {step !== 'idle' && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setStep('idle'); }}
        >
          <div className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: '#12131f',
              border: '1px solid rgba(212,168,83,0.18)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,168,83,0.08)',
            }}>

            {/* Modal header */}
            <div className="px-5 py-4 flex items-center gap-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(212,168,83,0.03)' }}>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #b8893a, #d4a853)',
                    boxShadow: '0 0 16px rgba(212,168,83,0.3)',
                    fontFamily: 'Georgia, serif',
                    fontSize: '1.1rem',
                  }}>
                  D
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2"
                  style={{ borderColor: '#12131f' }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#eee8dc' }}>Donna</p>
                <p className="text-xs" style={{ color: '#5e5a6e' }}>
                  Pembantu peribadi {lawyerName}
                </p>
              </div>
              <button
                onClick={() => setStep('idle')}
                className="ml-auto w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#5e5a6e' }}
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div className="px-5 py-5">

              {/* ── SUCCESS ── */}
              {step === 'success' && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                    style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-lg" style={{ color: '#eee8dc' }}>Terima kasih, {form.name.split(' ')[0]}!</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#9490a0' }}>
                      Saya telah hantar butiran anda kepada{' '}
                      <strong style={{ color: '#d4a853' }}>{lawyerName}</strong>.
                      Jangkakan email ke{' '}
                      <strong style={{ color: '#eee8dc' }}>{form.email}</strong>{' '}
                      dalam masa <strong style={{ color: '#eee8dc' }}>24 jam</strong>.
                    </p>
                    <p className="text-xs" style={{ color: '#3d3a4a' }}>
                      Sila semak folder spam jika tiada email dalam masa tersebut.
                    </p>
                  </div>

                  {/* Donna sign-off */}
                  <div className="rounded-xl px-4 py-3 text-sm text-left"
                    style={{ background: 'rgba(212,168,83,0.06)', border: '1px solid rgba(212,168,83,0.12)' }}>
                    <p style={{ color: '#9490a0' }}>
                      — <span style={{ color: '#d4a853' }}>Donna</span>, pembantu peribadi {firstName}
                    </p>
                  </div>

                  <button
                    onClick={() => { setStep('idle'); setForm({ name: '', email: '', phone: '', issue: '' }); }}
                    className="text-xs px-5 py-2 rounded-lg transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#5e5a6e' }}
                  >
                    Tutup
                  </button>
                </div>
              )}

              {/* ── CHAT / GREETING ── */}
              {step === 'chat' && (
                <div className="space-y-4">
                  {/* Donna greeting bubble */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 font-bold text-white text-sm"
                      style={{ background: 'linear-gradient(135deg, #b8893a, #d4a853)', fontFamily: 'Georgia, serif' }}>
                      D
                    </div>
                    <div className="flex-1 rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
                      style={{ background: 'rgba(212,168,83,0.07)', border: '1px solid rgba(212,168,83,0.14)', color: '#eee8dc' }}>
                      Selamat datang! 👋 Saya <strong style={{ color: '#d4a853' }}>Donna</strong>, pembantu peribadi <strong>{lawyerName}</strong>.<br /><br />
                      Saya boleh bantu anda dapatkan maklumat atau atur temujanji. Apa yang boleh saya bantu?
                    </div>
                  </div>

                  {/* Quick prompts */}
                  <div className="pl-11 space-y-2">
                    <p className="text-xs mb-2" style={{ color: '#3d3a4a' }}>Soalan lazim:</p>
                    {DONNA_PROMPTS.map((q) => (
                      <button
                        key={q}
                        onClick={() => setStep('form')}
                        className="flex items-center gap-2 w-full text-left text-sm px-3.5 py-2.5 rounded-xl transition-all group"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#9490a0' }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,83,0.3)';
                          (e.currentTarget as HTMLElement).style.color = '#d4a853';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                          (e.currentTarget as HTMLElement).style.color = '#9490a0';
                        }}
                      >
                        <span style={{ color: '#3d3a4a' }}>→</span>
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => setStep('form')}
                    className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all mt-1"
                    style={{ background: 'linear-gradient(135deg, #b8893a, #d4a853)', boxShadow: '0 0 20px rgba(212,168,83,0.2)' }}
                  >
                    Tempah Temujanji →
                  </button>
                </div>
              )}

              {/* ── FORM ── */}
              {step === 'form' && (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Donna prompt */}
                  <div className="flex gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 font-bold text-white text-sm"
                      style={{ background: 'linear-gradient(135deg, #b8893a, #d4a853)', fontFamily: 'Georgia, serif' }}>
                      D
                    </div>
                    <div className="flex-1 rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
                      style={{ background: 'rgba(212,168,83,0.07)', border: '1px solid rgba(212,168,83,0.14)', color: '#eee8dc' }}>
                      Sila isi butiran di bawah. Saya akan emailkan terus kepada <strong style={{ color: '#d4a853' }}>{lawyerName}</strong> dan beliau akan hubungi anda tidak lama lagi.
                    </div>
                  </div>

                  {[
                    { id: 'name',  label: 'Nama penuh',  placeholder: 'Ahmad bin Abdullah', type: 'text' },
                    { id: 'email', label: 'Email',        placeholder: 'ahmad@email.com',    type: 'email' },
                    { id: 'phone', label: 'No. telefon',  placeholder: '012-345 6789',       type: 'tel' },
                  ].map((f) => (
                    <div key={f.id}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: '#9490a0' }}>{f.label}</label>
                      <input
                        type={f.type}
                        required
                        placeholder={f.placeholder}
                        value={form[f.id as keyof typeof form]}
                        onChange={(e) => setForm((p) => ({ ...p, [f.id]: e.target.value }))}
                        style={inputStyle}
                        onFocus={(e) => { e.target.style.borderColor = 'rgba(212,168,83,0.45)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; }}
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#9490a0' }}>Perihal isu</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Ceritakan secara ringkas isu undang-undang anda…"
                      value={form.issue}
                      onChange={(e) => setForm((p) => ({ ...p, issue: e.target.value }))}
                      style={{ ...inputStyle, resize: 'none' }}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(212,168,83,0.45)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; }}
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setStep('chat')}
                      className="px-4 py-3 rounded-xl text-sm transition-colors"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#5e5a6e' }}
                    >
                      ← Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all"
                      style={{
                        background: loading ? 'rgba(184,137,58,0.4)' : 'linear-gradient(135deg, #b8893a, #d4a853)',
                        boxShadow: loading ? 'none' : '0 0 20px rgba(212,168,83,0.25)',
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                          </svg>
                          Menghantar kepada {firstName}…
                        </span>
                      ) : 'Hantar kepada ' + firstName}
                    </button>
                  </div>

                  <p className="text-center text-[11px]" style={{ color: '#3d3a4a' }}>
                    🔒 Maklumat anda dihantar terus kepada peguam. Sulit sepenuhnya.
                  </p>
                </form>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
