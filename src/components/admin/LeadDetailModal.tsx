'use client';

import { useEffect, useState } from 'react';
import type { Lead } from '@/lib/db/schema';

type Props = {
  lead: Lead;
  onClose: () => void;
};

type Message = {
  id: number;
  role: string;
  content: string;
  createdAt: string;
};

export function LeadDetailModal({ lead, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (!lead.conversationId) {
      setLoading(false);
      return;
    }
    fetch(`/api/admin/conversation?id=${lead.conversationId}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lead.conversationId]);

  const slots = (lead.slots as Record<string, unknown>) || {};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <div className="text-lg font-bold text-slate-900">{lead.vardas}</div>
            <div className="text-sm text-slate-500">
              {lead.telefonas} · {lead.miestas || '—'} ·{' '}
              {new Date(lead.createdAt).toLocaleString('lt-LT')}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Uždaryti"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="grid flex-1 overflow-hidden md:grid-cols-[320px_1fr]">
          {/* Sidebar info */}
          <aside className="overflow-y-auto border-r border-slate-200 bg-slate-50 p-5 text-sm">
            <Section title="Email pristatymas">
              <KV label="Status" value={lead.emailStatus} />
              <KV label="Išsiųsta" value={lead.emailSentAt ? new Date(lead.emailSentAt).toLocaleString('lt-LT') : '—'} />
              {lead.emailError && (
                <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                  ⚠️ {lead.emailError}
                </div>
              )}
            </Section>

            <Section title="Kontaktai">
              <KV label="Vardas" value={lead.vardas} />
              <KV label="Telefonas" value={lead.telefonas} />
              <KV label="Email" value={lead.email || '—'} />
              <KV label="Miestas" value={lead.miestas || '—'} />
              <KV label="Skambinti" value={lead.susisiekimoLaikas || '—'} />
            </Section>

            <Section title="Produkto info">
              <KV label="Tipas" value={lead.productType} />
              {Object.entries(slots)
                .filter(([, v]) => v !== null && v !== undefined && v !== '')
                .map(([k, v]) => (
                  <KV key={k} label={k} value={String(v)} />
                ))}
            </Section>

            <Section title="Boto santrauka">
              <div className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
                {lead.aiSummary || '—'}
              </div>
            </Section>
          </aside>

          {/* Conversation */}
          <div className="flex flex-col overflow-hidden bg-white">
            <div className="border-b border-slate-200 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Pokalbio istorija
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loading && <div className="text-sm text-slate-400">Įkraunama...</div>}
              {!loading && messages.length === 0 && (
                <div className="text-sm text-slate-400">Žinučių nėra.</div>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`mb-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      m.role === 'user'
                        ? 'rounded-br-md bg-brand-primary text-white'
                        : 'rounded-bl-md border border-slate-200 bg-slate-50 text-slate-800'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}
