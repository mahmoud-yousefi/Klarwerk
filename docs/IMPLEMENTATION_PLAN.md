# Implementation plan

Klarwerk is built frontend-first. The goal is a complete, polished storefront that
already behaves like a real shop, with a thin service layer that can be pointed at a
small Express API later without rewriting pages.

## Phase 0 — Foundation (done)

- Vite + React 18 + TypeScript (strict), Tailwind 3.4 with custom tokens.
- React Router, Zustand, TanStack Query, React Hook Form + Zod, i18next, Lucide.
- Self-hosted variable fonts (Space Grotesk, Inter) via `@fontsource-variable`.
- Fictional demo catalog: 122 products, 12 categories, 8 brands, 8 editorial articles.
- Optimised local WebP imagery (37 source images, ~1.7 MB) with an asset pipeline script.

## Phase 1 — Storefront (done)

- Cinematic home page: hero, trust strip, brand marquee, trending rail, collections,
  spotlight, advisor teaser, magazine preview, newsletter.
- Catalog with URL-synced search, category/brand/availability/price filters, sorting,
  pagination and a mobile filter drawer.
- Product detail: gallery + lightbox, price/discount, stock state, specs, review summary,
  related products, wishlist, compare, add to cart.
- Cart drawer and cart page, wishlist, compare (up to 4 products, difference-only view).
- Multi-step demo checkout with Zod validation, shipping/payment selection, review step,
  demo order confirmation and order history in `localStorage`.
- Magazine index/article pages and info pages (shipping, returns, warranty, etc.).
- 404 page, empty states, skeletons, toasts.

## Phase 2 — AI advisor UI (done, mock mode)

- Dedicated `/advisor` chat surface with starter prompts, modes, suggestions and copy/retry/stop.
- Mock streaming engine grounded strictly in the catalog: intent detection, budget parsing,
  use-case ranking, comparison tables, seeded follow-ups ("compare the first two").
- `?q=` deep link auto-send (guarded against React StrictMode double effects).
- Chat history persisted in `sessionStorage`; stop/retry preserves partial output and status.
- UI is ready for an SSE backend (see `API_CONTRACT.md`); mock mode never contacts an AI provider.

## Phase 3 — Quality pass (done)

- Full DE/EN coverage of UI, catalog content, articles and info pages; German default.
- Verified all routes in both locales with no console errors and no raw translation keys.
- Responsive audit at 390 × 844 and 1000 px: no horizontal document overflow.
- Reduced-motion support via a global media query plus `matchMedia` guards in JS.
- `tsc --noEmit` and production build pass.

## Phase 4 — Backend (next)

1. Create `backend/` as a small Express (or Fastify) service with the endpoints in
   `API_CONTRACT.md`.
2. Move catalog data behind `GET /products` and `GET /products/:slug`; keep the same
   response shapes so `catalogService` only changes its base URL.
3. Add `POST /checkout/orders` that recalculates totals server-side and returns a demo order.
4. Add `POST /assistant/chat` speaking SSE (`delta`, `products`, `comparison`, `done`).
5. Wire a real model provider behind the backend only. Keep keys server-side; the frontend
   must never receive them.
6. Add rate limiting, request validation and structured logging.

## Phase 5 — Production hardening (later)

- Automated tests (Vitest + Testing Library, Playwright smoke flows).
- Real search (index-based) and product reviews API.
- Legal pages (Impressum, Datenschutz, AGB), cookie consent if analytics are added.
- Image CDN / responsive `srcset`, bundle splitting of large shared chunks.
- Observability, error reporting and CI (type-check, build, tests).

## Definition of done for the demo

- Every route works in DE and EN, on mobile and desktop, with keyboard navigation.
- No real payment, shipment, account or external AI call is triggered.
- Demo disclaimers remain visible in the announcement bar, footer, checkout, product pages,
  magazine and advisor.
- A new developer can run `npm install && npm run dev` and get the full experience offline.
