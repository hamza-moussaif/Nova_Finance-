# Nova Finance

A personal finance web app: track income and expenses, budget against the
50/30/20 rule, plan recurring bills, set savings goals, watch a stock
watchlist, and plan trips end to end — all backed by Supabase (Postgres +
Auth) with row-level security.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 13 (Pages Router), React 18 |
| Backend | Supabase (Postgres, Auth, Row Level Security) |
| Styling | Tailwind CSS (custom light/dark tokens) |
| Charts | Recharts |
| Icons | lucide-react |
| Market data | Finnhub (free tier, server-side proxy) |
| Hosting | Netlify (`@netlify/plugin-nextjs`) |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the pieces fit
together, the data model, and the conventions the codebase follows.

## Features

- **Auth** — email/password via Supabase Auth, session synced through `AuthContext`.
- **Dashboard** — total balance, monthly income/expenses, a 12-month income
  vs. expense trend chart, a category donut chart, and budget-vs-actual bars.
- **Transactions** — add, list, filter (search / type / category / date range),
  delete.
- **Recurring transactions** — templates (rent, subscriptions, salary) that
  the client expands into real transaction rows whenever an occurrence is due
  (see [Recurring engine](docs/ARCHITECTURE.md#recurring-transactions-engine)).
- **Budgets** — percentage-of-income allocation per category, defaulting to
  the 50/30/20 rule, with a "reset to recommended" action.
- **Salary & Income** — monthly income/expense/savings KPIs, an SVG savings-rate
  gauge, and a needs/wants breakdown against the 50/30/20 targets.
- **Savings goals** — target amount + optional deadline, manual contributions,
  progress bar.
- **Stocks** — a personal watchlist with live quotes proxied through a Next.js
  API route so the Finnhub key never reaches the browser.
- **Trips** — plan a trip end to end: budget, trip-specific expenses,
  day-by-day itinerary, and a packing checklist.
- **Notifications** — a bell in the sidebar surfaces budget overruns, upcoming
  savings-goal deadlines, recurring bills due soon, and upcoming trips,
  computed client-side from existing data (see
  [Architecture § Notifications](docs/ARCHITECTURE.md#10-notifications)).
- **Profile & settings** — display name, currency (20 world currencies),
  password change, and a one-click CSV export of the full transaction ledger.
- **Multi-currency** — every amount is formatted through a single
  `formatCurrency()` helper driven by the user's chosen currency.
- **i18n** — English/French, toggled from the sidebar, no page reload.
- **Dark mode** — class-based, persisted, respects the OS preference on first
  load.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql) in full.
   It is idempotent — every statement guards itself (`if not exists`, or a
   `drop policy if exists` before `create policy`), so re-running it after a
   schema change never errors.
3. Copy your project's **URL** and **anon public key** (Project Settings → API).

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | From Supabase project settings. Public by design. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Public/anon key. Safe to ship to the client — RLS is what actually protects data. |
| `FINNHUB_API_KEY` | no | Free key from [finnhub.io/register](https://finnhub.io/register). Powers the Stocks page. **No** `NEXT_PUBLIC_` prefix — it stays server-side and is proxied through `pages/api/quote.js`. Without it, the Stocks page shows a friendly "not configured" notice instead of failing. |

### 4. Run locally

```bash
npm run dev
```

### 5. Deploy

The app targets Netlify via `@netlify/plugin-nextjs`. Set the three
environment variables above in the Netlify site's environment settings (not
in a committed file) before the first deploy. Never commit real Supabase or
Finnhub values into `.env.local.example` — Netlify's secret scanner will fail
the build if it finds a committed file matching a configured env var.

## Project structure

```
pages/            Route components (Next.js Pages Router)
  api/quote.js    Server-side Finnhub proxy — the only place FINNHUB_API_KEY is read
  trips/[id].js   Dynamic trip detail route
components/       Presentational + form components, one file per concern
context/          React context providers (Auth, Profile, Theme, Language)
lib/              Data hooks (one per resource), pure helpers, i18n dictionary
supabase/schema.sql  Full database schema, RLS policies, and triggers
```

## Conventions

- **One hook per resource** (`useTransactions`, `useTrips`, `useSavingsGoals`,
  …): each owns its own `fetch`, `loading`, `error`, and mutation functions,
  and does optimistic local-state updates after a successful Supabase call
  rather than refetching.
- **Currency-agnostic formatting**: never hardcode a `$` or `Intl.NumberFormat`
  currency — call `formatCurrency(amount, profile.currency)` from
  `lib/currency.js`.
- **Translated strings only**: user-facing text goes through `t("namespace.key")`
  from `useLanguage()`; new copy must be added to both `en` and `fr` in
  `lib/translations.js`.
- **Dark mode via literal hex, not a Tailwind color token**: surfaces use
  `dark:bg-[#1a1a19]`, text uses `dark:text-[#c3c2b7]`, etc. — matching the
  validated categorical palette's dark steps documented in
  `docs/ARCHITECTURE.md`.
