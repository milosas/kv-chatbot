'use client';

import { useEffect, useRef, useState } from 'react';
import { LeadForm } from './LeadForm';

type Msg = { role: 'user' | 'assistant'; content: string };

const STORAGE_KEY = 'kv_session_id';

function getSessionId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = 's-' + crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [intent, setIntent] = useState<string | null>(null);
  const [slots, setSlots] = useState<Record<string, unknown>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, showLeadForm]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content:
            'Sveiki! Aš Klimato Vektorių AI konsultantas. Galiu padėti pasirinkti kondicionierių arba šilumos siurblį. Apie kokį objektą kalbame — butas, namas ar verslo patalpos?',
        },
      ]);
    }
  }, [open, messages.length]);

  async function send() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setInput('');
    const newMsgs: Msg[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMsgs);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: trimmed }),
      });
      const data = await res.json();
      setMessages([...newMsgs, { role: 'assistant', content: data.message }]);
      if (data.intent) setIntent(data.intent);
      if (data.slots) setSlots(data.slots);
      if (data.show_lead_form && !leadSubmitted) setShowLeadForm(true);
    } catch {
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content:
            'Atsiprašau, įvyko techninė klaida. Galite skambinti tiesiogiai: +370 620 460 40.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-white shadow-xl transition hover:scale-105 hover:bg-brand-dark"
          aria-label="Atidaryti pokalbį"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[640px] w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:right-6 sm:bottom-6 max-sm:inset-0 max-sm:h-full max-sm:w-full max-sm:max-w-none max-sm:rounded-none">
          {/* Header */}
          <header className="flex items-center justify-between bg-brand-primary px-5 py-4 text-white">
            <div>
              <div className="text-sm font-semibold">Klimato Vektoriai · AI konsultantas</div>
              <div className="text-xs opacity-90">Atsako per kelias sekundes</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded p-1 transition hover:bg-white/15"
              aria-label="Uždaryti"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </header>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`mb-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'rounded-br-md bg-brand-primary text-white'
                      : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="mb-3 flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
                </div>
              </div>
            )}

            {showLeadForm && !leadSubmitted && (
              <LeadForm
                sessionId={sessionId}
                intent={intent || 'kondicionierius'}
                slots={slots}
                onSuccess={() => {
                  setLeadSubmitted(true);
                  setShowLeadForm(false);
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: 'assistant',
                      content:
                        'Ačiū! ✅ Jūsų info perduota vadybininkui. Susisieks per 1 darbo dieną. Geros dienos!',
                    },
                  ]);
                }}
              />
            )}
          </div>

          {/* Input */}
          {!showLeadForm && !leadSubmitted && (
            <div className="border-t border-slate-200 bg-white p-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Rašykite žinutę..."
                  className="flex-1 rounded-full border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-brand-primary"
                  disabled={loading}
                />
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-white transition hover:bg-brand-dark disabled:opacity-40"
                  aria-label="Siųsti"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
