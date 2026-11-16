# Design system

Klarwerk pairs a dark, cinematic brand surface with a calm, bright shopping surface. The system is
intentionally small: tokens in Tailwind, a handful of CSS component classes, and ~20 primitives.

## Brand idea

**Technik, die weiterdenkt.** — premium electronics, honestly curated, personally advised.
The visual language is precise and quiet: generous whitespace, hairline borders, restrained accent
colour, and a signature electric-indigo → violet gradient used only where the product or the AI is
the focus.

## Colour tokens

Defined in `frontend/tailwind.config.js`.

| Token | Value | Use |
| --- | --- | --- |
| `ink-950` | `#05080F` | deepest brand background |
| `ink-900` | `#080D18` | primary dark surface, buttons, text |
| `ink-800` | `#0D1524` | raised dark surface |
| `ink-700` | `#141F33` | dark borders/hover |
| `navy` | `#17243C` | dark accent surface |
| `electric-300/400/500/600` | `#A5AEFF` → `#4650D8` | primary accent, links, CTA |
| `violet-300/400/500/600` | `#C4AAF8` → `#8357DA` | AI surfaces, secondary accent |
| `mist` | `#F7F8FC` | page background |
| `steel` | `#A5ADBD` | muted text on dark |
| `line` | `#E4E7F0` | light hairlines |

Rules:

- One primary action per view. `electric-500` is the only "buy/advance" colour.
- Violet is reserved for the AI advisor and comparison context.
- Success = emerald, warning = amber, destructive = rose; use at 10% background / 500 text pairs.
- On light surfaces, body text is `ink-900` at 50–75% opacity; never full black.

## Typography

| Role | Family | Notes |
| --- | --- | --- |
| Display | Space Grotesk Variable | `font-display`, tight tracking (`-0.02em` to `-0.045em`) |
| Body/UI | Inter Variable | `font-sans`, 10–16px in UI, 14–16px in prose |

- Headings use `text-wrap: balance`; paragraphs use `text-wrap: pretty` (global CSS).
- Page titles: `text-4xl` → `text-6xl`, line-height ~1.02–1.06.
- Section titles: `text-xl` → `text-3xl`.
- Eyebrows: 11px semibold uppercase, `tracking-[0.22em]`, paired with a 12–13px Lucide icon.
- Body copy on marketing pages: 13–16px, line-height 1.7–1.8.
- Numbers that need to align use `tabular-nums`.

## Spacing and layout

- Page container: `.container-x` = max 1440px, padding 20 → 32 → 48px.
- Narrow prose container: `.container-narrow` = max 768px.
- Section rhythm: 64–112px vertical on marketing pages, 32–48px in app pages.
- Grid: 4/8px base; common gaps 8, 12, 16, 20, 24, 32, 40px.
- Cards use 20–32px padding; page sections use 28–40px.
- Sticky header offset is accounted for with `scroll-padding-top: 6rem`.

## Radius, border, elevation

- Pills/buttons: `rounded-full`.
- Cards: `rounded-2xl` (16px) / `rounded-3xl` (24px); hero media `rounded-4xl` (32px).
- Borders: `border-ink-900/8` on light, `border-white/12` on dark.
- Shadows: `shadow-soft` for cards, `shadow-lift` on hover, `shadow-glow`/custom indigo glow for
  primary emphasis. Never stack more than one strong shadow.

## Imagery

- Product photography sits on light neutral surfaces (`#EDF0F6`) with `object-cover`.
- Cards zoom 4% on hover over 700ms; no image filters.
- Dark sections use gradients, grid lines and a subtle noise overlay (`.noise`) for depth.
- Hero media floats slowly; all motion respects reduced-motion.

## Components

Primitives in `src/components/ui`:

- `Button` — variants `primary`, `dark`, `outline`, `ghost`, `light`, `outline-light`, `soft`;
  sizes `sm`, `md`, `lg`, `icon`; pill shape; focus ring from global styles.
- `Badge` — `dark`, `light`, `electric`, `violet`, `success`, `warning`.
- `Price` — locale-aware EUR, optional original price with strike-through and discount.
- `Rating` — filled/half stars, optional numeric value.
- `Modal`, `Drawer` — portalled, focus-trapped, Escape to close, body scroll lock.
- `Field` — label, hint, error state, consistent 44px control height.
- `Breadcrumbs`, `EmptyState`, `Skeleton`, `Spinner`, `Toaster`, `Reveal`.
- `QuantityStepper`, `Logo`, `ProductCard`, `ProductGrid`, `ProductRail`.

Layout: `Header` (sticky, transparent-to-solid, cart count), `AnnouncementBar` (demo notice),
`Footer` (help, company, legal, newsletter), `CartDrawer`, `MobileMenu`, `SearchOverlay`,
`CompareBar`, `LanguageSwitcher`.

Product: `ProductGallery` (thumbnails + lightbox), `AvailabilityBadge`, `WishlistButton`,
`CompareButton`, `SpecsTable`, `ReviewSummary`.

Assistant: `AssistantMessage` (markdown-lite, copy/retry/stop), `ChatComposer` (auto-growing,
char counter), `StarterPrompts`, `RecommendationCard`, `ComparisonTable`.

## Motion

- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`; durations 250–700ms.
- Named animations: `fade-up`, `float`, `marquee`, `shimmer`, `pulse-ring`, `slide-in`, `scale-in`.
- Hover: translate −2 to −4px plus shadow; never scale text.
- Entrance: `Reveal` via IntersectionObserver, staggered up to 6 children.
- `prefers-reduced-motion: reduce` forces animations/transitions to ~0ms and disables smooth scroll.

## Content and tone

- German is the authoring language; English mirrors intent, not word-for-word.
- Short sentences, concrete benefits, no hype adjectives without a spec behind them.
- Demo disclaimers are always visible where money, data or AI is involved.
- Prices: `899 €` in DE, `€899` in EN; shipping thresholds from `site.json`.

## Accessibility rules

- Minimum target 44×44px for primary controls.
- Icon-only buttons need `aria-label` and a `title` tooltip.
- Stateful toggles use `aria-pressed`; navigation uses `aria-current`.
- Tables keep a header row and a `<caption>` or labelled heading.
- Colour is never the only signal: stock state and differences include text/icons.
- Focus is always visible (`:focus-visible` = 2px electric outline, 3px offset).
