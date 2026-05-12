'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Klaida.');
      }
      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Nepavyko prisijungti.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white font-bold">
            KV
          </div>
          <h1 className="text-xl font-bold text-slate-900">Admin prisijungimas</h1>
          <p className="mt-1 text-sm text-slate-500">Klimato Vektoriai · lead'ų dashboard</p>
        </div>

        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Slaptažodis"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-brand-primary"
        />

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-4 w-full rounded-lg bg-brand-primary py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
        >
          {loading ? 'Tikrinama...' : 'Prisijungti'}
        </button>
      </form>
    </main>
  );
}
