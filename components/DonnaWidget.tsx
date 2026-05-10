'use client';

import { useEffect, useRef, useState } from 'react';

interface Message {
  role: 'donna' | 'user';
  text: string;
}

interface DonnaWidgetProps {
  slug: string;
}

export default function DonnaWidget({ slug }: DonnaWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState('start');
  const [input, setInput] = useState('');
  const [collected, setCollected] = useState<Record<string, any>>({ _transcript: [] });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendToApi(currentStep: string, userInput?: string, currentCollected?: Record<string, any>) {
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
        }),
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json();

      setMessages((prev) => [...prev, { role: 'donna', text: data.message }]);
      setStep(data.nextStep);
      setCollected(data.collected);
      setDone(data.done ?? false);

      return data;
    } catch (err) {
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
    if (!started) {
      setStarted(true);
      sendToApi('start');
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading || done) return;

    // Append user message
    const userMsg: Message = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Update transcript in collected
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

  return (
    <>
      {/* Floating trigger button */}
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

      {/* Chat overlay */}
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
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
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

              {/* Typing indicator */}
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
