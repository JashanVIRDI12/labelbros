# Brief for Codex: replace the 3D products with generated product photography

You are working in the Label Bros repo (Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, GSAP, pnpm). Read `CLAUDE.md` first and follow it. In short: never read `.env*`, never push or deploy, use pnpm, and don't add sections the client didn't ask for.

The working tree has a lot of **uncommitted work from the previous session** (the whole shop redesign). Build on it. Do **not** run `git reset`, `git checkout -- <file>`, `git stash` or anything else that discards changes.

## What the client wants

The 3D products (three.js jars, bottles and so on in `src/components/product3d/`) look bad. Remove them completely and use **generated, photorealistic product photography** instead. Every label in every image says **"YOUR BRAND"**, never a company name. There is one image per product (labels and stickers), plus flat label artworks, thumbnails and a share image.

Keep everything else working as it is: the shop, cart, checkout, admin, the scroll reveals, and the **hero's WebGL sticker table** (`src/components/hero/`). That one stays, and so does the `three` dependency it uses.

The work has three parts: **A**, generate the images; **B**, change the code; **C**, verify.

---

## Part A: generate the images

### A.1 Art direction (applies to every photo)

The site is a label printer's shop for businesses. The page is press blue (#1E3FD8) with cream text (#F5F1E8) and label yellow (#FFD21F) for actions. Product photos sit on cream cards, so they must look like **one consistent, premium e-commerce series**: same light, same camera, same framing, same realism.

Paste this **STYLE block** at the start of every product photo prompt (sets B and C), then add the product-specific prompt:

> Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in {BACKDROP} that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera at product height, slightly above (about 10° down), 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.

**Label text rules (all images):**
- The main wordmark reads exactly **YOUR BRAND**: two words, perfectly spelled, large, centred. Use the casing the prompt gives.
- Add at most **one** secondary line, exactly as written in the prompt.
- No other words. No small print, ingredient lists, fake addresses or barcodes: image models garble small text.
- If the text comes out misspelled or garbled, **regenerate**. Never ship an image with broken text.

**Backdrop colours** (use the hex in the prompt). They also become the product's `tone`, the card's placeholder colour while the image loads:
| name | hex | `tone` value |
|---|---|---|
| warm cream | #EFE8D9 | `cream` |
| warm sand | #E8DCC2 | `sand` |
| pale periwinkle | #DFE5FF | `sky` |
| label yellow | #FFD21F | `yellow` |
| charcoal | #18181B | `ink` |
| press blue | #1E3FD8 | `blue` |

### A.2 Workflow

1. **Flat labels first (set A).** Generate each label as flat artwork on a transparent background. Use the image tool's transparent-background option (for example, gpt-image with `background: "transparent"`). If the tool has none, generate on pure white and cut it out cleanly.
2. **Product photos next (sets B and C).** When generating a product that carries one of the set-A labels, give the flat label as a **reference image** and ask for "this exact label, wrapped on the product". That keeps the design identical between the photo, the label preview and the hero table.
3. **Size:** generate portrait at 1024×1536 (or the tool's closest portrait size), then crop to **4:5** around the product → **1024×1280**. Don't upscale.
4. **Thumbnails:** for every photo in sets B and C, make a **256×256** square crop centred on the product → `*-thumb.webp`.
5. **Export WebP** (quality about 82; keep alpha for set A). Budgets: main photos ≤ 150 KB, thumbs ≤ 20 KB, flat labels ≤ 60 KB. Use any local tool: sharp (`npx sharp-cli`), Pillow, ImageMagick or `cwebp`.
6. **QA every image:** "YOUR BRAND" is spelled exactly; no garbled or extra text; no real brands; label faces the camera; same light and angle as the rest of the series; nothing cut off at the edges.
7. Record the final prompt used for each image in `reference/IMAGES.md` (file name → prompt), so it can be regenerated later.

### A.3 Set A: flat label artworks (transparent, 7 images)

Folder: `public/products/labels/`. These are used by the configurator's "Your label" preview, the hero sticker table (4 of them), and as references for the photos.

Paste this **FLAT block** at the start of each prompt:

> Flat graphic design of a single printed product label, seen perfectly straight-on with no perspective, no curvature, no shadow, isolated on a transparent background. Subtle real paper or film texture. Professional packaging design, print-ready, crisp vector-like type. Only the text specified, spelled exactly.

| # | File | Aspect (w:h) | Prompt after the FLAT block |
|---|---|---|---|
| A1 | `jam.webp` | about 1.8:1 landscape | A rectangular cream paper jam-jar label with softly rounded corners and a thin red double border. Centre: "YOUR BRAND" in a bold, warm red serif. Under it, small spaced red capitals: "STRAWBERRY JAM". A tiny red strawberry illustration above the wordmark. |
| A2 | `kombucha.webp` | about 1.55:1 landscape | The front panel of a deep teal wrap-around bottle label with cream wavy lines across the top and bottom and a small coral half-sun. Centre: "YOUR BRAND" in tall, condensed cream capitals. Under it, small spaced cream capitals: "SPARKLING KOMBUCHA". |
| A3 | `olive-oil.webp` | about 0.8:1 portrait | An arched-top (rounded top, straight sides and bottom) cream textured paper olive oil label with a thin olive-green border and a small olive-branch illustration with two olives. "YOUR BRAND" in an elegant olive-green serif. Under it, small spaced capitals: "EXTRA VIRGIN OLIVE OIL". |
| A4 | `coffee.webp` | about 0.8:1 portrait | A black rectangular coffee label with cream type and a simple crescent-moon mark at the top. "YOUR BRAND" in bold, condensed cream capitals. Under it, small spaced capitals: "COLD BREW COFFEE". |
| A5 | `candle.webp` | about 1.7:1 landscape | A cream paper candle label with a thin black double rule border and a tiny black flame mark. "Your Brand" in an elegant black script. Under it, small spaced black capitals: "HAND POURED SOY CANDLE". |
| A6 | `face-oil.webp` | about 1.4:1 landscape | A sage-green textured paper cosmetics label with a delicate dark-green fern illustration. "YOUR BRAND" in a refined dark-green serif, all caps. Under it, small spaced capitals: "BOTANICAL FACE OIL". |
| A7 | `sticker.webp` | 1:1 | A die-cut vinyl sticker with a thick white cut border following its outline: a round badge, red with a yellow ring, "YOUR BRAND" in chunky cream capitals. Gloss finish. Used as the sample artwork for every sticker product. |

Trim each to its content (with a few pixels' margin) after export, and note each file's final pixel size: the code needs it.

### A.4 Set B: label products (10 photos, 4:5, 1024×1280, plus thumbs)

Folder: `public/products/`. File name = the product's slug. Each also gets `<slug>-thumb.webp`.

| # | File | Backdrop | Prompt after the STYLE block (replace `{BACKDROP}` in the STYLE block with the name and hex) | Reference | Alt text |
|---|---|---|---|---|---|
| B1 | `food-labels.webp` | warm sand #E8DCC2 | A round clear glass jam jar (straight sides, about 9 cm tall) full of deep ruby-red strawberry jam, with a brushed gold metal screw lid. The front label is the reference label, wrapped on the jar. Two fresh strawberries rest on the floor to the left of the jar. | A1 | Glass jam jar with a cream label that reads Your Brand, strawberry jam |
| B2 | `beverage-labels.webp` | pale periwinkle #DFE5FF | A 330 ml amber glass bottle of sparkling kombucha with a gold crown cap, chilled, with fine condensation droplets. The reference label wraps all the way round the middle of the bottle. | A2 | Amber bottle with a teal wrap-around label that reads Your Brand, sparkling kombucha |
| B3 | `bottle-labels.webp` | warm cream #EFE8D9 | A tall 500 ml dark green glass olive oil bottle with a black screw cap and a thin gold neck band. The reference arched label is on the front of the bottle. | A3 | Dark green olive oil bottle with an arched label that reads Your Brand |
| B4 | `coffee-labels.webp` | warm sand #E8DCC2 | A matte kraft-paper stand-up coffee pouch (250 g) with a resealable top, standing upright and gently filled. The reference label is centred on the front. A few whole roasted coffee beans lie on the floor at its base. | A4 | Kraft coffee pouch with a black label that reads Your Brand, cold brew coffee |
| B5 | `candle-labels.webp` | warm cream #EFE8D9 | A clear glass tumbler candle (about 8 cm tall) filled with creamy white soy wax, lit, with a small natural flame giving the wax a faint warm glow. The reference label is on the front of the glass. | A5 | Glass candle with a cream label that reads Your Brand, hand poured soy candle |
| B6 | `cosmetic-labels.webp` | pale periwinkle #DFE5FF | A 30 ml amber glass dropper bottle with a black ribbed collar and a black rubber bulb. The reference label is on the front. A small sprig of fern lies on the floor beside it. | A6 | Amber dropper bottle with a sage label that reads Your Brand, botanical face oil |
| B7 | `custom-labels.webp` | pale periwinkle #DFE5FF | Three labelled products standing together in a loose, staggered row: the olive oil bottle (left, tallest), the strawberry jam jar (front, centre) and the candle tumbler (right), each wearing its reference label. Same lighting; the group fills about 65% of the frame width. | A3, A1, A5 | Olive oil bottle, jam jar and candle, each with a label that reads Your Brand |
| B8 | `roll-labels.webp` | warm cream #EFE8D9 | A roll of printed product labels on a brown cardboard core, lying on its side. The glossy white liner is unrolled toward the camera across the floor, showing four identical labels (the reference jam label) evenly spaced with small gaps. Camera about 35° from above for this shot. | A1 | A roll of printed labels that read Your Brand, partly unrolled |
| B9 | `sheet-labels.webp` | warm sand #E8DCC2 | A single letter-size sheet of label stock lying flat, seen from above at a slight angle, with eight identical rounded-rectangle labels (2 columns × 4 rows, the reference candle label). The top-right label is half peeled up and curling, showing the glossy liner beneath. | A5 | A sheet of eight printed labels that read Your Brand, one peeled up |
| B10 | `circle-labels.webp` | label yellow #FFD21F | Top-down flat lay: two small kraft gift boxes and a jar lid, each sealed with a round 2-inch label. One white circle label reads "YOUR BRAND" with a second line "THANK YOU"; one black circle seal reads "YOUR BRAND"; one kraft circle seal reads "YOUR BRAND". Camera straight down for this shot. | – | Gift boxes and a jar lid sealed with round labels that read Your Brand |

### A.5 Set C: stickers and packs (9 photos, 4:5, 1024×1280, plus thumbs)

Same STYLE block, but for flat items use "camera about 30° from above" instead of "at product height". A sticker shows its **thick white die-cut border**, and one corner may be gently peeled up to show the backing.

| # | File | Backdrop | Prompt after the STYLE block | Alt text |
|---|---|---|---|---|
| C1 | `vinyl-stickers.webp` | warm cream #EFE8D9 | Two die-cut white vinyl stickers with thick white borders, slightly overlapping, gloss catching a soft highlight, the front one's corner peeled up: a round red-and-yellow badge reading "YOUR BRAND" (the reference A7) and a black rounded-rectangle sticker reading "YOUR BRAND" in yellow capitals. | Two vinyl stickers that read Your Brand |
| C2 | `clear-stickers.webp` | pale periwinkle #DFE5FF | A clear transparent vinyl sticker applied to the side of an empty clear glass bottle: only the printed ink shows ("YOUR BRAND" in bold black capitals with a thin black ring), and the glass shows through everywhere else. | A clear sticker reading Your Brand on a glass bottle |
| C3 | `holographic-stickers.webp` | charcoal #18181B | Two die-cut holographic foil stickers with rainbow iridescence shifting across their surface: a starburst and a rounded rectangle, each reading "YOUR BRAND" in bold black capitals. Light rakes across the foil to show the rainbow. | Two holographic stickers that read Your Brand |
| C4 | `glitter-stickers.webp` | charcoal #18181B | Two die-cut glitter stickers, fine pink and gold glitter film visible beneath the print, sparkling in the light: a heart and a circle, each reading "YOUR BRAND" in bold white capitals. | Two glitter stickers that read Your Brand |
| C5 | `kraft-stickers.webp` | warm sand #E8DCC2 | Round natural brown kraft paper stickers (matte, visible paper fibres, no laminate) printed in black: "YOUR BRAND" with a second line "THANK YOU". One seals a folded sheet of white tissue paper, two lie loose beside it. | Kraft paper stickers that read Your Brand, thank you |
| C6 | `metallic-stickers.webp` | press blue #1E3FD8 | Two round metallic stickers side by side: one brushed gold foil, one brushed silver foil, each printed in black with "YOUR BRAND", catching crisp specular highlights. | Gold and silver stickers that read Your Brand |
| C7 | `50-3in-custom-stickers.webp` | charcoal #18181B | A neat, slightly fanned stack of identical 3-inch round die-cut vinyl stickers (the reference A7 design), the top one with its corner peeled up. | A stack of round stickers that read Your Brand |
| C8 | `250-3in-vinyl-stickers.webp` | warm cream #EFE8D9 | A generous loose pile of identical 3-inch die-cut vinyl stickers (the reference A7 design) spilling out of a small kraft paper envelope. | A pile of stickers that read Your Brand spilling from an envelope |
| C9 | `sample-pack.webp` | label yellow #FFD21F | Flat lay from above: a small kraft mailer envelope with a fan of label material samples spilling out: plain, unprinted swatches of white gloss film, clear film, white paper, brown kraft paper, brushed silver foil and brushed gold foil, plus two die-cut sample stickers (one holographic, one glitter). The only text is on one small white card: "SAMPLE PACK". | A sample pack of label materials: white, clear, kraft, silver and gold |

### A.6 Set D: share image (1)

| File | Size | Prompt |
|---|---|---|
| `src/app/opengraph-image.jpg` (Next.js file convention, JPG, ≤ 250 KB) | 1200×630 (generate landscape 1536×1024, crop and resize) | STYLE block with backdrop warm cream #EFE8D9 and camera at product height: the six labelled products from set B (olive oil bottle, kombucha bottle, jam jar, coffee pouch, candle, dropper bottle) standing in one row, evenly lit, every label reading YOUR BRAND, with generous cream space above them. Use the set-A labels as references. |

Add `src/app/opengraph-image.alt.txt` containing: `Labelled jars, bottles, a candle and a coffee pouch, each with a label that reads Your Brand`.

---

## Part B: code changes

### B.1 Delete
- `src/components/product3d/` (the whole folder: `engine.ts`, `models.ts`, `labels.ts`, `Product3D.tsx`, `BrandInput.tsx`, `renders.ts`).
- `src/lib/brand.ts` (the "type your brand" store; it only existed for the 3D labels).
- `src/lib/photos.ts`, `public/labels/` (old photos with sample company names) and the old renders in `public/products/*.webp` (keep the new `public/products/labels/` and the new photos). First `grep` for every user of `@/lib/photos`, `PHOTOS`, `photoSrc`, `stickerSrc` and `STICKER_ART`, and replace them.
- `src/components/motion/apply.ts`: move its `reduced()` helper into `src/lib/scroll.ts` (export it there) and update the imports in `reveal-motion.ts`, `bulk-motion.ts`, `steps-motion.ts` and `footer-motion.ts`. Its other exports are unused.
- **Keep** `three`, `@types/three`, `src/components/hero/` and the Anton, Fraunces and Yellowtail fonts in `src/app/layout.tsx` (the hero's drawn sticker fallbacks use them).

### B.2 Product data (`src/lib/products.ts`)
- Remove `ModelKind`, the `model` field and the `Media` union. Add:
  ```ts
  export type ProductImage = {
    /** the 4:5 photo, e.g. "/products/food-labels.webp" */
    src: string;
    w: number;
    h: number;
    alt: string;
    /** 256×256 square crop, for menus, the cart and bulk packs */
    thumb: string;
    /** flat label artwork for the configurator's "Your label" preview (transparent) */
    label: { src: string; w: number; h: number };
  };
  ```
  Then give every product `image: ProductImage`, replacing `media`.
- Mapping: photo = `/products/<slug>.webp`, thumb = `/products/<slug>-thumb.webp`. Flat labels: food → `jam`, beverage → `kombucha`, bottle → `olive-oil`, coffee → `coffee`, candle → `candle`, cosmetic → `face-oil`. Custom, roll and circle → `jam`; sheet → `candle`. Every sticker product, both deals and the sample pack → `sticker`. Use each file's real pixel size.
- Set each product's `tone` to the backdrop's tone from A.1.
- The coffee product's photo is a pouch, so its tagline can stay "For tins, bags and pouches."

### B.3 Components
- **`src/components/store/ProductMedia.tsx`:** replace it with two small components.
  - `ProductPhoto({ p, sizes, priority })`: one `next/image` with `fill`, `object-fit: cover`, alt from `p.image.alt`. Not decorative; alt matters.
  - `ProductThumb({ p })`: `p.image.thumb`, 256×256, `alt=""`.
  - Remove the roll/sheet SVGs, the sticker compositions, `Applied` and the `render`/`renders` cases.
- **`ProductCard.tsx`:** one card type again. The whole card is one `Link`, and `pcard-media` holds `<ProductPhoto>`. Remove the `pcard-3d` branch, the drag hint and the `delay` prop (and stop passing `delay` in `ProductGrid.tsx` and `ProductShowcase.tsx`).
- **`ProductShowcase.tsx`:** remove `BrandInput`. Keep the title, the lede and the "All labels" link. Change the homepage lede (in `src/app/page.tsx`) to "Every label, on the product it's made for." (drop "Drag one to turn it."). Do the same on `/labels`.
- **Header, CartDrawer, BulkPacks:** `ProductThumb` now takes the product: `<ProductThumb p={p} />`.
- **`src/app/shop/[slug]/page.tsx`:** the configurator's `media` prop becomes `<ProductPhoto p={p} priority sizes="(min-width: 1024px) 50vw, 100vw" />` for every product (it's the product page's main image and likely LCP: keep `priority`).
- **`src/components/store/Configurator.tsx`:**
  - Remove `useBrandInput`, `brandOrDefault`, `labelKind`, the `liveLabel` effect, the `@/components/product3d/*` imports and `photoSrc`/`stickerSrc`.
  - The preview sample becomes `fileUrl ?? p.image.label.src`.
  - The view toggle's first button reads "Photo" for every product.
  - In `flyToCart`, select `.pdp-view:not([hidden]) img` (and the label preview's `svg`). The canvas-copy branch can go.
- **`src/components/motion/reveal-motion.ts`:** change `INNER` to `".pcard-media img, .pack-thumb, .mat-swatch"`.
- **Hero sticker table (`src/components/hero/engine/art.ts`):** the four `flatLabel(...)` entries (`tidewater`, `oldHarbor`, `sundayJam`, `wildFern`) point at the new flat labels: kombucha, olive-oil, jam and face-oil. Update each `src` to `/products/labels/<name>.webp`, set `px` to the file's real size, and keep each `w` (display width) close to now: 232, 138, 236, 168. Keep the ids (`src/components/hero/engine/layout.ts` uses them) and the drawn fallbacks.

### B.4 Styles (`src/app/store.css`)
- **Remove:** `.p3d*`, `.pcard-3d*`, `.pcard-stage`, `.pcard-hint*`, `.brand-in*`, `.media-render*`, `.media-renders`, `.applied*`, `.media-group*`, `.media-art*`, `.media-sticker*`, `.media-stickers*`, `.media-kit*`, `.show-grid .pcard-stage`, `.pdp-view .p3d`, and the "3D products" comment block.
- `.pcard-media`: `aspect-ratio: 4 / 5`, no padding, `overflow: hidden`, the tone colour as background; the image covers it. Keep the gentle hover zoom on the image (about scale 1.04, 0.6 s, `var(--ease-out)`) and the badge.
- `.pdp-stage`: `aspect-ratio: 4 / 5` on every screen size, no padding; the photo covers it. Keep the "Photo / Your label" toggle in its corner.
- Keep the blue/cream/yellow look and the rules in `CLAUDE.md` (no gradients or shadows on UI, Archivo only).

### B.5 Docs
- **`CLAUDE.md`:** remove the `product3d`, `brand.ts` and "3D products" lines and the 3D wording under Motion and Stack (`three` is now for the hero sticker table only). Add: product photography lives in `public/products/` (photos, thumbs, `labels/`), generated, prompts in `reference/IMAGES.md`.
- **`PROGRESS.md`:** add a dated entry at the top (why, what changed, what you verified).

---

## Part C: verify

1. `grep -rn "product3d\|lib/brand\|ModelKind\|Product3D\|BrandInput\|p3d\|lib/photos\|public/labels" src`: should return nothing.
2. `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build` all pass; every `/shop/<slug>` page is prerendered.
3. `pnpm dev`. Screenshot at **1440×900** and **390×844**: `/`, `/labels`, `/stickers`, `/shop`, `/business`, `/shop/food-labels`, `/shop/vinyl-stickers`, `/shop/sample-pack`, the header's Labels and Stickers menus, the cart drawer with two items, and the product page's "Your label" view. Check:
   - every image shows, fills its card and has the right alt text;
   - nothing scrolls sideways at 375 and 390;
   - no console errors;
   - the hero sticker table still works (drag a sticker; "Put them back" appears) and shows the four new "YOUR BRAND" labels.
4. Production check: `pnpm build && pnpm exec next start -p 3100`, then `npx lighthouse http://localhost:3100<path>` (mobile, the default) for `/`, `/labels` and `/shop/food-labels`. Targets: Performance ≥ 90, Accessibility 100, Best Practices ≥ 95, SEO 100, CLS < 0.05.
5. Image QA, once more across all 26 images: exact "YOUR BRAND" spelling, no garbled text, no real brands, a consistent series, files within budget.
6. Report back: what you generated (file → final size), what you changed, the Lighthouse scores, and screenshots of the homepage label section, the stickers section and one product page at both widths.

## Don'ts
- Don't touch the hero sticker table's behaviour, the cart, checkout, admin, server code or prices.
- Don't add new sections, copy or features beyond this brief.
- Don't use real brand names, real people or stock-photo watermarks in any image.
- Don't read `.env*`, push, deploy, or discard uncommitted work. Commit only if the user asks, and end any commit message with the attribution line the user's tooling gives you.
