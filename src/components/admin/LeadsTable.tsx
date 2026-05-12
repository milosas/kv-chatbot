'use client';

import { useState } from 'react';
import type { Lead } from '@/lib/db/schema';
import { LeadDetailModal } from './LeadDetailModal';

type Props = { leads: Lead[] };

export function LeadsTable({ leads }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
        <div className="text-3xl">📭</div>
        <div className="mt-3 text-base font-semibold text-slate-800">Lead'ų dar nėra</div>
        <div className="mt-1 text-sm text-slate-500">
          Atsidaryk pagrindinį puslapį, pradėk pokalbį ir pateik kontaktinę formą.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Laikas</th>
                <th className="px-4 py-3 text-left font-medium">Vardas</th>
                <th className="px-4 py-3 text-left font-medium">Telefonas</th>
                <th className="px-4 py-3 text-left font-medium">Miestas</th>
                <th className="px-4 py-3 text-left font-medium">Produktas</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((l) => (
                <tr
                  key={l.id}
                  className="cursor-pointer transition hover:bg-slate-50"
                  onClick={() => setSelectedId(l.id)}
                >
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(l.createdAt).toLocaleString('lt-LT', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{l.vardas}</td>
                  <td className="px-4 py-3 text-slate-700">{l.telefonas}</td>
                  <td className="px-4 py-3 text-slate-700">{l.miestas || '—'}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {l.productType === 'silumos_siurblys' ? '🌡️ Šil. siurblys' : '❄️ Kondicionierius'}
                  </td>
                  <td className="px-4 py-3">
                    <EmailBadge status={l.emailStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={l.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedId && (
        <LeadDetailModal
          lead={leads.find((l) => l.id === selectedId)!}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}

function EmailBadge({ status }: { status: string }) {
  if (status === 'sent') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Išsiųsta
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Klaida
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Laukia
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    new: { label: 'Naujas', cls: 'bg-sky-100 text-sky-700' },
    contacted: { label: 'Susisiekta', cls: 'bg-indigo-100 text-indigo-700' },
    won: { label: 'Pardavimas', cls: 'bg-emerald-100 text-emerald-700' },
    lost: { label: 'Atmestas', cls: 'bg-slate-200 text-slate-600' },
  };
  const s = map[status] || map.new;
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>{s.label}</span>;
}
