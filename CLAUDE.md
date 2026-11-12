# Label Bros shop

An online shop for Label Bros, a printer of custom **product labels first** (food, drinks, bottles, coffee, candles, cosmetics; on rolls or sheets) and stickers second, aimed at **businesses**. Since the client's brief of 2026-11-11 it is a shopping site, not a showcase: pick a label, type the size in inches, pick a material and quantity (bulk from 500 to 100,000), upload artwork / "Design it for me" / "Send it later", and buy (card through Stripe, or pay by invoice for business orders over $500). Every file is checked by hand and proofed before print. The homepage keeps the original hero, the WebGL "sticker table" of labels and stickers you can peel, drag and throw (`src/components/hero/`, restored at the client's request on 2026-11-11, now with the shop's product labels on it). The rest of the earlier showcase (peel pad, shelf, sticker sheet, label web, service pages) was removed on 2026-11-11; it is in git history and `reference/DESIGN-DIRECTION.md` describes it.

Where things live:
- Catalogue `src/lib/products.ts`, choices `src/lib/options.ts`, **price formula `src/lib/pricing.ts`** (Sticker Bros' fitted curve), facts and money `src/lib/facts.ts`.
- Pages: `/` (home), `/labels`, `/stickers`, `/shop`, `/shop/[slug]` (product + configurator), `/business` (bulk + invoice + quote form), `/how-it-works`, `/cart`, `/order/thanks`, `/order/requested` (invoice), `/proof/[token]` (customer approves a proof), `/track`, `/contact`, `/about` and the policy pages (on the blue `zone-field`).
- Homepage, top to bottom: hero (sticker table), quick price, tape marquee, "Labels for your product" (photo cards), "Or shop by format" (`home/FormatCards`), "Printed on the right stuff" (`fx/MaterialLab` + `fx/material-sticker.ts`, a 3D sticker on its backing), bulk slider, order steps (`home/ProcessSteps`), "Stickers, by material" (`home/StickerCards`), trust strip, reviews (`lib/reviews.ts`: real ones in REVIEWS; marked SAMPLE_REVIEWS stand in until then), FAQ (`home/FaqBoard`, an answer board).
- Components: `src/components/store/` (configurator, `PdpStage` with the 3D label, preview, cards, cart, quick price, bulk packs, quote form, `ProductShowcase`), `src/components/fx/` (WebGL and GSAP pieces), `src/components/home/`, `src/components/site/` (header, menus, footer, shared bits), GSAP in `src/components/motion/` (loaded lazily by `site/Motion.tsx`).
- Current product photographs and thumbnails live in `public/products/realistic/`, with shapes and proportions matched to product defaults. The earlier photographs and transparent `labels/` artwork remain in `public/products/`. Prompts and dimensions are linked from `reference/IMAGES.md`. Product images are defined in `src/lib/products.ts`.
- Stickers are sold by material (vinyl, clear, holographic, glitter, kraft, silver & gold), shape is a choice inside each.
- Ordering guide: `home/StepStack.tsx` now renders an interactive print desk on product pages and How it works, with four keyboard-accessible stages, SVG artwork and CSS motion. Route styles are in `app/order-process.css`; design references and checks are in `reference/ORDER-PROCESS-DESIGN.md`. The homepage uses its own step track, `home/ProcessSteps.tsx` (2026-11-12).
- Back office `/admin`: orders board (invoice requests, check artwork, proof sent, approved, printing, shipped), proof upload with a private customer link, Stripe invoices, notes, history. Server code in `src/server/`; database tables in `src/server/schema.ts`.

Don't add sections the client hasn't asked for.

## Stack
- Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4 through `@tailwindcss/postcss` (tokens in `src/app/globals.css` `@theme`).
- GSAP 3.15 + `@gsap/react` from public npm (all plugins free). Register plugins and eases once in `src/lib/gsap.ts`.
- three r187, used directly (named imports), for the hero's sticker table (loaded after first paint) and the product page's 3D label (`fx/label-3d.ts`).
- Postgres (postgres.js), Stripe Checkout and Invoicing, SMTP mail (nodemailer). Setup in `reference/BACKEND.md`.
- Package manager: pnpm.

## Commands
- Dev: `pnpm dev` (http://localhost:3000)
- Typecheck: `pnpm tsc --noEmit` (a Stop hook also runs it)
- Lint: `pnpm lint` · Build: `pnpm build` · Prod preview: `pnpm exec next start -p 3100`
- Lighthouse: `npx lighthouse http://localhost:3100 --preset=desktop --view` (and without the preset for mobile)

## Look
- The original Label Bros look, kept at the client's request (2026-11-11): the press-blue field (#1E3FD8) with liner-cream type (#F5F1E8), label yellow (#FFD21F) as the one action colour and for selected options. Cards, forms, the cart drawer, the menu panel and the quantity table are cream "sheets" with ink type. Colours go through roles in `store.css` (`--fg`, `--fg-soft`, `--rule`, `--focus`), which the sheets switch to ink. Archivo is the only UI font; display type is 900 weight, 112% width, uppercase (`.display`).
- Product photos and label/sticker artwork carry all other colour; the UI may not. Material swatches may show the material (clear checker, kraft, silver).
- Buttons are flat labels whose corner peels on hover. Shadows only on objects (products, labels, stickers), never on UI.
- Avoid: gradients, glassmorphism or drop shadows on UI; pill badges; eyebrows; numbered labels; monospace; Inter/Roboto/Space Grotesk/system fonts; italic accent words; generic fade-up on scroll; bento grids.

## Motion and engineering
- Eases: `slap` (lands, no overshoot), `peel`, `expo.out` reveals, `power2.inOut` travels, `power3.out` throws, `none` on scrubs. Full rules in the `labelbros-motion` skill.
- The hero's sticker table: layouts per screen in `hero/engine/layout.ts` (desktop, laptop, mobile), spaced apart by `spread()` in `stage.ts` so pieces never pile up; it renders only while something moves and cleans up on unmount.
- Signature motion: headings rise line by line out of SplitText masks and cards are uncovered from the bottom up (`motion/reveal-motion.ts`); the bulk chart scrubs with scroll, the order steps ("From your idea to your shelf", `home/ProcessSteps.tsx`) run down a cut line that fills as you scroll, add-to-cart flies the preview into the cart, the label preview morphs to every size. Motion modules load when their section nears the screen.
- LCP is the H1 or paragraph: paragraphs paint still; the H1 rises in CSS from partly visible. Reveals are transform-only (text never sits at low opacity, so contrast checks hold).
- Every control is keyboard-operable; reduced motion shows everything in its final state.

## Quality bar
- Awwwards SOTD level, but conversion-first: every animation explains the product or leads to the CTA.
- Lighthouse mobile: Perf ≥ 90, A11y 100, Best Practices ≥ 95, SEO 100. LCP < 2.5s, CLS < 0.05, INP < 200ms. 60fps on a recent laptop.
- WCAG 2.2 AA: one H1, real buttons and links, visible focus, contrast ≥ 4.5:1 for text.
- Breakpoints to check: 375×667, 390, 768, 1280, 1440, 1920.

## Verify loop (every section)
1. Run the dev server and screenshot 1440×900 and 390×844 (Playwright MCP, or a Playwright script if the MCP browser is busy). For interactive moments also capture hover, grab, hold, throw and landed frames.
2. Compare against this file's Look and Motion rules, then ask for an independent design pass if a reviewer is available.
3. Fix, re-screenshot, and only then move on. Report what you ran and show the screenshots.

## Content
Prices follow Sticker Bros (stickerbros.com) at the client's request (2026-11-04, 2026-11-11): one formula in `src/lib/pricing.ts` fitted to their listed prices, kept in USD and shown in CAD for Canada (`CAD_PER_USD`); service facts (turnaround, shipping, files, reprints) in `src/lib/facts.ts`, in our own words. Material factors for paper, kraft, clear and silver are not yet confirmed by Label Bros (see pricing.ts). Reviews and the logo are still placeholders. Beyond those facts, never invent real-looking numbers or claims; mark unknowns as visible `[[PLACEHOLDERS]]` (the `Ph` helper shows them). Every generated sample product label reads "YOUR BRAND" ("Your Brand" in the candle script). The hero also keeps its original drawn sticker artwork; those designs are samples, not customers.

## Safety
Don't push, deploy, or delete files outside this folder without asking. Never read `.env*`.
