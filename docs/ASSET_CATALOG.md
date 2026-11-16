# Asset catalog

All imagery is demo/placeholder photography downloaded from **Unsplash** and processed locally.
Nothing is hot-linked at runtime.

## Pipeline

`frontend/scripts/fetch-assets.mjs`

- Downloads each source at a target width (`w`, `q=82`, JPEG) from `images.unsplash.com`.
- Rotates by EXIF, resizes without enlargement, encodes WebP at quality 74 (`sharp`).
- Writes to `frontend/public/assets/images/<group>/<name>.webp`.
- Reuses eight product images as category tiles under `categories/`.
- Re-run with `node scripts/fetch-assets.mjs` (add `--force` to overwrite).

Total source imagery: **37 files, ≈1.7 MB WebP** (plus 8 category copies and the favicon).

## License

- Source: [Unsplash](https://unsplash.com) — [Unsplash License](https://unsplash.com/license).
- The license permits free commercial and non-commercial use. Attribution is not required,
  but source links are listed below for traceability.
- Images are used as illustrative demo photography only. No image implies an endorsement of
  Klarwerk, and all product names/brands in the catalog are fictional.
- If an image is replaced for production, keep this catalog updated and re-check the license.

## Source manifest

Source URLs follow `https://images.unsplash.com/photo-<id>`.

| Local file | Dimensions | Size | Source photo |
| --- | --- | --- | --- |
| `hero/hero-laptop.webp` | 2000×1338 | 81 KB | [photo-1603302576837-37561b2e2302](https://images.unsplash.com/photo-1603302576837-37561b2e2302) |
| `hero/hero-circuit.webp` | 1800×1201 | 236 KB | [photo-1550751827-4bd374c3f58b](https://images.unsplash.com/photo-1550751827-4bd374c3f58b) |
| `backgrounds/gradient.webp` | 1600×1216 | 18 KB | [photo-1618005182384-a83a8bd57fbe](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe) |
| `products/phone-green.webp` | 1200×675 | 47 KB | [photo-1608043152269-423dbba4e7e1](https://images.unsplash.com/photo-1608043152269-423dbba4e7e1) |
| `products/phone-desk.webp` | 1200×1449 | 17 KB | [photo-1616348436168-de43ad0db179](https://images.unsplash.com/photo-1616348436168-de43ad0db179) |
| `products/phone-airpods.webp` | 1200×2121 | 128 KB | [photo-1592899677977-9c10ca588bbd](https://images.unsplash.com/photo-1592899677977-9c10ca588bbd) |
| `products/phone-white.webp` | 1200×1200 | 101 KB | [photo-1511707171634-5f897ff02aa9](https://images.unsplash.com/photo-1511707171634-5f897ff02aa9) |
| `products/laptop-desk.webp` | 1200×800 | 23 KB | [photo-1496181133206-80ce9b88a853](https://images.unsplash.com/photo-1496181133206-80ce9b88a853) |
| `products/laptop-screen.webp` | 1200×675 | 53 KB | [photo-1593642632823-8f785ba67e45](https://images.unsplash.com/photo-1593642632823-8f785ba67e45) |
| `products/laptop-neon.webp` | 1200×960 | 28 KB | [photo-1517336714731-489689fd1ca8](https://images.unsplash.com/photo-1517336714731-489689fd1ca8) |
| `products/monitor-imac.webp` | 1200×800 | 5 KB | [photo-1527443224154-c4a3942d3acf](https://images.unsplash.com/photo-1527443224154-c4a3942d3acf) |
| `products/monitor-gaming.webp` | 1200×675 | 50 KB | [photo-1593640495253-23196b27a87f](https://images.unsplash.com/photo-1593640495253-23196b27a87f) |
| `products/headphones-yellow.webp` | 1200×800 | 22 KB | [photo-1505740420928-5e560c06d30e](https://images.unsplash.com/photo-1505740420928-5e560c06d30e) |
| `products/headphones-black.webp` | 1200×1814 | 26 KB | [photo-1583394838336-acd977736f90](https://images.unsplash.com/photo-1583394838336-acd977736f90) |
| `products/headphones-wood.webp` | 1200×800 | 25 KB | [photo-1484704849700-f032a568e944](https://images.unsplash.com/photo-1484704849700-f032a568e944) |
| `products/headphones-white.webp` | 1200×805 | 12 KB | [photo-1546435770-a3e426bf472b](https://images.unsplash.com/photo-1546435770-a3e426bf472b) |
| `products/earbuds.webp` | 1200×801 | 6 KB | [photo-1524678606370-a47ad25cb82a](https://images.unsplash.com/photo-1524678606370-a47ad25cb82a) |
| `products/speaker-white.webp` | 1200×800 | 22 KB | [photo-1558089687-f282ffcbc126](https://images.unsplash.com/photo-1558089687-f282ffcbc126) |
| `products/speaker-teal.webp` | 1200×800 | 25 KB | [photo-1545454675-3531b543be5d](https://images.unsplash.com/photo-1545454675-3531b543be5d) |
| `products/speaker-yellow.webp` | 1200×900 | 53 KB | [photo-1589003077984-894e133dabab](https://images.unsplash.com/photo-1589003077984-894e133dabab) |
| `products/watch-white.webp` | 1200×872 | 10 KB | [photo-1523275335684-37898b6baf30](https://images.unsplash.com/photo-1523275335684-37898b6baf30) |
| `products/watch-black.webp` | 1200×1500 | 29 KB | [photo-1546868871-7041f2a55e12](https://images.unsplash.com/photo-1546868871-7041f2a55e12) |
| `products/tablet-ipad.webp` | 1200×854 | 66 KB | [photo-1544244015-0df4b3ffc6b0](https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0) |
| `products/tablet-gold.webp` | 1200×1900 | 56 KB | [photo-1601784551446-20c9e07cdbdb](https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb) |
| `products/mouse.webp` | 1200×803 | 15 KB | [photo-1527864550417-7fd91fc51a46](https://images.unsplash.com/photo-1527864550417-7fd91fc51a46) |
| `products/mouse-dark.webp` | 1200×1500 | 10 KB | [photo-1615663245857-ac93bb7c39e7](https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7) |
| `products/keyboard-white.webp` | 1200×805 | 48 KB | [photo-1587829741301-dc798b83add3](https://images.unsplash.com/photo-1587829741301-dc798b83add3) |
| `products/keyboard-marble.webp` | 1200×1200 | 41 KB | [photo-1618384887929-16ec33fab9ef](https://images.unsplash.com/photo-1618384887929-16ec33fab9ef) |
| `products/keyboard-color.webp` | 1200×800 | 52 KB | [photo-1595044426077-d36d9236d54a](https://images.unsplash.com/photo-1595044426077-d36d9236d54a) |
| `products/network.webp` | 1200×800 | 37 KB | [photo-1544197150-b99a580bb7a8](https://images.unsplash.com/photo-1544197150-b99a580bb7a8) |
| `products/circuit.webp` | 1200×800 | 81 KB | [photo-1518770660439-4636190af475](https://images.unsplash.com/photo-1518770660439-4636190af475) |
| `products/controller-purple.webp` | 1200×800 | 18 KB | [photo-1612287230202-1ff1d85d1bdf](https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf) |
| `products/gaming-desk.webp` | 1200×800 | 45 KB | [photo-1629429407759-01cd3d7cfb38](https://images.unsplash.com/photo-1629429407759-01cd3d7cfb38) |
| `editorial/gaming-setup.webp` | 1600×1068 | 143 KB | [photo-1598550476439-6847785fcea6](https://images.unsplash.com/photo-1598550476439-6847785fcea6) |
| `editorial/camera.webp` | 1600×1067 | 24 KB | [photo-1526170375885-4d8ecf77b99f](https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f) |
| `editorial/controller.webp` | 1600×1067 | 23 KB | [photo-1606144042614-b2417e99c4e3](https://images.unsplash.com/photo-1606144042614-b2417e99c4e3) |
| `editorial/workspace.webp` | 1600×900 | 81 KB | [photo-1593642632823-8f785ba67e45](https://images.unsplash.com/photo-1593642632823-8f785ba67e45) |

## Category tiles

Copies of product images, generated by the same script:

| Local file | Reused source |
| --- | --- |
| `categories/laptops.webp` | `products/laptop-neon.webp` |
| `categories/smartphones.webp` | `products/phone-green.webp` |
| `categories/audio.webp` | `products/headphones-black.webp` |
| `categories/gaming.webp` | `products/controller-purple.webp` |
| `categories/wearables.webp` | `products/watch-black.webp` |
| `categories/desk.webp` | `products/keyboard-white.webp` |
| `categories/tablets.webp` | `products/tablet-gold.webp` |
| `categories/monitors.webp` | `products/monitor-imac.webp` |

## Other assets

- `frontend/public/favicon.svg` — original Klarwerk mark (indigo/violet gradient on ink).
- Fonts: `@fontsource-variable/space-grotesk` and `@fontsource-variable/inter` (SIL Open Font
  License), bundled locally by Vite.
- Icons: [Lucide](https://lucide.dev) (ISC License), imported per-icon.
