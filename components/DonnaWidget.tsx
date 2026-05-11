'use client';

import { useEffect, useRef, useState } from 'react';

interface Message {
  role: 'donna' | 'user';
  text: string;
}

interface DonnaWidgetProps {
  slug: string;
  /** When set, the inquiry created at intake-complete is linked to this bridge. */
  bridgeId?: string;
  /** When true, the widget auto-opens on mount. */
  autoOpen?: boolean;
  /** When set (bridge page), the client's original FB question skips area/issue steps. */
  bridgeQuestion?: string;
  /** Custom initial greeting message (bridge/digital card). */
  initialGreeting?: string;
  /** Pre-populated messages — skips the 'start' API call entirely. */
  initialMessages?: Array<{ role: 'donna' | 'user'; text: string }>;
  /** When true, renders inline (no floating button, no overlay). */
  embedded?: boolean;
}

export default function DonnaWidget({
  slug,
  bridgeId,
  autoOpen = false,
  bridgeQuestion,
  initialGreeting,
  initialMessages,
  embedded = false,
}: DonnaWidgetProps) {
  const hasPreload = !!initialMessages?.length;
  const [open, setOpen] = useState(autoOpen || embedded);
  // If messages are pre-populated, skip 'start' → go straight to 'name'
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
  const [step, setStep] = useState(hasPreload ? 'name' : 'start');
  const [input, setInput] = useState('');
  const [collected, setCollected] = useState<Record<string, any>>({
    _transcript: [],
    ...(bridgeQuestion ? { issueSummary: bridgeQuestion, _hasBridgeContext: true } : {}),
    ...(initialGreeting ? { _initialGreeting: initialGreeting } : {}),
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const startedRef = useRef(hasPreload); // true if messages pre-loaded — blocks API auto-start
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Scroll to top on initial load if messages are pre-loaded (show greeting first)
  useEffect(() => {
    if (hasPreload && messages.length > 0) {
      // Find the scrollable messages container and scroll to top
      setTimeout(() => {
        const scrollContainer = endRef.current?.parentElement;
        if (scrollContainer) {
          scrollContainer.scrollTop = 0;
        }
      }, 50); // Small delay to ensure DOM is ready
    }
  }, []); // Run once on mount

  // Auto-start only for floating mode without pre-loaded messages
  useEffect(() => {
    if (hasPreload) return; // greeting already shown — no API call needed
    if (!(autoOpen || embedded)) return;
    if (startedRef.current) return;
    startedRef.current = true;
    sendToApi('start');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty deps — fires once on mount

  async function sendToApi(
    currentStep: string,
    userInput?: string,
    currentCollected?: Record<string, any>
  ) {
    setLoading(true);
    try {
      const res = await fetch('/api/donna-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          step: currentStep,
          userInput,
          collected: currentCollected ?? collected,
          bridgeId,
          bridgeQuestion,
          initialGreeting,
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      setMessages((prev) => [...prev, { role: 'donna', text: data.message }]);
      setStep(data.nextStep);
      setCollected(data.collected);
      setDone(data.done ?? false);
      return data;
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'donna', text: 'Maaf, terdapat masalah teknikal. Sila cuba lagi sebentar.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleOpen() {
    setOpen(true);
    if (!startedRef.current) {
      startedRef.current = true;
      setStarted(true);
      sendToApi('start');
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading || done) return;

    const userMsg: Message = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    const updatedTranscript = [...(collected._transcript ?? []), { role: 'user', text }];
    const updatedCollected = { ...collected, _transcript: updatedTranscript };
    setCollected(updatedCollected);

    await sendToApi(step, text, updatedCollected);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── EMBEDDED MODE — renders inline, no floating button ──────────────
  if (embedded) {
    // ── Done state: replace entire widget with Selesai panel ──
    if (done) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-10 gap-5" style={{ minHeight: '360px' }}>
          <div className="w-16 h-16 rounded-full bg-green-900/40 border border-green-500/40 flex items-center justify-center text-3xl">
            ✓
          </div>
          <div>
            <p className="text-lg font-bold text-cream mb-1">Selesai</p>
            <p className="text-sm text-cream/60 leading-relaxed max-w-xs">
              Maklumat anda telah diterima. Peguam akan beri maklum balas dalam <span className="text-cream/90 font-semibold">5 hari bekerja</span>.
            </p>
          </div>
          <div className="border-t border-white/10 pt-4 w-full text-center">
            <p className="text-[10px] text-cream/30 uppercase tracking-widest">TanyaPeguam · Donna</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col" style={{ minHeight: '360px', maxHeight: '480px' }}>
        {/* Donna identity strip — at top */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            D
          </div>
          <div>
            <p className="text-sm font-semibold text-cream">Donna</p>
            <p className="text-[10px] text-cream/45">Pembantu Digital · TanyaPeguam</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400">Dalam talian</span>
          </div>
        </div>

        {/* Notification banner — shown during contact collection steps */}
        {['name', 'phone', 'email_opt'].includes(step) && (
          <div className="mb-4 p-3 bg-purple-950/50 border border-purple-500/30 rounded-lg">
            <p className="text-sm text-cream/80 leading-relaxed">
              Untuk membantu peguam menilai kes anda dengan lebih lanjut, sila lengkapkan maklumat ringkas melalui Donna.
            </p>
            <p className="text-xs text-cream/50 mt-2">
              Dengan membalas, anda bersetuju maklumat anda dirahsiakan dan hanya dilihat oleh peguam yang dijemput.
            </p>
          </div>
        )}

        {/* Message thread */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[88%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'donna'
                    ? 'bg-white/8 text-cream/90 rounded-tl-sm'
                    : 'bg-purple-600 text-white font-medium rounded-tr-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/8 px-4 py-3 rounded-xl rounded-tl-sm flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cream/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-cream/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-cream/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 border-t border-white/10 pt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Taip mesej anda..."
            className="flex-1 bg-white/5 border border-white/10 focus:border-purple-500/60 rounded-lg px-3 py-2 text-sm text-cream placeholder-cream/30 outline-none transition"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            →
          </button>
        </div>
      </div>
    );
  }

  // ── FLOATING MODE — trigger button + overlay ─────────────────────────
  return (
    <>
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full shadow-lg
          bg-gradient-to-r from-gold-600 to-gold-500 text-ink-500 font-bold text-sm
          hover:from-gold-500 hover:to-gold-400 transition-all"
        aria-label="Bincang dengan Donna"
      >
        <span className="text-base">⚖️</span>
        Bincang dengan Donna
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6 pointer-events-none">
          <div
            className="pointer-events-auto w-full max-w-sm flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-gold/20"
            style={{ maxHeight: 'min(560px, calc(100vh - 100px))' }}
          >
            {/* Header */}
            <div className="bg-ink-300 px-4 py-3 flex items-center justify-between border-b border-gold/20 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-600 to-gold-500 flex items-center justify-center text-ink-500 font-bold text-xs">
                  D
                </div>
                <div>
                  <p className="text-sm font-semibold text-cream">Donna</p>
                  <p className="text-[10px] text-cream/50">Pembantu Digital</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-cream/40 hover:text-cream transition text-lg leading-none"
                aria-label="Tutup"
              >
                ×
              </button>
            </div>

            {/* Message thread */}
            <div className="flex-1 overflow-y-auto bg-ink-500 p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'donna'
                        ? 'bg-ink-300 text-cream/90 rounded-tl-sm'
                        : 'bg-gold-500 text-ink-500 font-medium rounded-tr-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-ink-300 px-4 py-3 rounded-xl rounded-tl-sm flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input area */}
            <div className="bg-ink-400 border-t border-gold/10 p-3 flex-shrink-0">
              {done ? (
                <div className="text-center text-xs text-cream/40 py-2">
                  ✓ Pertanyaan selesai. Terima kasih!
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    placeholder="Taip mesej anda..."
                    className="flex-1 bg-ink-300 border border-gold/10 focus:border-gold/40 rounded-lg px-3 py-2 text-sm text-cream placeholder-cream/30 outline-none transition"
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="px-4 py-2 rounded-lg bg-gold-500 text-ink-500 font-bold text-sm
                      hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
