'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, ChevronDown } from 'lucide-react';

interface Message {
  role: 'user' | 'lia';
  text: string;
}

interface LiaWidgetProps {
  lawyerName: string;
  practiceAreas: string[];
  whatsappUrl?: string;
}

const QUICK_CHIPS = ['Yuran berapa?', 'Bagaimana nak saman?', 'Hak pekerja', 'Kes hartanah'];

export function LiaWidget({ lawyerName, practiceAreas, whatsappUrl }: LiaWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);
    setMessages((prev) => [...prev, { role: 'lia', text: '' }]);

    try {
      const res = await fetch('/api/lia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, lawyerName, practiceAreas }),
      });

      if (!res.ok || !res.body) {
        throw new Error('API error');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'lia',
            text: updated[updated.length - 1].text + chunk,
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'lia',
          text: 'Maaf, ada masalah teknikal. Sila cuba sebentar lagi.',
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  const lastLiaMsg = [...messages].reverse().find((m) => m.role === 'lia');
  const showCta = !loading && !!lastLiaMsg?.text && !!whatsappUrl;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-6 w-full flex items-center gap-3 px-4 py-3.5 card-base hover:border-gold/40 animate-fade-in"
        style={{ animationDelay: '180ms' }}
      >
        <div className="w-9 h-9 rounded-xl bg-ink-100 border border-gold/30 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-gold" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-display text-cream text-sm leading-tight">Tanya Lia — AI Undang-Undang</p>
          <p className="text-cream-muted text-xs mt-0.5">Jawapan segera, percuma</p>
        </div>
        <ChevronDown className="w-4 h-4 text-gold/40 shrink-0" />
      </button>
    );
  }

  return (
    <div className="mt-6 card-base overflow-hidden animate-slide-up" style={{ animationDelay: '180ms' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-ink-100 border border-gold/30 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
          </div>
          <div>
            <span className="font-display text-cream text-sm">Lia</span>
            <span className="text-cream-muted text-xs ml-2">AI Undang-Undang</span>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-cream-muted hover:text-cream transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message area */}
      <div className="p-4 space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
        {messages.length === 0 && (
          <p className="text-cream-muted text-xs text-center py-4">
            Tanya apa-apa soalan berkaitan undang-undang...
          </p>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div>
              <div className={msg.role === 'user' ? 'bubble-user' : 'bubble-lia'}>
                {msg.text || <TypingDots />}
              </div>

              {/* WhatsApp CTA after last Lia reply */}
              {msg.role === 'lia' &&
                msg.text &&
                i === messages.length - 1 &&
                showCta && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-[9px]">
                      ✓
                    </span>
                    Berhubung terus dengan {lawyerName} →
                  </a>
                )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick chips — only before first message */}
      {messages.length === 0 && (
        <div className="px-4 pb-3 flex gap-2 flex-wrap">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => send(chip)}
              className="px-3 py-1 rounded-full border border-ink-50 bg-ink-300 text-cream-muted text-xs hover:border-gold/40 hover:text-cream transition-all"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Taip soalan undang-undang..."
          disabled={loading}
          className="flex-1 bg-ink-300 border border-ink-50 rounded-xl px-3 py-2 text-sm text-cream placeholder:text-cream-muted/40 focus:outline-none focus:border-gold/40 disabled:opacity-50 transition-colors"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-bounce-dot"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </span>
  );
}
