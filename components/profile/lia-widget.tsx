'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface LiaWidgetProps {
  lawyerName: string;
  practiceAreas: string[];
  waLink?: string | null;
}

// ─── Quick suggestion chips ───────────────────────────
const QUICK_CHIPS = [
  { emoji: '⚖️', label: 'Kontrak dilanggar' },
  { emoji: '💼', label: 'Dipecat tanpa notis' },
  { emoji: '💰', label: 'Hutang perniagaan' },
  { emoji: '🏠', label: 'Isu sewaan' },
  { emoji: '🚨', label: 'Perlukan peguam segera' },
];

export function LiaWidget({ lawyerName, practiceAreas, waLink }: LiaWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  // ── Send message ─────────────────────────────────────
  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;

    const userMsg: Message = { role: 'user', content: q };
    const updatedHistory = [...messages, userMsg];

    setMessages([...updatedHistory, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);

    try {
      const res = await fetch('/api/lia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory,
          lawyerName,
          practiceAreas,
        }),
      });

      if (!res.ok || !res.body) throw new Error('API error');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: full };
          return copy;
        });
        scrollToBottom();
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: 'assistant',
          content:
            'Maaf, ralat berlaku. Cuba semula atau hubungi terus via WhatsApp.',
        };
        return copy;
      });
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const isLastAssistant =
    messages.length > 0 && messages[messages.length - 1].role === 'assistant';

  return (
    <div
      className="relative bg-ink-200 border border-ink-50 rounded-2xl p-4 mb-4 overflow-hidden animate-slide-up"
      style={{ animationDelay: '180ms' }}
    >
      {/* Subtle glow top-right */}
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gold/5 blur-3xl pointer-events-none" />

      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(201,169,97,0.25)]">
          <Sparkles className="w-4 h-4 text-ink-400" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-cream leading-tight">
            Lia — Kaunter Digital
          </p>
          <p className="text-[11px] text-cream-muted mt-0.5">
            Soal selidik segera · Dikuasakan Claude AI
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-success bg-success/8 border border-success/20 rounded-full px-2.5 py-1 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0" />
          Aktif
        </div>
      </div>

      {/* ── Chat window ───────────────────────────────── */}
      <div
        ref={chatRef}
        className="bg-ink-400 border border-ink-50 rounded-xl p-3 min-h-[100px] max-h-[280px] overflow-y-auto mb-3 scrollbar-thin scroll-smooth"
      >
        {/* Greeting bubble */}
        <div className="flex gap-2 mb-3">
          <AvatarLia />
          <div className="bubble-lia">
            Salam! Saya Lia, pembantu digital {lawyerName}. Tanya sebarang
            soalan undang-undang — saya akan bantu sebaik mungkin. 👋
          </div>
        </div>

        {/* Conversation */}
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          const isStreaming = busy && i === messages.length - 1 && !isUser && msg.content === '';

          return (
            <div
              key={i}
              className={cn('flex gap-2 mb-3', isUser && 'flex-row-reverse')}
            >
              {isUser ? <AvatarUser /> : <AvatarLia />}
              <div
                className={cn(
                  'rounded-xl px-3 py-2 text-xs leading-relaxed max-w-[85%] whitespace-pre-line',
                  isUser
                    ? 'bg-gold/12 border border-gold/22 text-cream rounded-tr-sm'
                    : 'bubble-lia'
                )}
              >
                {isStreaming ? (
                  // Loading dots while waiting for first chunk
                  <span className="inline-flex gap-1 items-center py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/50 animate-bounce-dot" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/50 animate-bounce-dot" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/50 animate-bounce-dot" style={{ animationDelay: '300ms' }} />
                  </span>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          );
        })}

        {/* WhatsApp escalation CTA — shown after each assistant reply */}
        {isLastAssistant && !busy && waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 bg-success/6 border border-success/18 hover:bg-success/10 rounded-xl px-3 py-2.5 mt-1 mb-1 transition-colors"
          >
            <span className="text-lg shrink-0">💬</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-success leading-tight">
                Bercakap dengan {lawyerName}
              </p>
              <p className="text-[10px] text-cream-muted mt-0.5">
                Sambung via WhatsApp · Respons dalam 1 jam
              </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-cream-muted shrink-0" />
          </a>
        )}
      </div>

      {/* ── Quick chips (hide after first message) ──────── */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => send(chip.label)}
              disabled={busy}
              className="text-[11px] text-cream-muted bg-ink-300 border border-ink-50 hover:border-gold/35 hover:text-cream rounded-full px-3 py-1.5 transition-all disabled:opacity-40 active:scale-95"
            >
              {chip.emoji} {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Input row ─────────────────────────────────── */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Taip soalan undang-undang anda…"
          disabled={busy}
          className="flex-1 bg-ink-300 border border-ink-50 focus:border-gold/40 rounded-full text-xs text-cream placeholder:text-cream-muted/40 px-4 py-2.5 outline-none transition-colors disabled:opacity-50"
        />
        <button
          onClick={() => send(input)}
          disabled={busy || !input.trim()}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-200 to-gold-500 flex items-center justify-center shrink-0 shadow-[0_4px_14px_rgba(201,169,97,0.28)] hover:shadow-[0_4px_20px_rgba(201,169,97,0.45)] transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-92"
        >
          <Send className="w-4 h-4 text-ink-400" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// ─── Avatar sub-components ────────────────────────────
function AvatarLia() {
  return (
    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 flex items-center justify-center shrink-0 mt-0.5">
      <Sparkles className="w-3 h-3 text-ink-400" strokeWidth={2} />
    </div>
  );
}

function AvatarUser() {
  return (
    <div className="w-6 h-6 rounded-full bg-ink-200 border border-ink-50 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-medium text-cream-muted">
      A
    </div>
  );
}
