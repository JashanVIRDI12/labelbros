# Label Bros: design direction "Sticker table" (current, from 2026-11-02)

Replaces everything before it. The industrial "Production spec" site and the earlier Pinterest sticker build were deleted on 2026-11-02 (backup: `qa/backups/pre-fresh-start-2026-11-02.tgz`). The site is being rebuilt section by section; only the hero exists so far.

## Brief
- Label Bros prints custom stickers and product labels for brands of every size (food and drink, coffee, beer, candles, cosmetics, packaging, plus business labels like warning and ID labels).
- Reference studied: stickerbros.com (black hero full of die-cut stickers, Bungee display type, yellow buttons with hard offset shadows, torn-paper edges, logo marquee, tilted product cards, holographic badges). We keep its energy (a real collage of stickers, bold type, yellow action colour) and drop its noise (several display faces, hard shadows on UI, torn paper, tilted card grids).
- Conversion goals: "Get instant pricing" (primary) and "Order a sample kit" (secondary). The first screen also says the customer can send their own artwork or have Label Bros design it, with a free proof before print.

## Idea
The hero is the table the stickers sit on. Every sticker is a real object: you can peel it, pick it up, throw it, and it slaps back down wherever you drop it. The stickers are sample customer work in different shapes and finishes, so playing with them is also the product tour (die-cut, contour cut, kraft, holographic, glitter, matte, gloss). Hovering a sticker names it and its spec.

## Tokens (`src/app/globals.css` `@theme`)
| Token | Value | Use |
|---|---|---|
| field | #1E3FD8 | press blue: the table, page ground |
| field-deep | #132A9E | pressed or shadowed blue, menu panel, reset button |
| liner | #F5F1E8 | liner cream: all type on blue (6.7:1) |
| liner-soft | #C9D1FF | secondary notes on blue (5.0:1) |
| ink | #0D0D0C | type on yellow and cream, info chip |
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
- Info chip: ink pill with the sticker's name and spec, following the pointer.

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
- The headline must be partly visible on the first frame (the rise starts at 62%, the fades at opacity 0.01), or Chrome records LCP late.
- Tailwind runs through `@tailwindcss/postcss`; the Turbopack loader stopped picking up CSS edits.
- Build stickers in small async steps (`yieldToMain`) and upload textures with `renderer.initTexture`; this took mobile TBT from 650 ms to ~60 ms.

## Avoid
Gradients on UI, glassmorphism, drop shadows on UI, pills as badges, eyebrows above headings, numbered section labels, monospace, Inter/Roboto/Space Grotesk/system fonts, generic fade-up on scroll, bento grids, invented numbers or claims (use `[[PLACEHOLDERS]]`).

## Next sections
Not designed yet. Decide each with the client, one at a time, and carry the sticker-table idea into it.
