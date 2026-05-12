# Klimato Vektoriai — AI Chatbot MVP

AI chatbot demonstracinė versija, skirta Klimato Vektoriams (Samsung HVAC dealeris). Stack: **Next.js 15 + OpenAI + Vercel Postgres + Resend**.

Šitas yra **MVP versija** — supaprastinta pagal `CLAUDE.md` aprašytą pilną stack'ą:
- ❌ Be RAG/pgvector (produktai eina tiesiai į system prompt'ą)
- ❌ Be email open tracking (tik `sent` / `failed` status)
- ❌ Be custom domeno
- ✅ Pilnai veikiantis pokalbis + lead capture + email + admin dashboard

---

## Funkcionalumas

- **Chat widget** (apatinis dešinysis kampas demo puslapyje) — AI konsultantas lietuviškai
- **Slot extraction** — botas atpažįsta intent (kondicionierius / šilumos siurblys) ir surenka plotą, miestą, biudžetą ir t.t.
- **Produktų rekomendacijos** iš `data/products.json` (20 mock'intų Samsung modelių)
- **Lead capture forma** inline pokalbyje — vardas, telefonas, miestas, laikas
- **Email vadybininkui** per Resend su pilna pokalbio santrauka (sugeneruota OpenAI)
- **Admin dashboard** (`/admin`) su slaptažodžio cookie auth — lead'ų sąrašas, email status, lead detail modal su visu pokalbiu

---

## Setup

### 1. Įdiegti priklausomybes

```powershell
npm install
```

### 2. Sukurti Vercel projektą + Postgres DB

1. Sukurti GitHub repo, push'inti šitą kodą
2. vercel.com → New Project → Import iš GitHub
3. Po import'o: Storage tab → Create Database → **Postgres (Neon)** → Region: Frankfurt
4. Connect prie projekto — Vercel automatiškai prides `POSTGRES_URL` ir kt. env vars

### 3. Lokaliai parsisiųsti env vars

```powershell
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
```

### 4. Pridėti likusius env vars

`.env.local` faile ir Vercel dashboard'e prideti:

```
DATABASE_URL=<tas pats kaip POSTGRES_URL>
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
EMAIL_FROM=onboarding@resend.dev          # MVP — galima naudoti Resend test domain
EMAIL_MANAGER=brykas@gmail.com
ADMIN_PASSWORD=stiprus-slaptazodis-2026
ADMIN_COOKIE_SECRET=random-32+-char-string
```

> **Resend test domain:** `onboarding@resend.dev` veikia BE domain verification, bet siunčia TIK į tą email'ą, kurį naudoji Resend paskyrai. Produkcijai reikės verify'inti `klimatovektoriai.lt`.

### 5. Sukurti DB lenteles

```powershell
npm run db:generate
npm run db:migrate
```

### 6. Paleisti lokaliai

```powershell
npm run dev
```

→ http://localhost:3000

---

## Testavimas (manual QA)

1. Atsidaryk `http://localhost:3000`
2. Apačioje dešinėje — chat button. Click → atsidaro widget'as
3. Parašyk: *"Reikia kondicionieriaus 25m² miegamajam, Vilnius"*
4. Sek pokalbį — botas turi:
   - Paklausti dar 1-2 detalių (funkcija, biudžetas)
   - Pasiūlyti 2-3 Samsung modelius iš `data/products.json`
   - Paklausti, ar nori, kad vadybininkas susisiektų
5. Sutik → atsiranda lead capture forma. Užpildyk: vardas, telefonas
6. Submit → ekrane pasirodys ačiū žinutė
7. Patikrink Gmail (tą, kurį naudoji Resend paskyrai) — turėtų ateiti email su lead info
8. Eik į `http://localhost:3000/admin/login`
9. Įvesk `ADMIN_PASSWORD` → patenki į `/admin`
10. Sąraše matosi lead'as su `Išsiųsta` status'u. Click ant row → modal su pilnu pokalbiu

### Email klaidos scenarijus

1. Sustabdyk dev serverį
2. Pakeisk `RESEND_API_KEY=re_invalid_key` `.env.local`
3. `npm run dev`
4. Pakartok lead submission
5. Admin dashboard'e turi rodyti `Klaida` status'ą su klaidos žinute modal'e

---

## Deploy į Vercel

```powershell
git push origin main
```

Vercel auto-deploy'ina iš `main` branch'o. Pirmojo deploy'o metu paleisk migracijas iš lokalios mašinos su production DB URL:

```powershell
# Patikrink ar .env.local turi PRODUCTION POSTGRES_URL
npm run db:migrate
```

(Arba per Vercel Build & Development settings pridėk `npm run db:migrate &&` prie build command'o — paprasčiau pirmą kartą tiesiog rankiniu būdu.)

---

## Failų struktūra

```
src/
├── app/
│   ├── page.tsx                    # Demo puslapis su chat widget'u
│   ├── admin/
│   │   ├── page.tsx                # Lead'ų lentelė + stats
│   │   └── login/page.tsx          # Slaptažodžio forma
│   └── api/
│       ├── chat/route.ts           # POST — pokalbio žinutė
│       ├── lead/route.ts           # POST — lead + email
│       └── admin/
│           ├── login/route.ts
│           ├── logout/route.ts
│           └── conversation/route.ts
├── components/
│   ├── ChatWidget.tsx              # Floating chat widget'as
│   ├── LeadForm.tsx                # Inline lead capture
│   └── admin/
│       ├── LeadsTable.tsx
│       └── LeadDetailModal.tsx
├── lib/
│   ├── openai/                     # Client, system-prompt, chat, summary
│   ├── email/                      # Resend client, manager template, send
│   ├── db/                         # Drizzle schema + queries
│   ├── auth/admin.ts               # Cookie signing + verify
│   └── products.ts                 # Products JSON loader
└── middleware.ts                   # /admin/* cookie protection

data/
└── products.json                   # 20 Samsung HVAC produktų

drizzle/
└── migrations/                     # Auto-generuotos SQL migracijos
```

---

## Žinomi MVP apribojimai (palikti V2)

- Be RAG / vector search'o — esant >50 produktų gali nebetilpti į prompt'ą
- Be streaming responses (request/response only)
- Be open/click tracking — Resend palaiko per webhooks
- Be vanilla JS embed script — tik React widget'as demo puslapyje
- Be rate limiting (Vercel KV)
- Be Sentry/observability
- Auth: vienas slaptažodis (be multi-user, be NextAuth)

Pilna spec — žiūrėk projekto `CLAUDE.md` arba šio template'o tėvinio aplanko `CLAUDE.md`.

---

## Komandos

| Komanda | Aprašymas |
|---|---|
| `npm run dev` | Dev serveris localhost:3000 |
| `npm run build` | Produkcinis build |
| `npm run start` | Paleisti build'ą |
| `npm run db:generate` | Generuoti Drizzle migration iš schema.ts |
| `npm run db:migrate` | Pritaikyti migration prie DB |
| `npm run db:push` | (Dev only) Push schema be migration failo |

---

## Estimuoti kaštai

- Vercel: €0 (Hobby)
- Vercel Postgres: €0 (Hobby, 0.5GB)
- OpenAI: ~€0.006 / pokalbis (~€2/mėn @ 300 pokalbių)
- Resend: €0 (free 3k email/mėn)

**Iš viso: ~€2-5/mėn šitam MVP'iui.**
