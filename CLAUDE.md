# Label Bros homepage

Marketing homepage for Label Bros, a printer of custom stickers and product labels. Goal: a premium, Awwwards-level interactive homepage that gets visitors to "Get instant pricing" or "Order a sample kit", and makes clear that customers can send their own artwork or have Label Bros design it (free proof before print). **The design direction is `reference/DESIGN-DIRECTION.md` ("Sticker table", 2026-11-02).** Everything earlier was deleted on 2026-11-02; the old builds are only in `qa/backups/`.

The site is being redesigned section by section. Built so far: header, hero, products (peel-off pad), labels (shelf), how it works (proof), pricing (quote builder), sample kit, footer. Don't add sections the client hasn't asked for.

## Stack
- Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4 through `@tailwindcss/postcss` (tokens in `src/app/globals.css` `@theme`).
- GSAP 3.15 + `@gsap/react` from public npm (all plugins free). Register plugins and eases once in `src/lib/gsap.ts`.
- three r187, used directly (named imports) for the hero sticker stage. @react-three/fiber, drei and Lenis are installed but unused so far.
- Package manager: pnpm.

## Commands
- Dev: `pnpm dev` (http://localhost:3000)
- Typecheck: `pnpm tsc --noEmit` (a Stop hook also runs it)
- Lint: `pnpm lint` · Build: `pnpm build` · Prod preview: `pnpm exec next start -p 3100`
- Lighthouse: `npx lighthouse http://localhost:3100 --preset=desktop --view` (and without the preset for mobile)

## Look (details in the direction doc)
- Press blue field (#1E3FD8), liner cream type (#F5F1E8), label yellow (#FFD21F) as the one action colour. Archivo is the only UI font; the H1 is 900 weight, 112% width, uppercase.
- The stickers carry all other colour. Sticker artwork (`src/components/hero/engine/art.ts`) may use any colour and its own faces; the UI may not.
- Buttons are flat stickers whose corner peels on hover. Shadows only on stickers.
- Avoid: gradients, glassmorphism or drop shadows on UI; pill badges; eyebrows; numbered labels; monospace; Inter/Roboto/Space Grotesk/system fonts; italic accent words; generic fade-up on scroll; bento grids.

## Motion and engineering
- Eases: `slap` (lands, no overshoot), `peel`, `expo.out` reveals, `power2.inOut` travels, `power3.out` throws, `none` on scrubs. Full rules in the `labelbros-motion` skill.
- The sticker stage is lazy-loaded after first paint, renders only while something moves, splits heavy work into tasks under 50ms, and cleans up on unmount.
- LCP is the H1 or paragraph, never the canvas: CSS reveals start partly visible.
- Every interactive object is keyboard-operable; reduced motion removes intros and throws but keeps dragging.

## Quality bar
- Awwwards SOTD level, but conversion-first: every animation explains the product or leads to the CTA.
- Lighthouse mobile: Perf ≥ 90, A11y 100, Best Practices ≥ 95, SEO 100. LCP < 2.5s, CLS < 0.05, INP < 200ms. 60fps on a recent laptop.
- WCAG 2.2 AA: one H1, real buttons and links, visible focus, contrast ≥ 4.5:1 for text.
- Breakpoints to check: 375×667, 390, 768, 1280, 1440, 1920.

## Verify loop (every section)
1. Run the dev server and screenshot 1440×900 and 390×844 (Playwright MCP, or a Playwright script if the MCP browser is busy). For interactive moments also capture hover, grab, hold, throw and landed frames.
2. Compare against `reference/DESIGN-DIRECTION.md`, then ask the `design-reviewer` subagent for an independent pass.
3. Fix, re-screenshot, and only then move on. Report what you ran and show the screenshots.

## Content
Real copy, pricing, reviews and the logo are placeholders. Never invent real-looking numbers or claims; mark unknowns as visible `[[PLACEHOLDERS]]`. The sticker brands (Fire Escape, Night Shift, Beeline...) are sample artwork, not customers.

## Safety
Don't push, deploy, or delete files outside this folder without asking. Never read `.env*`.
