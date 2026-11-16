# Klarwerk

**Technik, die weiterdenkt.** Premium, bilingual electronics storefront with an AI shopping advisor.

Klarwerk is a portfolio-grade demo commerce platform. The storefront is built as an independent React application and is prepared to talk to a small Express API for catalog, checkout and streamed AI responses. Until that API is connected, the app runs fully on the bundled demo catalog.

> Demo project. All products, brands, prices and availability are fictional and illustrative. No real payment is processed and no real AI provider is contacted in mock mode.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS with custom design tokens
- React Router, Zustand, TanStack Query, React Hook Form + Zod, i18next
- Lucide icons, self-hosted variable fonts (Space Grotesk, Inter)

## Quick start

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173. German is the default locale; English is available in the header.

```bash
npm run build     # type-check + production build
npm run preview   # serve the production build
npm run catalog:generate   # regenerate the demo catalog
node scripts/fetch-assets.mjs   # re-download optimised demo imagery
```

## Project layout

```
frontend/          React storefront (independent deployable)
  public/assets/   Optimised demo imagery
  scripts/         Catalog generator + asset pipeline
  src/             Application source
backend/           Express API (added in a later phase)
shared/            Shared contracts (later)
docs/              Architecture, design system, assets, plan
```

## Languages

- German (`de-DE`) is the default and authoring language.
- English (`en-GB`) is a full second locale.
- Prices are in EUR; formatting is locale-aware.

## Status

Frontend-first build. The backend contract is documented and mocked client-side, so connecting the real Express API later is a configuration change plus a thin service swap, not a rewrite.

See `docs/` for architecture, design system, API contract and implementation plan.
