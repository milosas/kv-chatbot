'use client';

import { useState } from 'react';

type Props = {
  sessionId: string;
  intent: string;
  slots: Record<string, unknown>;
  onSuccess: () => void;
};

export function LeadForm({ sessionId, intent, slots, onSuccess }: Props) {
  const [vardas, setVardas] = useState('');
  const [telefonas, setTelefonas] = useState('');
  const [email, setEmail] = useState('');
  const [miestas, setMiestas] = useState((slots.miestas as string) || '');
  const [laikas, setLaikas] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!vardas.trim() || !telefonas.trim()) {
      setError('Įveskite vardą ir telefoną.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          vardas: vardas.trim(),
          telefonas: telefonas.trim(),
          email: email.trim(),
          miestas: miestas.trim(),
          susisiekimo_laikas: laikas,
          product_type: intent,
          slots,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Nepavyko išsiųsti.');
      }
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Nepavyko išsiųsti.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mb-3 rounded-2xl border border-brand-primary/40 bg-white p-4 shadow-sm"
    >
      <div className="mb-3 text-sm font-semibold text-slate-800">
        📋 Palikite kontaktus — vadybininkas susisieks per 1 d.d.
      </div>

      <div className="space-y-2">
        <input
          required
          value={vardas}
          onChange={(e) => setVardas(e.target.value)}
          placeholder="Vardas *"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-primary"
        />
        <input
          required
          type="tel"
          value={telefonas}
          onChange={(e) => setTelefonas(e.target.value)}
          placeholder="Telefono nr. * (pvz., +370...)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-primary"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="El. paštas (neprivaloma)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-primary"
        />
        <input
          value={miestas}
          onChange={(e) => setMiestas(e.target.value)}
          placeholder="Miestas"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-primary"
        />
        <select
          value={laikas}
          onChange={(e) => setLaikas(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-primary"
        >
          <option value="">Pageidaujamas laikas — bet kada</option>
          <option value="Rytas (9-12)">Rytas (9-12)</option>
          <option value="Diena (12-16)">Diena (12-16)</option>
          <option value="Vakaras (16-19)">Vakaras (16-19)</option>
        </select>
      </div>

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-3 w-full rounded-lg bg-brand-primary py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {submitting ? 'Siunčiama...' : 'Siųsti'}
      </button>
      <div className="mt-2 text-[11px] leading-relaxed text-slate-500">
        Paspausdami „Siųsti" sutinkate, kad jūsų kontaktai būtų perduoti Klimato Vektorių vadybininkui.
      </div>
    </form>
  );
}
