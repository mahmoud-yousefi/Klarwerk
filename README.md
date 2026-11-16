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

Delivered now: full DE/EN storefront, catalog and product pages, cart/wishlist/compare, demo
checkout with orders, magazine and info pages, and the catalog-grounded AI advisor in mock mode.

## Documentation

- [Implementation plan](docs/IMPLEMENTATION_PLAN.md) — phases, next steps, definition of done.
- [Architecture](docs/ARCHITECTURE.md) — data flow, state, routing, i18n, assistant and QA.
- [Design system](docs/DESIGN_SYSTEM.md) — tokens, typography, components, motion, a11y.
- [API contract](docs/API_CONTRACT.md) — endpoints for catalog, checkout and SSE assistant.
- [Asset catalog](docs/ASSET_CATALOG.md) — imagery sources, license and file manifest.
