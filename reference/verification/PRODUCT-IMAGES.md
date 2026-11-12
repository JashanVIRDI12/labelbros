# Product photography verification — 2026-11-12

## Delivered

Generated with the built-in imagegen tool: seven transparent label artworks, nineteen portrait product photographs, nineteen square thumbnails and one share image. All 46 exported files total 1,958,718 bytes. [Exact filenames, dimensions, byte counts and final prompts](../IMAGES.md).

The product models, live brand-name store, old company-labelled photos and obsolete render assets are removed. Product cards, product pages, menus, bulk packs, cart thumbnails and label previews use the new image data. The hero keeps its renderer, drag/throw/reset behavior, fallback fonts and original sticker layouts; its four product-label assets now use the new artwork. Pricing, checkout, admin and server code were left as found.

Photos use 4:5 containers, cover sizing, scroll reveals and a gentle hover zoom. Main product photos are preloaded with high fetch priority; thumbnails have low fetch priority, and closed menus defer their content until opened. Optimized delivery prefers AVIF with a WebP fallback. The 750 px food photograph is 17,490 bytes as AVIF and 35,834 bytes as WebP.

## Checks

- `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build`: pass. [Build output](product-images/build.txt).
- All nineteen `/shop/<slug>` routes have complete statically computed HTML. [Prerender evidence](product-images/prerendered-products.json).
- The brief’s obsolete-source scan returns no matches; `git diff --check` passes.
- Every exported file meets its dimensions and byte budget. Seven flat labels retain alpha transparency. Largest label: 57,888 bytes; largest photo: 126,114 bytes; largest thumbnail: 16,862 bytes; share image: 60,884 bytes. [Machine-readable sizes](product-images/image-sizes.json).
- Every generated asset was visually checked for spelling, extra text, framing and consistency. Three sticker scenes were regenerated to remove unrequested props; the share image received a targeted kraft-pouch correction.
- Dev browser sweep: sixteen page/width combinations, fifty-five interaction/layout checks, zero console errors, zero broken product images. [Dev results](product-images/browser-results-dev.json).
- Production browser sweep: the same sixteen page/width combinations and fifty-five interaction/layout checks pass on the final build, with zero console errors or broken images. [Production results](product-images/browser-results.json).
- Checked `/`, `/labels`, `/stickers`, `/shop`, `/business`, `/shop/food-labels`, `/shop/vinyl-stickers`, `/shop/sample-pack` at 1440 × 900 and 390 × 844.
- Checked horizontal overflow at 375, 390, 768, 1280 and 1920 px. Checked menus, a two-item cart, Photo / Your label, hero pointer drag, throw, landing and reset. Desktop has all four updated label designs; mobile keeps the original smaller selection.

## Lighthouse

Lighthouse 13.6, default mobile simulation, production server on `http://localhost:3100`. All three routes meet the brief’s Performance ≥ 90, Accessibility 100, Best Practices ≥ 95, SEO 100 and CLS < 0.05 targets.

| Route | Performance | Accessibility | Best Practices | SEO | LCP | CLS |
|---|---:|---:|---:|---:|---:|---:|
| `/` | 93 | 100 | 100 | 100 | 3.16 s | 0 |
| `/labels` | 100 | 100 | 100 | 100 | 0.91 s | 0 |
| `/shop/food-labels` | 94 | 100 | 100 | 100 | 3.15 s | 0 |

The additional `CLAUDE.md` target of LCP < 2.5 s remains above budget on the homepage and food-label page in the default simulated mobile audit (about 3.16 s). Actual deployment/CDN performance has not been measured.

Reports: [Home](product-images/lighthouse-home.report.html), [Labels](product-images/lighthouse-labels.report.html), [Food labels](product-images/lighthouse-food-labels.report.html). Raw audit data and summaries are saved beside these reports.

## Selected final screenshots

| View | 1440 × 900 | 390 × 844 |
|---|---|---|
| Homepage labels | [Desktop](product-images/final-home-labels-1440.png) | [Mobile](product-images/final-home-labels-390.png) |
| Homepage stickers | [Desktop](product-images/final-home-stickers-1440.png) | [Mobile](product-images/final-home-stickers-390.png) |
| Food-label product page | [Desktop](product-images/final-product-1440.png) | [Mobile](product-images/final-product-390.png) |

## Scenario screenshots

| View | Desktop | Mobile |
|---|---|---|
| Homepage hero | [1440](product-images/home-1440.png) | [390](product-images/home-390.png) |
| Labels | [1440](product-images/labels-1440.png) | [390](product-images/labels-390.png) |
| Stickers | [1440](product-images/stickers-1440.png) | [390](product-images/stickers-390.png) |
| Shop | [1440](product-images/shop-1440.png) | [390](product-images/shop-390.png) |
| Business | [1440](product-images/business-1440.png) | [390](product-images/business-390.png) |
| Food labels | [1440](product-images/shop-food-labels-1440.png) | [390](product-images/shop-food-labels-390.png) |
| Vinyl stickers | [1440](product-images/shop-vinyl-stickers-1440.png) | [390](product-images/shop-vinyl-stickers-390.png) |
| Sample pack | [1440](product-images/shop-sample-pack-1440.png) | [390](product-images/shop-sample-pack-390.png) |
| Labels menu | [1440](product-images/menu-labels-1440.png) | [390](product-images/menu-labels-390.png) |
| Stickers menu | [1440](product-images/menu-stickers-1440.png) | [390](product-images/menu-stickers-390.png) |
| Cart with two items | [1440](product-images/cart-two-items-1440.png) | [390](product-images/cart-two-items-390.png) |
| Your label preview | [1440](product-images/your-label-1440.png) | [390](product-images/your-label-390.png) |
| Hero hover | [1440](product-images/hero-hover-1440.png) | [390](product-images/hero-hover-390.png) |
| Hero held | [1440](product-images/hero-held-1440.png) | [390](product-images/hero-held-390.png) |
| Hero thrown | [1440](product-images/hero-thrown-1440.png) | [390](product-images/hero-thrown-390.png) |
| Hero landed | [1440](product-images/hero-dragged-1440.png) | [390](product-images/hero-dragged-390.png) |
