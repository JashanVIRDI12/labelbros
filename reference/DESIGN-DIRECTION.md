# Label Bros: design direction "Sticker table" (current, from 2026-11-02)

Replaces everything before it. The industrial "Production spec" site and the earlier Pinterest sticker build were deleted on 2026-11-02 (backup: `qa/backups/pre-fresh-start-2026-11-02.tgz`). The site is being rebuilt section by section; the hero and the five sections below it exist (see the end of this doc).

## Brief
- Label Bros prints custom stickers and product labels for brands of every size (food and drink, coffee, beer, candles, cosmetics, packaging, plus business labels like warning and ID labels).
- Reference studied: stickerbros.com (black hero full of die-cut stickers, Bungee display type, yellow buttons with hard offset shadows, torn-paper edges, logo marquee, tilted product cards, holographic badges). We keep its energy (a real collage of stickers, bold type, yellow action colour) and drop its noise (several display faces, hard shadows on UI, torn paper, tilted card grids).
- Conversion goals: "Get instant pricing" (primary) and "Order a sample kit" (secondary). The first screen also says the customer can send their own artwork or have Label Bros design it, with a free proof before print.

## Idea
The hero is the table the stickers sit on. Every sticker is a real object: you can peel it, pick it up, throw it, and it slaps back down wherever you drop it. The stickers are sample customer work in different shapes and finishes, so playing with them is also the product tour (die-cut, contour cut, kraft, holographic, glitter, matte, gloss).

## Tokens (`src/app/globals.css` `@theme`)
| Token | Value | Use |
|---|---|---|
| field | #1E3FD8 | press blue: the table, page ground |
| field-deep | #132A9E | pressed or shadowed blue, menu panel, reset button |
| liner | #F5F1E8 | liner cream: all type on blue (6.7:1) |
| liner-soft | #C9D1FF | secondary notes on blue (5.0:1) |
| ink | #0D0D0C | type on yellow and cream |
| signal | #FFD21F | label yellow: the one action colour, focus ring |
| backing | #EBE6DA | the paper back of a peeled sticker (button fold, shader) |

- Customer sticker artwork (`src/components/hero/engine/art.ts`) may use any colour and its own faces (Anton, Fraunces, Yellowtail, Archivo at other widths). The site UI may not.
- Shadows exist only on stickers, because they are physical objects. UI elements have none.

## Type
- Archivo variable (wght 100–900, wdth 62–125) for everything in the UI, via `next/font`.
- H1: 900 weight, `font-stretch: 112%`, uppercase, leading 0.84, tracking −0.035em, `clamp(3.4rem, min(9.6vw, 17.5svh), 10.5rem)`. Phones: `min(13.2vw, 8.6svh)` at 100% width, three lines.
- Body 16–18px at weight 400, leading 1.45. Notes 14px in liner-soft.
- No tracked uppercase labels, no monospace, no italic accent words.

## Components
- Buttons are flat stickers: 8px corners (2px at bottom right), yellow (primary) or cream (secondary), 58px tall. On hover the bottom-right corner peels back to show the cream paper back (`--peel` / `--peel-s` registered properties).
- Logo: "Label Bros" wordmark as a yellow die-cut sticker with a 3px cream cut border, tilted −4°; straightens on hover.
- Header: logo, four plain links (Stickers, Labels, Sample kit, How it works), Sign in, "Get instant pricing". Phones: logo, "Pricing", menu button with a full-screen blue panel.

## Hero (built)
- Layout: the sticker collage fills the band between the header and the headline; the headline sits bottom-left at poster scale; the paragraph, both CTAs and the sticker hint/reset share the bottom row. On desktop three stickers sit beside the headline's short first line and to the right of "STICK.".
- Stickers start clear of all text automatically: the stage measures every `[data-keepout]` element and nudges start positions up. Positions are fractions of the band, so they adapt to any screen.
- Signature moment: **peel, carry, throw, slap**.
  - Hover: the edge nearest the pointer lifts a little and follows the cursor around the outline.
  - Press: the edge peels (curl shader), the sticker lifts toward the camera with a soft, wide shadow.
  - Drag: sways and tilts with velocity; holographic foil and gloss sheen shift with the light.
  - Release: a fast release throws it (stays inside the table, below the header) with spin; it then slaps down: fast in, firm stop, slight squash, no bounce.
  - Intro: stickers slap onto the table one after another, corners still curling as they settle; then the Label Bros sticker lifts a corner once to show that they peel.
- Controls: "Put them back" appears once anything moved. Keyboard: every sticker has a focusable stand-in (arrow keys move, Shift moves further, Enter turns it). Reduced motion: no intro, no tease, no throws; dragging still works.

## Engine (`src/components/hero/engine/`)
- `art.ts`: the sticker designs, drawn with Canvas 2D; a white die-cut border grown from each silhouette; a hit mask.
- `stage.ts`: one vanilla three.js renderer per hero, perspective camera mapped 1:1 to CSS px, a peel `ShaderMaterial` per sticker plus a blurred-silhouette shadow. Renders only while something moves. Lazy-loaded after first paint; builds only the stickers the current layout needs, one short task at a time.
- `shaders.ts`: curl-around-a-cylinder peel, paper back, holo foil, glitter, gloss sheen, fold shade; shadow blur via mip levels.
- `layout.ts`: desktop and phone placements.

## Rules learned
- Sticker fonts load by their primary family only: next/font's "Fallback" faces point at a local Arial, which fails at once where Arial is missing (Linux, many Android phones) and used to end the wait before the real face arrived.
- Hovering a peel must tween with `overwrite: "auto"`; `true` kills the card's scroll peel too.
- Scrubbed timelines use `fromTo` with explicit starts: a refresh triggered by another section (the shelf measures itself and refreshes) must never re-read a starting value mid-scroll.
- The headline must be partly visible on the first frame (the rise starts at 62%, the fades at opacity 0.01), or Chrome records LCP late.
- Tailwind runs through `@tailwindcss/postcss`; the Turbopack loader stopped picking up CSS edits.
- Build stickers in small async steps (`yieldToMain`) and upload textures with `renderer.initTexture`; this took mobile TBT from 650 ms to ~60 ms.

## Avoid
Gradients on UI, glassmorphism, drop shadows on UI, pills as badges, eyebrows above headings, numbered section labels, monospace, Inter/Roboto/Space Grotesk/system fonts, generic fade-up on scroll, bento grids, invented numbers or claims (use `[[PLACEHOLDERS]]`).

## Sections below the hero (built 2026-11-02)
Page order: hero, products, labels, how it works, pricing, sample kit, footer. Each section's scroll motion lives in its own chunk (`src/components/sections/*-motion.ts`) and loads only when the section is within two screens (`site/Motion.tsx`), so GSAP never costs the first paint. Sample stickers are drawn into page canvases by `stickers/StickerArt.tsx` (foil hue moves with scroll).

## Artwork (from 2026-11-02, later)
- Sticker, label and product artwork is generated (Higgsfield, GPT Image 2.5, transparent backgrounds), trimmed and saved as WebP: `public/stickers/` (hero stickers, Liftoff and its sketch) and `public/labels/` (product shots and flat labels). All of it is sample work for made-up brands, not customers.
- `art.ts` designs carry an `image` (src + logical size, matched to the old sticker's area); the WebGL table and page canvases draw it. The old drawn version stays as a fallback if an image fails to load, which is the only time the sticker fonts load.
- The hero no longer shows a name/spec chip on hover; each sticker's keyboard stand-in still carries its name and spec.

- **Products, "Peel through what we print"** (`#stickers`, `#labels`). The range as a pad of five label-cards on a sticky stage. Scrolling peels the top card off from the bottom-right corner: a flat fold (`lib/peel.ts`), the paper back mirrored over with a curl shade and a shadow, then it leaves up and to the left while the next card squares up. At rest the top card's corner is lifted a little (hover lifts it more). Index list on desktop, progress bars on phones; index buttons, `#labels` and keyboard focus all jump the pad to the right card. The "Price these" link sits bottom-left so the peel never covers it, and preselects the product in the pricing builder.
- **Labels, "Labels that sell the product"** (`#labels`). A shelf of six labelled products (generated product shots of sample brands) on a pinned stage that the page scrolls sideways. As each product reaches the middle, its flat label peels out beside it with what it is printed on; the row ends on "Your product next" and "Price your labels". Products stand on one shelf line at believable relative heights (a jar is shorter than a bottle); every flat label has the same area, whatever its shape, and peeks from behind the top right of its product; each bay is as wide as its product plus label, so captions sit under their products at an even rhythm. Without scripts or with reduced motion it is a swipeable row with scroll-snap.
- **How it works, "See it before we print it"** (`#process`). One pinned screen: the steps as a rail on the left (the active one opens), a proof sheet on the right. The pencil sketch draws down the sheet, an inking edge sweeps the finished artwork across it, the cut line (traced from the artwork's real outline) is drawn round it, a cursor clicks "Approve proof" and the seal slaps on, then printed copies stack up. Sample art: "Liftoff" (`sections/liftoff.ts`).
- **Pricing, "Get your price"** (`#pricing`). The one cream (liner) band on the page, for rhythm. A real form of radio chips (product, shape, size, quantity, finish) beside a to-scale preview of the Liftoff sticker on a cutting mat (one square = one inch): the shape morphs (MorphSVG), measuring lines follow the edges, quantity stacks copies that slap on, finishes change the surface (sheen follows the pointer). The price and CTA sit under the mat and stay in view on desktop. Prices, sizes and quantities are `[[PLACEHOLDERS]]`.
- **Sample kit, "Hold them before you order"** (`#samples`). A kraft envelope: on scroll the Label Bros seal peels off, the flap opens and six samples fan out like a hand of cards. Contents, price and delivery time are placeholders.
- **Footer.** One more ask (both CTAs), the site map, and the wordmark as a giant die-cut sticker that swings into place.
- **Cream surfaces:** focus is an ink ring with a yellow halo (yellow alone is too faint on cream). Selected chips on cream are ink with cream text.
- **Reduced motion / no scripts:** the pad is a plain three-column grid of cards, the proof shows its approved state, the envelope is open, and nothing scrubs.
