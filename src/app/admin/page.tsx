import { listLeads } from '@/lib/db/queries';
import { LeadsTable } from '@/components/admin/LeadsTable';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const leads = await listLeads();

  const stats = {
    total: leads.length,
    sent: leads.filter((l) => l.emailStatus === 'sent').length,
    failed: leads.filter((l) => l.emailStatus === 'failed').length,
    pending: leads.filter((l) => l.emailStatus === 'pending').length,
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-white font-bold">
              KV
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Admin dashboard</div>
              <div className="text-xs text-slate-500">Lead'ai · Klimato Vektoriai</div>
            </div>
          </div>
          <form action="/api/admin/logout" method="POST">
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:border-slate-400 hover:text-slate-800">
              Atsijungti
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pt-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Lead'ų iš viso" value={stats.total} color="slate" />
          <StatCard label="Email išsiųsta" value={stats.sent} color="emerald" />
          <StatCard label="Email klaida" value={stats.failed} color="red" />
          <StatCard label="Laukia" value={stats.pending} color="amber" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <LeadsTable leads={leads} />
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'slate' | 'emerald' | 'red' | 'amber';
}) {
  const colors: Record<typeof color, string> = {
    slate: 'text-slate-700 bg-slate-100',
    emerald: 'text-emerald-700 bg-emerald-100',
    red: 'text-red-700 bg-red-100',
    amber: 'text-amber-700 bg-amber-100',
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 flex items-end gap-2">
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        <span className={`mb-1 rounded-full px-2 py-0.5 text-xs font-medium ${colors[color]}`}>
          {color === 'emerald' ? '✓' : color === 'red' ? '!' : ''}
        </span>
      </div>
    </div>
  );
}
