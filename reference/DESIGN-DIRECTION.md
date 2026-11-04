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
- Header: logo, five plain links (Stickers, Labels, Business, Services, How it works), Sign in, "Get instant pricing". The current page's link carries a small yellow underline. "Sample kit" left the header on 2026-11-03 (the homepage section and the "Order a sample kit" buttons stay). Phones: logo, "Pricing", menu button with a full-screen blue panel.

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
Gradients on UI, glassmorphism, drop shadows on UI, pills as badges, eyebrows above headings, numbered section labels, monospace, Inter/Roboto/Space Grotesk/system fonts, generic fade-up on scroll, bento grids (except the `/stickers` sheet and the `/labels` web, below), invented numbers or claims (prices and service facts come from `src/lib/facts.ts`; anything else unknown is a `[[PLACEHOLDER]]`).

## Sections below the hero (built 2026-11-02)
Page order: hero, products, labels, how it works, pricing, sample kit, footer. Each section's scroll motion lives in its own chunk (`src/components/sections/*-motion.ts`) and loads only when the section is within two screens (`site/Motion.tsx`), so GSAP never costs the first paint. Sample stickers are drawn into page canvases by `stickers/StickerArt.tsx` (foil hue moves with scroll).

## Artwork (from 2026-11-02, later)
- Sticker, label and product artwork is generated (Higgsfield, GPT Image 2.5, transparent backgrounds), trimmed and saved as WebP: `public/stickers/` (hero stickers, Liftoff and its sketch), `public/labels/` (product shots and flat labels), `public/how/` (Desert Bloom, its sketch, the pencil) and `public/textures/` (kraft paper). All of it is sample work for made-up brands, not customers.
- `art.ts` designs carry an `image` (src + logical size, matched to the old sticker's area); the WebGL table and page canvases draw it. The old drawn version stays as a fallback if an image fails to load, which is the only time the sticker fonts load.
- The hero no longer shows a name/spec chip on hover; each sticker's keyboard stand-in still carries its name and spec.

- **Products, "Peel through what we print"** (`#stickers`, `#labels`). The range as a pad of five label-cards on a sticky stage. Scrolling peels the top card off from the bottom-right corner: a flat fold (`lib/peel.ts`), the paper back mirrored over with a curl shade and a shadow, then it leaves up and to the left while the next card squares up. At rest the top card's corner is lifted a little (hover lifts it more). Index list on desktop, progress bars on phones; index buttons, `#labels` and keyboard focus all jump the pad to the right card. The "Price these" link sits bottom-left so the peel never covers it, and preselects the product in the pricing builder.
- **Labels, "Labels that sell the product"** (`#labels`, rebuilt 2026-11-04). One pinned screen: six plain containers (sample brands) stand close together on one shelf that runs on past both edges, then an empty dashed spot, "Your product next", with "Price your labels". Scrolling labels them one at a time: the flat label comes down from above, in hand, turned and a little big (power3.out), and slaps onto the spot where it goes (slap), the container giving a little; a wrap-around label lands flat across the bottle, then wraps round it. Under cover of the label the bare photo turns into the labelled one, and the flat label is smoothed away left to right with a shine on the squeegee's edge. A liner-cream shelf tag swings in under the product with what it is printed on. Last, the empty spot firms up and its button slaps down. Bare photos are Higgsfield edits of the labelled ones (`public/labels/*-bare.webp`), aligned to them by outline; label spots were measured from the difference. The shelf is sized from its area (container query units), so it always fits under the heading. Phones and tablets: two shelves of three, the tag under them, the empty spot as a row (the paragraph is dropped on phones under 760px tall). Without scripts or with reduced motion: a grid of the finished products with captions, and the empty spot as a bar.
- **How it works, "See it before we print it"** (`#process`). One pinned screen: the steps as a rail on the left (the active one opens), a proof sheet on the right. The pencil sketch draws down the sheet, an inking edge sweeps the finished artwork across it, the cut line (traced from the artwork's real outline) is drawn round it, a cursor clicks "Approve proof" and the seal slaps on, then printed copies stack up. Sample art: "Liftoff" (`sections/liftoff.ts`).
- **Pricing, "Get your price"** (`#pricing`). The one cream (liner) band on the page, for rhythm. A real form of radio chips (product, shape, size, quantity, finish) beside a to-scale preview of the Liftoff sticker on a cutting mat (one square = one inch): the shape morphs (MorphSVG), measuring lines follow the edges, quantity stacks copies that slap on, finishes change the surface (sheen follows the pointer). The price and CTA sit under the mat and stay in view on desktop. Quantity has a **Custom** chip that opens a number field (10 to 100,000). **Artwork** (after the product): "Upload my design" opens a drop zone (PDF, AI, EPS, SVG, PNG, JPG, TIF or PSD); a PNG, JPG or SVG is read in the browser (nothing is sent), takes the sample's place on the mat and gets a die-cut line traced round it (`sections/artwork.ts`: the ink grown by a white border, holes filled, pieces joined, smoothed; photos get a rounded rectangle), so every shape, size and finish shows their design; other file types get a note that we check them on the proof. "Design it for me" explains custom design and links to it. Prices are in Canadian dollars ("$123.77 CAD"). The price is live: `quotePrice()` in `src/lib/facts.ts`, fitted to Sticker Bros' regular prices (falls with quantity, grows with the longest side, holographic about 13% more), shown as a total and a price each; "Continue with this quote" goes to how it works until there is a checkout.
- **Sample kit, "Hold them before you order"** (`#samples`, rebuilt 2026-11-03). A kraft mailer on the table, made of one photographed mailer (generated, `public/textures/mailer.webp`) sliced across its torn top and front so the creases run on through the tear, with the wordmark printed on it flexo-style, a thermal shipping label ("Sample kit / To: You") and our yellow sticker slapped on the label's edge. It slaps down onto the table and its yellow "Pull to open" tab tugs; scrolling pulls the tear strip across (scrubbed), the torn slit showing the mailer's printed inside (brand blue with a scatter of tiny stickers). When the strip is off, the top is torn off and tossed, and seven samples burst out of the opening one after another, up and out, and land around it (a played timeline: throws keep their timing). Once open it stays open, so a small scroll back never shoots the samples out twice; it reseals only out of sight, when the section is scrolled back below the screen. They float with the pointer at their own depths and lift on hover. Samples move only through CSS variables (`--ox/--oy/--or/--os`). Reduced motion / no scripts: already open. Facts: 15 sample stickers in 2, 3 or 4 inches, $5, ships in 2–4 business days; the button goes to the pricing builder until there is a checkout.
- **Footer.** One more ask (both CTAs), the site map, and the wordmark as a giant die-cut sticker that swings into place.
- **Cream surfaces:** focus is an ink ring with a yellow halo (yellow alone is too faint on cream). Selected chips on cream are ink with cream text.
- **Reduced motion / no scripts:** the pad is a plain three-column grid of cards, the proof shows its approved state, the envelope is open, and nothing scrubs.

## Stickers page, `/stickers` (built 2026-11-02, later)
The client asked for a stickers page built as an animated 3D GSAP bento grid that makes people want to buy. The grid is drawn in this direction's language: **a kiss-cut sticker sheet**. The backing is the sheet's liner, every cell is a sticker on it (a cut line on the liner rings each one; registration marks sit in two corners), and the cells peel at the corner like the buttons.

- **Hero.** "Stickers people keep.", the lede, both CTAs, three notes (free proof, from 10 stickers, ships in 2–4 business days). Shorter than the homepage hero so the sheet's first row shares the first screen; the H1 rises from 30% (not 62%) so it stays the LCP.
- **Order is the case for buying:** want it (Die-cut, Holo and glitter, Packaging seals, Gloss or matte), it's easy (Your art or ours, Pick your size), it's safe (Free proof first, Feel them first), do it (Price your stickers, the yellow sticker, one big link ending on an ink flat-sticker button and a price label "From $60.75").
- **Colour:** cream cells carry most of the sheet; holo and size are field-deep, seals and kit ink, price yellow, so the colour runs round the edges and the bottom row.
- **Each cell demonstrates its product:** the die-cut sticker lifts and leaves its footprint and cut line on the liner; foil hue and glare follow the pointer (and the scroll) and glitter sparkles; one "Fresh!" sticker is half matte (grain, flat light), half gloss (crisp streak) under one moving light; the Liftoff sketch inks into the finished sticker under the pointer (it rests half and half); the kraft seal closes a black mailer; the approval seal slaps onto a proof; a real range input resizes a sample on an inch mat; samples rise out of the kit envelope.
- **Links carry the choice into the builder:** `/?product=stickers&shape=…&size=…&finish=…#pricing` (`quoteHref` in `stickers-page/art.ts`; `Pricing.tsx` reads the params on load and ignores unknown values).
- **Motion** (`stickers-page/sheet-motion.ts`, loaded by `<Motion name="sheet">`):
  - Wide screens: the sheet starts lying back (CSS `rotateX(34deg)` from its top edge) and stands up as the page scrolls (scrub). Phones and tablets start flat.
  - Every cell below the fold waits lifted, tilted and shadowed, then slaps down (`slap`) as it comes in, corner still curling; seals and demos play as it lands.
  - Pointer: the cell tilts so the nearest edge lifts, its art drifts the other way, the corner peels (CSS). Touch: corners rest half peeled, press and hold (180 ms) to tilt, demos follow the scroll.
  - Reduced motion: flat, nothing waits lifted; the hands-on demos still follow the pointer.
- **Rules learned:**
  - GSAP folds CSS `translate` / `rotate` / `scale` into `transform` and then sets them to `none`. Artwork that is centred with those properties is never tweened directly: it moves through CSS variables (`--slap`, `--ink`, `--gx`, `--holo`) or plain wrappers.
  - A long sheet tilted from its top projects its far end hundreds of pixels past its own box (clipped, but its boxes overlap the footer, and accessibility audits fail on it). Only the short four-column sheet tilts, and only when the page can scroll far enough to stand it up.
  - Entry triggers are placed from layout offsets (`offsetTop`), not bounding boxes, which include the sheet's tilt.

## Custom sizes (built 2026-11-02, later)
- The pricing builder's Size field has a **Custom** option: width × height in inches (1 to 24 in). A die-cut, circle or square keeps its proportions (the height follows the width); a rectangle takes any proportion (its shape is redrawn and morphs). The mat zooms out for big sizes (its pattern scales about the centre), so a square is always an inch.
- Sizes are shared by the builder and the pages: `src/components/sheet/sizes.ts` (presets, custom range, the die-cut and rectangle proportions). Links pass `size=` for a preset or `w=` and `h=` for a custom size; the builder relinks the proportions for the shape.
- On `/stickers` the size cell shows the builder's own die-cut sticker (Liftoff) so a size picked there arrives in the builder unchanged; on `/labels` it is a plain label of any width × height.

## Labels page, `/labels` (built 2026-11-02, later)
The labels sibling of the stickers page. The bento is one web of labels on their liner, and its motion is how labels are put on: **smoothed on**. Every label still below the fold waits held by its top edge, its bottom lifted towards you with its shadow and a curled corner; as it scrolls in it is pressed down from the top, a band of light running down it like a hand smoothing it on, and it settles into its cut line on the liner. (Stickers slap down; labels are smoothed on.) Nothing stays parked on screen.

- **Tried and dropped (2026-11-02):** a roll lying across the web at the bottom of the screen, laying the labels out as the page scrolled. A full-width cylinder read as a rolling pin, not a roll of labels, and the client rejected it.
- **Hero.** "Labels that sell." (shared `PageHero`), lede, both CTAs, notes (free proof, from 25 labels, on rolls or sheets).
- **Order:** what a label does (Wraps right round, Picked up first, Any shape, Foil and finish), what it is made of and how it is checked (Paper or vinyl, Every word checked, Size it to your pack), then Feel them first and the yellow "Price your labels".
- **Signature demo:** the Tidewater wrap-around label (sized to cover the bottle photo's own printed label, 52–85% of its height, over a strip of plain glass sampled from the photo, so only one label is ever seen; wrapped, it is as wide as the glass), cut into 28 strips (`.wrap-slice`, front art and paper back), bends round the kombucha bottle in 3D as the cell scrolls through (flat, then wrapped, then turning); the pointer turns the bottle. The far side hides behind the bottle; strips darken as they turn away.
- **The others:** a jar is picked off a shelf; four labels fan out (gathered at rest on pointer screens, shown once as the roll lays the cell down); light runs over gold foil, not over the uncoated label; a swatch book of five stocks fans open; a back label's lines tick off and the approval seal slaps on ("Check every word": the customer reads the proof, Label Bros does not claim to); a real label is drawn, cropped, at any size on the inch mat. On pointer screens a note says the bottle turns; on touch, that scrolling wraps it.
- **Motion** (`labels-page/web-motion.ts`): smoothed on, each label's moment as it goes on, the wrap scrub, and the shared tilt, lift and peel. Reduced motion or no scripts: every label is on, the bottle is shown wrapped (it still turns under the pointer).
- **Shared with `/stickers`** (`src/components/sheet/`): `Cell`, `PageHero`, `Art`, `SizeMat`, `DimInput`, `sizes.ts`, `quote.ts`, and `cells.ts` (tilt, press-and-hold on touch, helpers for the demos). Cell styles (`.cell*`) are global.
- **Rules learned:** a scroll trigger that is already past fires while `gsap.context()` is still being built, so moments started from triggers go through a helper that runs them inline until the context exists.

## How it works page, `/how-it-works` (built 2026-11-03)
The order, start to finish, told by following one sticker (Liftoff, the house sample). Header "How it works" and footer "Questions" link here; the homepage's own process section stays.

- **Hero.** "From idea to your door." (shared `PageHero`), both CTAs, notes (free proof, proof in 12–24 hours, ships in 2–4 business days).
- **The sticker it follows: "Desert Bloom"** (`how-page/desert-bloom.ts`), a cactus in a terracotta pot, generated for this page (Higgsfield, GPT Image 2.5): the finished die-cut artwork, its pencil sketch generated from it and aligned to the same box, and a cut line traced from the artwork's alpha (Moore tracing, simplified, smoothed into Béziers). A generated yellow pencil lies on the mat beside the sketch. Liftoff stays the homepage's sample.
- **Follow one sticker** (`how-page/Journey.tsx`, `how-motion.ts`): one pinned, scrubbed scene. The table is a photographed self-healing cutting mat (generated, `public/how/mat.webp`) in perspective (the desk leans back 56°, the mat is turned 12°), painted into a canvas in the brand blue with its far edge and sides faded into the page, so there is no hard slab. Only the thing in hand shows: the next fades in as the camera arrives, the last fades as it leaves. No snap: the page only moves when you scroll it. Five things lie on it, built from real artwork and plain paper cards: a pencil sketch with the artwork file, the artboard with the cut line, the proof card, the printed kiss-cut sheet, the kraft mailer. For each step the camera glides to the next (power2.inOut), the last lies down and fades as the camera leaves it, and this one stands up off the mat leaning back a little (it stays on the table, with a tight contact shadow), then plays its moment: the file lands and the pencil sketch is inked into artwork (the "just an idea" route), the cut line draws (through a mask, so it stays dashed), a cursor clicks Approve and the seal slaps on, copies slap down on a kiss-cut sheet and one peels, leaving its cut line on the liner, the shipping label and the Label Bros seal go onto a photographed kraft mailer (`public/textures/mailer.webp`, real lines of type on the label).
- **The job ticket:** a cream work order with all five steps in the page; done steps tick (green), the current one opens (`aria-current="step"`), and at the end all are ticked. Its perforated tear-off stub carries both asks the whole way. On phones it shows the step in hand at a fixed height (the scene never jumps), with five progress dashes in the head; the others stay readable to assistive tech.
- **Questions, answered** (`how-page/Faq.tsx`): native `<details>` as cream labels with a small yellow toggle sticker (it turns to a cross), animated with `::details-content`; a sticky intro with both CTAs. Every answer is filled in from `src/lib/facts.ts` terms (proof changes, design billing, files, timing, shipping, reprints).
- **Reduced motion / no scripts:** no pin; the ticket fully open with no current step, and the five things in a row of equal frames, each captioned with its step.
- **Rules learned:**
  - In a timeline, only the first `fromTo` of a target may render its start at once; later ones need `immediateRender: false`, or they overwrite the starting state (every thing stood up at load).
  - A thing that turns on the mat (about its centre) and stands up (about its bottom edge) needs two layers (`.station` and `.station-face`); one layer with one transform origin drifts sideways.
- A scroll trigger keyed to a whole scene can run its moment while the object is still below the fold: key it to the object (the mailer), so the pull happens in view.
- Big image backgrounds on layers that move in 3D can become the page's LCP (a CSS background image counts; a canvas does not) and cost frames when masked: paint them into a canvas once, with any fades baked into the pixels.
- Soft shadows in a moving 3D scene are pre-blurred radial gradients, not `filter: blur()`, which repaints every frame.

## Service, services and business pages (built 2026-11-03, simplified 2026-11-04)
The client found the first version (a pinned WebGL specimen that exploded into its layers, a turning "cabinet", a scroll-fed label press) too complex, and asked for simpler pages, ready for SEO, still GSAP-worthy. Those were removed.

- **Every page reads top to bottom, all in the page as text:** breadcrumbs, one H1 that names the service ("Die-cut stickers.", "Business labels."), a plain lede, both asks, then H2 sections: what it is (two paragraphs and "Good for"), what it is made of (a cross-section, each layer drawn as a bar of its material), the finishes, where it goes, the facts panel ("Sticker Facts", set like a jar's label), how ordering works (three steps), questions, more we print. Copy and data: `src/components/service/services.ts`. Structured data: Service, and FAQ (any answer still holding a placeholder is left out); breadcrumbs too once `NEXT_PUBLIC_SITE_URL` is set (`src/lib/site.ts`).
- **The hero's product, five ways** (`service/HeroArt.tsx`): stickers slap down one after another (die-cut, holographic); a kiss-cut sheet lands and one sticker lifts off it; labels on their liner slide in (roll labels); a seal slaps onto a kraft mailer (packaging seals); a pencil sketch is inked into the finished sticker (custom design). Business labels: three labels fan out and print themselves in. Then the art follows the pointer (each piece at its own depth) and drifts as the page scrolls on.
- **Motion** (`service/page-motion.ts`, one module for all of these pages, loaded after first paint, hooked up by attributes): things slap on as they arrive (`[data-slap]`), the cross-section's bars slide in, the facts panel's rules are drawn across, a strip of yellow tape runs along the steps with the scroll, finish samples show their finish (gloss and vinyl send a light across, holographic turns its colour with the scroll and the pointer, glitter twinkles), business labels print in line by line, and pointing at a business label or a "Where it goes" sticker turns it right over (360 degrees, power3.out), its paper back showing while it faces away. Reduced motion: none of it.
- **Images:** hero art, cards and samples go through Next's image optimiser at the size they show (`Art` with `sizes`, `next/image` in the hero); CSS masks use `resized()` (`src/lib/image.ts`). The hero art starts at 1% opacity, not 0, so it counts as painted on the first frame.
- **Rules learned:**
  - A container's own properties (corner radius, background stripes, borders) are sized by the next container up, not by itself: the business labels clipped their own text with page-sized corners. The shape lives on an inner `.pl-face`.
  - A card turned in 3D shows its back by swapping front and back at 90 and 270 degrees, not with `backface-visibility` (unreliable on elements with filters).
  - An image that starts at opacity 0 and appears later becomes the largest paint late; start reveals at 0.01.

## Quote and contact pages (2026-11-04)

- **`/quote`, "Get your quote."** A short text hero (no buttons: the page is the ask), the builder on its cream band headed "Build it.", then "Send it to us." on the blue field: a cream ticket with the quote as built (it follows every change; sticky on desktop) beside the form on a cream card. Sending ends on a green "Sent" stamp that slaps on (CSS, the slap curve; none with reduced motion).
- **`/contact`, "Talk to a person."** Short text hero, a cream form card (topic chips like the builder's, name, email, message) and "Faster answers" as outlined links on blue. Contact details appear only when they exist.
- Forms: labels above fields, hints and errors under them (errors replace hints and describe the field), 50 px fields, the builder's chip corners (8 8 2 8), the ink ring with a yellow halo for focus on cream. Copy in plain words; no invented response times beyond the published proof time.
