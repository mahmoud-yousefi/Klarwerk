# Architecture

## Shape of the app

```
Klarwerk/
  frontend/                  React storefront (independently deployable)
    public/assets/images/    Optimised local demo imagery
    scripts/                 Catalog generator + Unsplash asset pipeline
    src/
      app/                   Global providers (TanStack Query)
      components/
        assistant/           Chat messages, composer, cards, comparison table
        catalog/             Facet/filter panel
        home/                Home page sections
        layout/              Header, footer, drawers, search, compare bar
        marketing/           Newsletter
        product/             Product cards, gallery, specs, reviews, actions
        ui/                  Primitive design-system components
      data/                  Demo catalog, categories, brands, articles, info, site
      hooks/                 Catalog query, cart/product actions, UI helpers
      i18n/                  i18next setup + de/en namespaces
      lib/                   Catalog query engine, formatting, validation helpers
      pages/                 Route-level screens (lazy loaded)
      services/              API base, catalog, checkout, assistant
      stores/                Zustand stores (cart, wishlist, compare, assistant, UI, toasts)
      styles/                Tailwind entry + design-system layers
  docs/                      This documentation
  backend/                   Express API (Phase 4)
```

## Runtime modes

`services/api.ts` exposes:

- `API_BASE_URL` — `VITE_API_BASE_URL` with any trailing slash removed.
- `isRemoteApiEnabled` — true when the variable is non-empty.
- `apiFetch<T>()` — JSON fetch with a 15s timeout and normalised `ApiError`
  (`status`, optional `code`).

With no API URL (the default), everything runs locally:

| Concern | Local implementation | Remote endpoint (future) |
| --- | --- | --- |
| Catalog list | `queryCatalog()` over bundled JSON | `GET /products` |
| Checkout | `createDemoOrder()` recalculates prices client-side and persists to `localStorage` | `POST /checkout/orders` |
| Assistant | `buildMockReply()` + simulated token stream | `POST /assistant/chat` (SSE) |

Only the service call changes when the backend arrives; pages and components stay the same.

## Data layer

- `src/data/catalog.json` — generated demo inventory (`meta`, `products`) with localized names,
  taglines, descriptions, images, specs, price history and availability.
- `src/data/categories.json`, `brands.json` — taxonomy and brand copy (DE/EN).
- `src/data/articles.json` — 8 magazine articles with localized titles, excerpts and body.
- `src/data/info.json` — shipping, returns, warranty, privacy, about and contact content.
- `src/data/site.json` — store config: free-shipping threshold, shipping prices, VAT, returns.
- `src/lib/catalog.ts` — indexes (`productBySlug`, `categoryById`, …), `queryCatalog()` for
  search/filter/sort/pagination, quick search and article helpers.
- `src/hooks/useCatalogQuery.ts` — TanStack Query wrapper. Uses local results as `initialData`
  in mock mode and `keepPreviousData` while filters change.

Search normalises diacritics and matches product names, brands, taglines, descriptions and
category labels, so "kopfhorer" and "Kopfhörer" behave the same.

## State

Zustand stores, all small and feature-scoped:

| Store | Persistence key | Notes |
| --- | --- | --- |
| `cart.store` | `klarwerk.cart.v1` | lines `{ productId, quantity }`, quantity clamped by stock |
| `wishlist.store` | `klarwerk.wishlist.v1` | product IDs |
| `compare.store` | `klarwerk.compare.v1` | max 4 IDs; `toggle` returns `added`/`removed`/`limit` |
| `assistant.store` | `klarwerk.assistant.v1` (session) | messages with `status`, `productIds`, `compareIds`, `suggestions` |
| `ui.store` | none | cart drawer, mobile menu, search overlay |
| `toast.store` | none | transient notifications |

TanStack Query owns server-shaped catalog state; Zustand owns user-local state. Nothing is sent
to a backend in demo mode.

## Routing

All pages are lazy-loaded behind a single `Layout` with a scroll-to-top effect.

| Path | Page |
| --- | --- |
| `/` | `HomePage` |
| `/shop` | `CatalogPage` |
| `/product/:slug` | `ProductPage` |
| `/cart` | `CartPage` |
| `/checkout` | `CheckoutPage` |
| `/order/:id` | `ConfirmationPage` |
| `/wishlist` | `WishlistPage` |
| `/compare` | `ComparePage` |
| `/advisor` | `AssistantPage` |
| `/magazine`, `/magazine/:slug` | `MagazinePage`, `ArticlePage` |
| `/info/:slug` | `InfoPage` |
| `*` | `NotFoundPage` |

Catalog filter state lives in the URL (`search`, `category`, `brand`, `availability`, `minPrice`,
`maxPrice`, `sort`, `page`), so links are shareable and back/forward works.

## Internationalisation

- `src/i18n/index.ts` initialises i18next with `de` as fallback and default language.
- Namespaces: `common`, `store`, `checkout`, `assistant`, `editorial` — each with `de` and `en`.
- Language is persisted as `klarwerk.locale`; `document.documentElement.lang` follows the locale.
- Pages select their primary namespace and use explicit prefixes (`store:`, `checkout:`,
  `common:`, `editorial:`, `assistant:`) when mixing namespaces. This avoids raw keys when the
  default namespace differs from the key's namespace.
- Catalog, category, brand, article and info content is bilingual in the JSON data itself.
- Prices use `Intl.NumberFormat` with `de-DE`/`en-GB` and EUR; dates use `Intl.DateTimeFormat`.

## AI advisor

`AssistantPage` orchestrates turns; `services/assistant.service.ts` generates and streams answers.

1. A user message and an empty assistant message are added to the store.
2. `streamTurn` snapshots history (last 8 user/done messages) and the previous assistant's
   `productIds` as `seedProductIds`.
3. `streamAssistant` either calls `streamRemote` (SSE) or builds a mock reply and streams it.
4. Deltas update the assistant message; `onProducts` / `onCompare` attach structured results.
5. On completion the page recomputes suggestions and marks the message `done`; abort marks it
   `stopped`; failures mark it `error` and offer retry.

Mock intent handling:

- Store questions (shipping, returns, warranty, payment, service) answer from `site.json` copy.
- Compare intent selects two products, formats key differences and emits `compareIds`.
- "Compare the first two" follow-ups reuse the previous assistant's `productIds` instead of
  re-ranking the whole catalog.
- Recommendation intent detects category, budget, use case and value intent, scores products by
  rating, review count, budget fit and use case, then explains each pick from real specs.

The SSE client parses `data:` frames and accepts `delta`, `products`, `comparison` and `[DONE]`.
See `API_CONTRACT.md`.

## Checkout

- Four steps: address → shipping → payment → review, validated with Zod via React Hook Form.
- Shipping and VAT come from `site.json`; totals are recalculated from the cart and catalog,
  never trusted from the client payload.
- `createDemoOrder` writes the last 10 orders to `klarwerk.orders.v1`, clears the cart and returns
  an order ID (`KW-XXXXXXXX`) used by `/order/:id`.
- No card fields are collected. Payment methods are visual demo choices only.

## Performance

- Route-level code splitting via `React.lazy` + `Suspense`.
- Local WebP imagery with explicit dimensions, lazy loading below the fold, high priority for the
  hero only.
- CSS/IntersectionObserver animation instead of animation libraries.
- Fonts are self-hosted, variable and preloaded through the fontsource packages.
- Bundle: main chunk ≈ 790 kB minified (≈ 183 kB gzip); three.js/GSAP are intentionally absent.
  Further splitting is tracked in the plan.

## Accessibility

- Skip link, semantic landmarks, visible `:focus-visible` outline, labelled icon buttons.
- Dialogs/drawers trap focus, restore focus on close, close on Escape and lock body scroll.
- Product actions expose state (`aria-pressed` for wishlist/compare) and disabled states.
- Reduced motion: all animations/transitions collapse to ~0ms; JS scroll effects check
  `prefers-reduced-motion`.
- Colour contrast targets WCAG AA for body text; decorative glows/grid lines are `aria-hidden`.

## Manual QA checklist

1. Run `npm run dev` in `frontend/`; open http://localhost:5173.
2. Switch DE ↔ EN on every route; no raw keys, no mixed-language UI.
3. Filter/sort/paginate the catalog, then reload — filters survive via URL.
4. Add to cart / wishlist / compare; reload to confirm persistence; complete a demo order.
5. In `/advisor`, try a starter prompt, stop mid-stream, retry, and "compare the first two".
6. Check 390 px width: drawers, tables (horizontal scroll inside their container), checkout.
7. Enable "Reduce motion" in the OS and confirm motion stops.
