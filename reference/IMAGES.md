# Generated product images

## Current storefront photos: size-matched set

The storefront now uses 19 new realistic product photographs and 19 matching thumbnails in
`public/products/realistic/`, generated on November 12, 2026 with the built-in imagegen tool.
The label shapes and proportions follow the catalog defaults. Photos are 1024 × 1280 WebP;
thumbnails are 256 × 256 WebP fitted to preserve the whole product. All use quality 82.

See the [complete prompt manifest](./product-photo-prompts-2026-11-12.json),
[file and verification report](./verification/REALISTIC-PRODUCT-PHOTOS.md) and
[contact sheet](./verification/realistic-product-photos/contact-sheet.jpg).
The earlier photos documented below and the transparent preview artwork are retained.

## Earlier photo set

Generated on 2026-11-12 with the built-in imagegen tool. These are sample packaging designs, not customer brands. Every product wordmark reads `YOUR BRAND`; the candle uses the specified `Your Brand` script. The sample pack contains only `SAMPLE PACK` on its card.

Seven transparent label artworks were generated first and used as references for the matching product photographs. The share image used a six-label reference sheet assembled from those artworks, followed by a targeted edit to keep the coffee pouch kraft. Three sticker scenes were regenerated to remove unrequested packaging props.

Exports use WebP, normally quality 82, without upscaling. Portrait photos are cropped around the product to 1024 × 1280; thumbnails are centered 256 × 256 crops. Transparent artwork is trimmed with a few pixels of margin and reduced to a maximum 720 px edge to meet its budget. The share image is a 1200 × 630 JPEG. Budgets use decimal KB, so they are stricter than KiB.

Delivery uses Next.js image optimization: product-page photos request quality 62 with preload and high fetch priority; catalogue photos use quality 75. Browsers receive AVIF when supported, with WebP as the fallback. Menu and cart thumbnails have low fetch priority. Closed menu contents are skipped until opened so their thumbnails do not compete with the main photograph. The original generated files retain the export quality recorded below.

## Final files

| File | Pixels | Bytes | Quality | Alpha |
|---|---:|---:|---:|---|
| `public/products/labels/jam.webp` | 720 × 334 | 38,232 | 82 | Yes |
| `public/products/labels/kombucha.webp` | 720 × 383 | 40,326 | 82 | Yes |
| `public/products/labels/olive-oil.webp` | 564 × 720 | 57,888 | 78 | Yes |
| `public/products/labels/coffee.webp` | 579 × 720 | 29,342 | 82 | Yes |
| `public/products/labels/candle.webp` | 720 × 384 | 32,224 | 82 | Yes |
| `public/products/labels/face-oil.webp` | 720 × 497 | 52,576 | 78 | Yes |
| `public/products/labels/sticker.webp` | 716 × 720 | 57,170 | 74 | Yes |
| `public/products/food-labels.webp` | 1024 × 1280 | 104,084 | 82 | No |
| `public/products/food-labels-thumb.webp` | 256 × 256 | 10,186 | 82 | No |
| `public/products/beverage-labels.webp` | 1024 × 1280 | 70,506 | 82 | No |
| `public/products/beverage-labels-thumb.webp` | 256 × 256 | 6,376 | 82 | No |
| `public/products/bottle-labels.webp` | 1024 × 1280 | 32,550 | 82 | No |
| `public/products/bottle-labels-thumb.webp` | 256 × 256 | 3,860 | 82 | No |
| `public/products/coffee-labels.webp` | 1024 × 1280 | 72,826 | 82 | No |
| `public/products/coffee-labels-thumb.webp` | 256 × 256 | 5,582 | 82 | No |
| `public/products/candle-labels.webp` | 1024 × 1280 | 49,512 | 82 | No |
| `public/products/candle-labels-thumb.webp` | 256 × 256 | 6,882 | 82 | No |
| `public/products/cosmetic-labels.webp` | 1024 × 1280 | 53,320 | 82 | No |
| `public/products/cosmetic-labels-thumb.webp` | 256 × 256 | 4,970 | 82 | No |
| `public/products/custom-labels.webp` | 1024 × 1280 | 71,322 | 82 | No |
| `public/products/custom-labels-thumb.webp` | 256 × 256 | 8,116 | 82 | No |
| `public/products/roll-labels.webp` | 1024 × 1280 | 82,178 | 82 | No |
| `public/products/roll-labels-thumb.webp` | 256 × 256 | 9,772 | 82 | No |
| `public/products/sheet-labels.webp` | 1024 × 1280 | 80,296 | 82 | No |
| `public/products/sheet-labels-thumb.webp` | 256 × 256 | 10,038 | 82 | No |
| `public/products/circle-labels.webp` | 1024 × 1280 | 126,114 | 82 | No |
| `public/products/circle-labels-thumb.webp` | 256 × 256 | 7,996 | 82 | No |
| `public/products/vinyl-stickers.webp` | 1024 × 1280 | 71,256 | 82 | No |
| `public/products/vinyl-stickers-thumb.webp` | 256 × 256 | 10,882 | 82 | No |
| `public/products/clear-stickers.webp` | 1024 × 1280 | 37,324 | 82 | No |
| `public/products/clear-stickers-thumb.webp` | 256 × 256 | 4,842 | 82 | No |
| `public/products/holographic-stickers.webp` | 1024 × 1280 | 51,076 | 82 | No |
| `public/products/holographic-stickers-thumb.webp` | 256 × 256 | 6,804 | 82 | No |
| `public/products/glitter-stickers.webp` | 1024 × 1280 | 95,354 | 82 | No |
| `public/products/glitter-stickers-thumb.webp` | 256 × 256 | 7,432 | 82 | No |
| `public/products/kraft-stickers.webp` | 1024 × 1280 | 71,026 | 82 | No |
| `public/products/kraft-stickers-thumb.webp` | 256 × 256 | 5,068 | 82 | No |
| `public/products/metallic-stickers.webp` | 1024 × 1280 | 64,170 | 82 | No |
| `public/products/metallic-stickers-thumb.webp` | 256 × 256 | 5,786 | 82 | No |
| `public/products/50-3in-custom-stickers.webp` | 1024 × 1280 | 69,950 | 82 | No |
| `public/products/50-3in-custom-stickers-thumb.webp` | 256 × 256 | 9,976 | 82 | No |
| `public/products/250-3in-vinyl-stickers.webp` | 1024 × 1280 | 114,278 | 82 | No |
| `public/products/250-3in-vinyl-stickers-thumb.webp` | 256 × 256 | 16,862 | 82 | No |
| `public/products/sample-pack.webp` | 1024 × 1280 | 123,950 | 82 | No |
| `public/products/sample-pack-thumb.webp` | 256 × 256 | 7,554 | 82 | No |
| `src/app/opengraph-image.jpg` | 1200 × 630 | 60,884 | 82 | No |

All 19 photos are below 150,000 bytes, all 19 thumbnails below 20,000 bytes, all seven flat labels below 60,000 bytes, and the share image below 250,000 bytes.

## Final prompts

The following are the final prompts actually submitted, including any corrective instruction. Reference names resolve to `public/products/labels/<name>.webp`; the originals were supplied before export.

### public/products/labels/jam.webp

```text
Flat graphic design of a single printed product label, seen perfectly straight-on with no perspective, no curvature, no shadow, isolated on a transparent background. Subtle real paper or film texture. Professional packaging design, print-ready, crisp vector-like type. Only the text specified, spelled exactly.
A rectangular cream paper jam-jar label with softly rounded corners and a thin red double border. Centre: "YOUR BRAND" in a bold, warm red serif. Under it, small spaced red capitals: "STRAWBERRY JAM". A tiny red strawberry illustration above the wordmark.
Aspect about 1.8:1 landscape. Render a single label with genuine alpha transparency. Use case: product-mockup. Asset: jam.webp.
```

### public/products/labels/kombucha.webp

```text
Flat graphic design of a single printed product label, seen perfectly straight-on with no perspective, no curvature, no shadow, isolated on a transparent background. Subtle real paper or film texture. Professional packaging design, print-ready, crisp vector-like type. Only the text specified, spelled exactly.
The front panel of a deep teal wrap-around bottle label with cream wavy lines across the top and bottom and a small coral half-sun. Centre: "YOUR BRAND" in tall, condensed cream capitals. Under it, small spaced cream capitals: "SPARKLING KOMBUCHA".
Aspect: about 1.55:1 landscape. Single label, genuine alpha transparency. Use case: product-mockup.
```

### public/products/labels/olive-oil.webp

```text
Flat graphic design of a single printed product label, seen perfectly straight-on with no perspective, no curvature, no shadow, isolated on a transparent background. Subtle real paper or film texture. Professional packaging design, print-ready, crisp vector-like type. Only the text specified, spelled exactly.
An arched-top (rounded top, straight sides and bottom) cream textured paper olive oil label with a thin olive-green border and a small olive-branch illustration with two olives. "YOUR BRAND" in an elegant olive-green serif. Under it, small spaced capitals: "EXTRA VIRGIN OLIVE OIL".
Aspect: about 0.8:1 portrait. Single label, genuine alpha transparency. Use case: product-mockup.
```

### public/products/labels/coffee.webp

```text
Flat graphic design of a single printed product label, seen perfectly straight-on with no perspective, no curvature, no shadow, isolated on a transparent background. Subtle real paper or film texture. Professional packaging design, print-ready, crisp vector-like type. Only the text specified, spelled exactly.
A black rectangular coffee label with cream type and a simple crescent-moon mark at the top. "YOUR BRAND" in bold, condensed cream capitals. Under it, small spaced capitals: "COLD BREW COFFEE".
Aspect: about 0.8:1 portrait. Single label, genuine alpha transparency. Use case: product-mockup.
```

### public/products/labels/candle.webp

```text
Flat graphic design of a single printed product label, seen perfectly straight-on with no perspective, no curvature, no shadow, isolated on a transparent background. Subtle real paper or film texture. Professional packaging design, print-ready, crisp vector-like type. Only the text specified, spelled exactly.
A cream paper candle label with a thin black double rule border and a tiny black flame mark. "Your Brand" in an elegant black script. Under it, small spaced black capitals: "HAND POURED SOY CANDLE".
Aspect: about 1.7:1 landscape. Single label, genuine alpha transparency. Use case: product-mockup.
```

### public/products/labels/face-oil.webp

```text
Flat graphic design of a single printed product label, seen perfectly straight-on with no perspective, no curvature, no shadow, isolated on a transparent background. Subtle real paper or film texture. Professional packaging design, print-ready, crisp vector-like type. Only the text specified, spelled exactly.
A sage-green textured paper cosmetics label with a delicate dark-green fern illustration. "YOUR BRAND" in a refined dark-green serif, all caps. Under it, small spaced capitals: "BOTANICAL FACE OIL".
Aspect: about 1.4:1 landscape. Single label, genuine alpha transparency. Use case: product-mockup.
```

### public/products/labels/sticker.webp

```text
Flat graphic design of a single printed product label, seen perfectly straight-on with no perspective, no curvature, no shadow, isolated on a transparent background. Subtle real paper or film texture. Professional packaging design, print-ready, crisp vector-like type. Only the text specified, spelled exactly.
A die-cut vinyl sticker with a thick white cut border following its outline: a round badge, red with a yellow ring, "YOUR BRAND" in chunky cream capitals. Gloss finish. Used as the sample artwork for every sticker product.
Aspect: 1:1. Single label, genuine alpha transparency. Use case: product-mockup.
```

### public/products/food-labels.webp

References: `jam`.

```text
Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in warm sand #E8DCC2 that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera at product height, slightly above (about 10° down), 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.
A round clear glass jam jar (straight sides, about 9 cm tall) full of deep ruby-red strawberry jam, with a brushed gold metal screw lid. The front label is the reference label, wrapped on the jar. Two fresh strawberries rest on the floor to the left of the jar.
Reference images: jam. Use this exact reference label design, wrapped on the product where appropriate; preserve typography, colors, symbols and exact text.
Use case: product-mockup. Portrait 1024×1536 composition, with the complete product contained in the central 1024×1280 crop. No clipping.
```

### public/products/beverage-labels.webp

References: `kombucha`.

```text
Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in pale periwinkle #DFE5FF that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera at product height, slightly above (about 10° down), 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.
A 330 ml amber glass bottle of sparkling kombucha with a gold crown cap, chilled, with fine condensation droplets. The reference label wraps all the way round the middle of the bottle.
Reference images: kombucha. Use this exact reference label design, wrapped on the product where appropriate; preserve typography, colors, symbols and exact text.
Use case: product-mockup. Portrait 1024×1536 composition, with the complete product contained in the central 1024×1280 crop. No clipping.
```

### public/products/bottle-labels.webp

References: `olive-oil`.

```text
Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in warm cream #EFE8D9 that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera at product height, slightly above (about 10° down), 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.
A tall 500 ml dark green glass olive oil bottle with a black screw cap and a thin gold neck band. The reference arched label is on the front of the bottle.
Reference images: olive-oil. Use this exact reference label design, wrapped on the product where appropriate; preserve typography, colors, symbols and exact text.
Use case: product-mockup. Portrait 1024×1536 composition, with the complete product contained in the central 1024×1280 crop. No clipping.
```

### public/products/coffee-labels.webp

References: `coffee`.

```text
Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in warm sand #E8DCC2 that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera at product height, slightly above (about 10° down), 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.
A matte kraft-paper stand-up coffee pouch (250 g) with a resealable top, standing upright and gently filled. The reference label is centred on the front. A few whole roasted coffee beans lie on the floor at its base.
Reference images: coffee. Use this exact reference label design, wrapped on the product where appropriate; preserve typography, colors, symbols and exact text.
Use case: product-mockup. Portrait 1024×1536 composition, with the complete product contained in the central 1024×1280 crop. No clipping.
```

### public/products/candle-labels.webp

References: `candle`.

```text
Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in warm cream #EFE8D9 that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera at product height, slightly above (about 10° down), 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.
A clear glass tumbler candle (about 8 cm tall) filled with creamy white soy wax, lit, with a small natural flame giving the wax a faint warm glow. The reference label is on the front of the glass.
Reference images: candle. Use this exact reference label design, wrapped on the product where appropriate; preserve typography, colors, symbols and exact text.
Use case: product-mockup. Portrait 1024×1536 composition, with the complete product contained in the central 1024×1280 crop. No clipping.
```

### public/products/cosmetic-labels.webp

References: `face-oil`.

```text
Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in pale periwinkle #DFE5FF that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera at product height, slightly above (about 10° down), 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.
A 30 ml amber glass dropper bottle with a black ribbed collar and a black rubber bulb. The reference label is on the front. A small sprig of fern lies on the floor beside it.
Reference images: face-oil. Use this exact reference label design, wrapped on the product where appropriate; preserve typography, colors, symbols and exact text.
Use case: product-mockup. Portrait 1024×1536 composition, with the complete product contained in the central 1024×1280 crop. No clipping.
```

### public/products/custom-labels.webp

References: `olive-oil`, `jam`, `candle`.

```text
Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in pale periwinkle #DFE5FF that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera at product height, slightly above (about 10° down), 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.
Three labelled products standing together in a loose, staggered row: the olive oil bottle (left, tallest), the strawberry jam jar (front, centre) and the candle tumbler (right), each wearing its reference label. Same lighting; the group fills about 65% of the frame width.
Reference images: olive-oil, jam, candle. Use this exact reference label design, wrapped on the product where appropriate; preserve typography, colors, symbols and exact text.
Use case: product-mockup. Portrait 1024×1536 composition, with the complete product contained in the central 1024×1280 crop. No clipping.
```

### public/products/roll-labels.webp

References: `jam`.

```text
Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in warm cream #EFE8D9 that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera at product height, slightly above (about 10° down), 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.
A roll of printed product labels on a brown cardboard core, lying on its side. The glossy white liner is unrolled toward the camera across the floor, showing four identical labels (the reference jam label) evenly spaced with small gaps. Camera about 35° from above for this shot.
Reference images: jam. Use this exact reference label design, wrapped on the product where appropriate; preserve typography, colors, symbols and exact text.
Use case: product-mockup. Portrait 1024×1536 composition, with the complete product contained in the central 1024×1280 crop. No clipping.
```

### public/products/sheet-labels.webp

References: `candle`.

```text
Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in warm sand #E8DCC2 that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera at product height, slightly above (about 10° down), 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.
A single letter-size sheet of label stock lying flat, seen from above at a slight angle, with eight identical rounded-rectangle labels (2 columns × 4 rows, the reference candle label). The top-right label is half peeled up and curling, showing the glossy liner beneath.
Reference images: candle. Use this exact reference label design, wrapped on the product where appropriate; preserve typography, colors, symbols and exact text.
Use case: product-mockup. Portrait 1024×1536 composition, with the complete product contained in the central 1024×1280 crop. No clipping.
```

### public/products/circle-labels.webp

```text
Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in label yellow #FFD21F that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera at product height, slightly above (about 10° down), 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.
Top-down flat lay: two small kraft gift boxes and a jar lid, each sealed with a round 2-inch label. One white circle label reads "YOUR BRAND" with a second line "THANK YOU"; one black circle seal reads "YOUR BRAND"; one kraft circle seal reads "YOUR BRAND". Camera straight down for this shot.
Use case: product-mockup. Portrait 1024×1536 composition, with the complete product contained in the central 1024×1280 crop. No clipping.
```

### public/products/vinyl-stickers.webp

References: `sticker`.

```text
Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in warm cream #EFE8D9 that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera about 30° from above, 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.
Two die-cut white vinyl stickers with thick white borders, slightly overlapping, gloss catching a soft highlight, the front one's corner peeled up: a round red-and-yellow badge reading "YOUR BRAND" (the reference A7) and a black rounded-rectangle sticker reading "YOUR BRAND" in yellow capitals.
Reference images: sticker. Use this exact reference label design, wrapped on the product where appropriate; preserve typography, colors, symbols and exact text.
Use case: product-mockup. Portrait 1024×1536 composition, with the complete product contained in the central 1024×1280 crop. No clipping.
```

### public/products/clear-stickers.webp

```text
Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in pale periwinkle #DFE5FF that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera at product height, slightly above (about 10° down), 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.
A clear transparent vinyl sticker applied to the side of an empty clear glass bottle: only the printed ink shows ("YOUR BRAND" in bold black capitals with a thin black ring), and the glass shows through everywhere else.
Use case: product-mockup. Portrait 1024×1536 composition, with the complete product contained in the central 1024×1280 crop. No clipping.
```

### public/products/holographic-stickers.webp

```text
Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in charcoal #18181B that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera about 30° from above, 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.
Two die-cut holographic foil stickers with rainbow iridescence shifting across their surface: a starburst and a rounded rectangle, each reading "YOUR BRAND" in bold black capitals. Light rakes across the foil to show the rainbow.
Use case: product-mockup. Portrait 1024×1536 composition, with the complete product contained in the central 1024×1280 crop. No clipping.
STRICT COMPOSITION CORRECTION: Exactly two LOOSE individual stickers resting directly on the seamless charcoal paper backdrop, fully visible with white die-cut borders. One starburst and one rounded rectangle. Absolutely NO jar, NO bottle, NO glass, NO food, NO sweets, NO containers and NO props. Only the two stickers and their soft contact shadows. Portrait 4:5 framing with generous clear space on all sides. Exact text on each sticker: YOUR BRAND.
```

### public/products/glitter-stickers.webp

```text
Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in charcoal #18181B that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera about 30° from above, 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.
Two die-cut glitter stickers, fine pink and gold glitter film visible beneath the print, sparkling in the light: a heart and a circle, each reading "YOUR BRAND" in bold white capitals.
Use case: product-mockup. Portrait 1024×1536 composition, with the complete product contained in the central 1024×1280 crop. No clipping.
STRICT COMPOSITION CORRECTION: Exactly two LOOSE individual stickers resting directly on the seamless charcoal paper backdrop, fully visible with white die-cut borders. One pink heart and one gold circle. Absolutely NO retail bag, NO pouch, NO plastic wrapper, NO envelope, NO packaging and NO props. Only the two stickers and their soft contact shadows. Portrait 4:5 framing with generous clear space on all sides. Exact text on each sticker: YOUR BRAND.
```

### public/products/kraft-stickers.webp

```text
Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in warm sand #E8DCC2 that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera about 30° from above, 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.
Round natural brown kraft paper stickers (matte, visible paper fibres, no laminate) printed in black: "YOUR BRAND" with a second line "THANK YOU". One seals a folded sheet of white tissue paper, two lie loose beside it.
Use case: product-mockup. Portrait 1024×1536 composition, with the complete product contained in the central 1024×1280 crop. No clipping.
```

### public/products/metallic-stickers.webp

```text
Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in press blue #1E3FD8 that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera about 30° from above, 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.
Two round metallic stickers side by side: one brushed gold foil, one brushed silver foil, each printed in black with "YOUR BRAND", catching crisp specular highlights.
Use case: product-mockup. Portrait 1024×1536 composition, with the complete product contained in the central 1024×1280 crop. No clipping.
STRICT COMPOSITION: two LOOSE round metallic stickers placed directly on the press-blue paper backdrop. One gold and one silver. Absolutely NO jar, NO glass, NO bottle, NO containers, NO props. Both stickers fully visible with breathing room. Exact text YOUR BRAND in black on each.
```

### public/products/50-3in-custom-stickers.webp

References: `sticker`.

```text
Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in charcoal #18181B that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera about 30° from above, 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.
A neat, slightly fanned stack of identical 3-inch round die-cut vinyl stickers (the reference A7 design), the top one with its corner peeled up.
Reference images: sticker. Use this exact reference label design, wrapped on the product where appropriate; preserve typography, colors, symbols and exact text.
Use case: product-mockup. Portrait 1024×1536 composition, with the complete product contained in the central 1024×1280 crop. No clipping.
```

### public/products/250-3in-vinyl-stickers.webp

References: `sticker`.

```text
Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in warm cream #EFE8D9 that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera about 30° from above, 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.
A generous loose pile of identical 3-inch die-cut vinyl stickers (the reference A7 design) spilling out of a small kraft paper envelope.
Reference images: sticker. Use this exact reference label design, wrapped on the product where appropriate; preserve typography, colors, symbols and exact text.
Use case: product-mockup. Portrait 1024×1536 composition, with the complete product contained in the central 1024×1280 crop. No clipping.
```

### public/products/sample-pack.webp

```text
Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in label yellow #FFD21F that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera about 30° from above, 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.
Flat lay from above: a small kraft mailer envelope with a fan of label material samples spilling out: plain, unprinted swatches of white gloss film, clear film, white paper, brown kraft paper, brushed silver foil and brushed gold foil, plus two die-cut sample stickers (one holographic, one glitter). The only text is on one small white card: "SAMPLE PACK".
Use case: product-mockup. Portrait 1024×1536 composition, with the complete product contained in the central 1024×1280 crop. No clipping.
All six material swatches and the holographic and glitter sample stickers are completely unprinted. The ONLY words in the scene are SAMPLE PACK on the white card. Fully contain every object with clear margins.
```

### src/app/opengraph-image.jpg

References: `jam`, `kombucha`, `olive-oil`, `coffee`, `candle`, `face-oil`.

The six references were combined into one reference sheet because the tool accepts at most five input paths. The final edit used the first generated share photograph as its edit target.

```text
Professional e-commerce product photograph for a premium online print shop, part of a consistent series. Studio shot on a seamless paper backdrop in warm cream #EFE8D9 that sweeps from floor to wall with no visible horizon line. Soft, large diffused key light from the upper left, gentle fill from the right, subtle rim light; one soft, natural contact shadow under the product. Camera at product height, slightly above (about 10° down), 85 mm lens look, deep focus so the whole product is tack sharp. The product is centered and upright, its front label facing the camera square-on, filling about 60–65% of the frame height with even space around it. Photorealistic materials: real glass refraction and reflections, real paper or film label texture with a slight sheen, crisp printed ink. Clean, minimal, calm, high-end. No people, no hands, no extra text, logos, watermarks, barcodes, price tags or brand names anywhere, except the label text specified. No props unless specified.
The six labelled products from set B (olive oil bottle, kombucha bottle, jam jar, coffee pouch, candle, dropper bottle) standing in one row, evenly lit, every label reading YOUR BRAND, with generous cream space above them. Use the set-A labels as references. The row must fit within a central 1200:630 landscape crop, nothing clipped. Landscape 1536×1024. Use case: product-mockup.
Input image is a reference sheet of six label designs, in reading order: jam, kombucha, olive oil; coffee, candle, face oil. Apply these exact six designs to their corresponding containers, one per product. The reference sheet is a design reference, not the output composition. Photograph the six actual containers in a single row. Preserve the exact label text and marks. The olive oil bottle has dark green glass and a black screw cap with a thin gold neck band. The tallest bottle should be about 55% of the landscape frame height so the central 1200:630 crop contains all six complete products and their shadows. No additional objects or text.

Final edit instruction:
Use case: precise-object-edit. Edit target: this six-product landscape photograph. Change only the coffee pouch packaging material: replace the black bag with natural matte unbleached kraft-paper packaging in warm tan. Keep the black rectangular coffee label on the pouch, with its cream crescent moon, YOUR BRAND wordmark and COLD BREW COFFEE secondary line exactly unchanged. Keep the label design, every other product, all other text, composition, light, cream background, shadows and 1200:630 landscape framing unchanged. No extra words or objects.
```
