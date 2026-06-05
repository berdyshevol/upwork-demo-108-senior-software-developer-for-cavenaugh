# Lead Attribution Dashboard

A client-facing reporting portal that unifies leads from multiple marketing
sources (Google Ads, Facebook, GoHighLevel, Website forms) into a single
attribution view — the internal/client tool pattern Cavenaugh builds for
home-service businesses (HVAC, plumbing).

## What this demonstrates

- **Multi-source aggregation through a typed adapter layer.** Each external
  system has a different raw payload shape; the adapters in `lib/adapters/`
  normalize all of them into one canonical `Lead` type. Swapping a mock for a
  live Google/Facebook/GoHighLevel API means editing one adapter — the UI never
  changes.
- **Server-computed attribution.** Cost-per-lead, ROAS, revenue per channel and
  the blended KPI summary are all derived server-side in `lib/attribution.ts`.
- **Dashboard** (`/`) — KPI cards (total leads, booked appointments, attributed
  revenue, blended cost-per-lead), a leads-over-time trend chart, and a
  per-channel attribution table.
- **Leads explorer** (`/leads`) — a filterable lead table; filtering by source
  or date range recomputes totals instantly, client-side.
- **REST API** (`GET /api/leads`) — returns normalized leads plus computed
  attribution and summary as JSON. Supports `?source=`, `?from=`, `?to=`.

## Tech stack

- Next.js (App Router) + React Server Components / Route Handlers
- TypeScript with a typed source-adapter layer
- Tailwind CSS
- Recharts for the trend chart
- In-memory deterministic seed data (HVAC/plumbing sample leads) — no external
  API keys required at runtime

## Data model

```ts
Lead        { id, source: 'google'|'facebook'|'ghl'|'website',
              status: 'new'|'booked'|'won', value, name, service, createdAt }
SourceSpend { source, spend, period }
```

Attribution metrics (CPL, ROAS, revenue/source, blended CPL) are computed from
these — see `lib/attribution.ts`.

## Run locally

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

### Build

```bash
pnpm build
```

### Tests (Playwright behavioral / acceptance)

```bash
pnpm exec playwright install --with-deps chromium   # once
pnpm test
```

The test suite drives the real UI and API, covering every acceptance criterion:
KPI cards populated from seed data, the per-channel source breakdown, source +
date-range filtering on `/leads`, and the `/api/leads` JSON contract.
