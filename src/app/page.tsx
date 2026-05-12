import { ChatWidget } from '@/components/ChatWidget';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-light via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-white font-bold">
              KV
            </div>
            <div>
              <div className="text-sm font-bold leading-tight text-slate-900">Klimato Vektoriai</div>
              <div className="text-xs text-slate-500">Samsung HVAC sprendimai</div>
            </div>
          </div>
          <div className="hidden gap-6 text-sm text-slate-600 md:flex">
            <a className="hover:text-brand-primary" href="tel:+37062046040">Vilnius +370 620 460 40</a>
            <a className="hover:text-brand-primary" href="tel:+37060255955">Kaunas +370 602 55955</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-white px-4 py-1.5 text-xs font-medium text-brand-dark shadow-sm">
          ✨ AI konsultantas — atsako 24/7
        </div>
        <h1 className="mx-auto max-w-3xl text-balance text-5xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl">
          Pasirinkite tinkamą kondicionierių per <span className="text-brand-primary">2 minutes</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Atsakykite į kelis klausimus apie patalpą — AI konsultantas rekomenduos 2-3 tinkamus Samsung modelius ir užregistruos vadybininką susisiekti.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('kv-open-chat'));
                const btn = document.querySelector<HTMLButtonElement>('[aria-label="Atidaryti pokalbį"]');
                btn?.click();
              }
            }}
            className="rounded-full bg-brand-primary px-7 py-3 text-base font-semibold text-white shadow-lg shadow-brand-primary/30 transition hover:bg-brand-dark"
          >
            💬 Pradėti pokalbį
          </button>
          <a
            href="tel:+37062046040"
            className="rounded-full border border-slate-300 bg-white px-7 py-3 text-base font-semibold text-slate-700 transition hover:border-brand-primary hover:text-brand-primary"
          >
            📞 Skambinti
          </a>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard
            icon="❄️"
            title="Kondicionieriai"
            text="Samsung WindFree, Cebu, Quantum — vėsinimui ir šildymui iki -25°C."
          />
          <FeatureCard
            icon="🌡️"
            title="Šilumos siurbliai"
            text="Samsung EHS oras-vanduo nuo 5 iki 16 kW. APVA subsidija — iki 60%."
          />
          <FeatureCard
            icon="🛠️"
            title="Montavimas + servisas"
            text="Profesionalus montavimas, garantija, pogarantinis aptarnavimas."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        <p>© Klimato Vektoriai · klimatovektoriai.lt · MVP demo (AI chatbot)</p>
      </footer>

      <ChatWidget />
    </main>
  );
}

function FeatureCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-3 text-3xl">{icon}</div>
      <div className="mb-2 text-lg font-semibold text-slate-900">{title}</div>
      <p className="text-sm text-slate-600">{text}</p>
    </div>
  );
}
