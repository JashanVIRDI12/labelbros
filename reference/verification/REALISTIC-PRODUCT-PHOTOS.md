# Current product photography — November 12, 2026

Generated with the built-in imagegen tool: one new photograph for each of the 19 products,
plus one thumbnail per photograph. All final assets live in `public/products/realistic/`.
The full prompts, representative dimensions, alt text and export metadata are recorded in
[the prompt manifest](../product-photo-prompts-2026-11-12.json).

Each photograph is 1024 × 1280 (4:5) WebP. Each thumbnail is 256 × 256 WebP, fitted inside
the square so the complete product silhouette stays visible. All 38 files use quality 82.
The set totals 1,521,932 bytes; the largest photograph is 121,710 bytes and the largest
thumbnail is 9,964 bytes, within the 150 KB / 20 KB budgets.

Label shapes and proportions follow the product defaults: round food and candle labels,
landscape roll and sheet labels, wide beverage wraps, portrait bottle/coffee/cosmetic
labels, 2-inch seals and metallic/kraft stickers, and 3-inch vinyl and specialty stickers.
The sample pack illustrates material samples. These are representative photographs;
the configurator continues to define the customer's exact shape and dimensions.

The catalog, product pages, navigation thumbnails, cart thumbnails, bulk packs, homepage
showcase, sticker material selector and ordering steps use the new images. Product pages
use `contain` to keep tall packaging visible in wide stages; catalog cards retain their
4:5 crop. The earlier photo set and transparent preview artwork remain available.

## Files

All file names below have `.webp` and `-thumb.webp` variants inside
`public/products/realistic/`. Photo and thumbnail sizes are bytes.

| Product | Representative size | Photo | Thumbnail |
|---|---|---:|---:|
| `custom-labels` | 3 × 2 in | 77,192 | 6,150 |
| `roll-labels` | 3 × 2 in, rounded rectangle | 57,708 | 6,318 |
| `food-labels` | 3 in diameter, circle | 93,816 | 7,698 |
| `beverage-labels` | 6 × 2.5 in, wrap-around rectangle | 60,180 | 4,900 |
| `bottle-labels` | 3 × 4 in, rounded rectangle | 35,094 | 3,502 |
| `coffee-labels` | 3 × 4 in, die-cut | 80,548 | 4,804 |
| `candle-labels` | 3 in diameter, circle | 43,118 | 4,180 |
| `cosmetic-labels` | 1.5 × 2 in, rectangle | 46,054 | 3,800 |
| `circle-labels` | 2 in diameter, circle | 86,800 | 6,186 |
| `sheet-labels` | 3 × 2 in, rounded rectangle on letter sheet | 71,684 | 8,660 |
| `vinyl-stickers` | 3 × 3 in, die-cut | 73,100 | 8,844 |
| `clear-stickers` | 3 × 3 in, clear die-cut | 51,010 | 5,510 |
| `holographic-stickers` | 3 × 3 in, die-cut | 71,538 | 5,910 |
| `glitter-stickers` | 3 × 3 in, die-cut | 102,950 | 5,458 |
| `kraft-stickers` | 2 in diameter, circle | 98,706 | 5,364 |
| `metallic-stickers` | 2 in diameter, circle | 74,830 | 5,634 |
| `50-3in-custom-stickers` | 3 × 3 in, 50-sticker pack | 61,530 | 7,566 |
| `250-3in-vinyl-stickers` | 3 × 3 in, 250-sticker pack | 96,854 | 9,964 |
| `sample-pack` | 3 × 2 in material samples | 121,710 | 7,062 |

## Visual review

[Contact sheet](./realistic-product-photos/contact-sheet.jpg) shows all 19 photographs.
Each image was reviewed for text spelling, product/material appearance, label shape,
framing and consistency. Sample marks read `YOUR BRAND`, with `Your Brand` on the candle
and `SAMPLE PACK` on the sample card.

Browser checks and screenshots are stored in `realistic-product-photos/`.

## Verification

- `pnpm lint`, `pnpm exec tsc --noEmit --incremental false` and `pnpm build` pass.
- All 38 files pass exact pixel-dimension, metadata and byte-budget checks.
- All 19 product pages pass at 1440 × 900 and 390 × 844: correct new photograph,
  working photo/thumbnail URLs, descriptive alt text, `contain` fit and no horizontal overflow.
- Home, labels, stickers, shop and business pages also reference the new image set at both
  widths: 48 page checks in total, with zero browser runtime errors. Full results are in
  [browser-checks.json](./realistic-product-photos/browser-checks.json).
- Saved screenshots cover the label grid, sticker grid, food labels, bottle labels,
  vinyl stickers and sample pack at both widths. Visual review confirms complete packaging
  silhouettes on product pages and readable designs in the catalog.
