# Label Bros v3: findings and plan (Phase 0)

2026-11-09 · branch `upgrade/cart-trust-v3` (from `880412cd`). No code changed yet. Screenshots: `qa/v3/before/`.

## What I ran

- **Live site, read-only:** status codes for 22 routes, response headers, meta tags and schema; Playwright at 1440×900 and 390×844 (home, 7 frames through the peel section, 7 inner pages at 350 ms and settled, the buy flow up to the Pay button); Lighthouse mobile on `/` and `/shop`. I stopped before Pay on the live site so no junk order lands in your database.
- **Local production build** with a throwaway database and mail catcher: a full Stripe test checkout (2-item cart, card 4242) → paid → thank-you page → cart emptied. **Passed.** Every phase re-runs this.
- Playwright MCP isn't connected in this session, so I use Playwright scripts (the CLAUDE.md fallback). The repo has no `.claude/skills` folder; I follow CLAUDE.md and the `labelbros-motion` rules.

## Route map

| Area | Routes |
|---|---|
| Marketing | `/`, `/stickers`, `/labels`, `/how-it-works`, `/business`, `/services` + 6 service pages, `/contact` |
| Buying | `/shop`, `/shop/[slug]` (20 products: 5 packs, 15 custom), `/cart`, `/quote`, `/order/thanks` |
| API | `/api/checkout` (cart → Stripe), `/api/orders` (builder → Stripe, one item), `/api/sample-kit`, `/api/messages`, `/api/stripe/webhook` |
| Admin | `/admin` + 7 views, `/admin/login`, `/admin/files/[id]` |
| **Missing (404)** | `/about`, `/privacy`, `/terms`, `/shipping`, `/refunds`, `/track`, `/sitemap.xml` |

Key code: `components/hero` (three.js sticker stage) · `components/sections` (home: peel pad, labels shelf, proof, builder, sample kit) · `components/shop` (cards, product buy box, cart drawer, cart page) · `components/site` (header, menus, footer, floating buy bar) · `server/` (db, stripe, mail, auth, security) · `lib/facts.ts` (prices) · `lib/products.ts` (catalogue) · `lib/cart.ts`.

## The audit, checked

| Claim | Verdict | Evidence |
|---|---|---|
| /about and policy pages 404, no footer links | **Confirmed** | Also `/track` (the header's account icon was meant to go there) |
| No address/phone/email, reviews, payment badges, "Printed in Canada" | **Confirmed** | `CONTACT` in `lib/site.ts` is empty, so it stays hidden |
| Competing buy paths | **Confirmed, 4 of them** | Hero "Upload your design" → home builder → `/quote` form → Stripe (one item, skips the cart). `/shop` → product → cart → Stripe. `/quote` page. Sample kit → Stripe directly |
| Cart asks name, email, phone; no shipping/tax estimate | **Confirmed** | Landing → Stripe today = 4 clicks + 3 typed fields. Stripe then asks for phone and address again |
| No material picker | **Confirmed** | Builder offers gloss / matte / holo finish only |
| Page curl covers content mid-scroll | **Confirmed** | `peel-35.png`: mid-fold, the flap hides the card's title and artwork |
| Inner-page headings clipped during reveals | **Not reproduced yet** | Clean at 1440 in the 350 ms and settled frames. I'll recheck at 390 and on scroll-triggered section titles |
| WebGL "GPU stall due to ReadPixels" | **Reproduced, headless desktop only** | Our 2D canvas reads already use `willReadFrequently`; likely headless Chrome reading the WebGL canvas back. I'll confirm in a real Chrome profile and fix if it's ours |
| No sitemap, canonicals, home OG, schema | **Confirmed** | Canonical + OG only on `/shop`, `/business`, `/services`. Home has no OG or Organization. Product pages already have Product + Offer |
| Oversized images, `sizes="64px"` on 3840w srcsets | **Half right** | `sizes="64px"` makes the browser pick the ~128w file, so that part isn't a bug. The real problem: the homepage loads **1.85 MB of full-size webp straight from `/public`** (new-burst 193 KB, jam 181 KB...) |
| /admin publicly reachable | **Already protected** | `/admin` redirects to login; login is noindex (meta + header) and disallowed in robots; scrypt password, signed 8 h cookie, rate limits |

**New findings**

- **Homepage mobile Lighthouse: Performance 73, LCP 7.5 s** (Accessibility 100, Best Practices 100, SEO 100). The LCP element is the hero paragraph, and 91% of the time is render delay. Likely cause: the 88 KB font arrives behind 1.85 MB of images. `/shop`: Performance 91, SEO 91 (robots.txt audit).
- `Permissions-Policy: payment=()` **does not block** Apple Pay or Google Pay: hosted Checkout runs on checkout.stripe.com. You switch wallets and Link on in the Stripe Dashboard. The header only matters if we embed payments on our own pages.
- Free shipping over $100 CAD is already enforced inside Stripe. Stripe Tax is already wired (`STRIPE_AUTOMATIC_TAX`) but needs your tax registrations in the dashboard.
- Still pending from before: the Sticker Bros-style header (Products ▾, Samples, For businesses, round Track-order and cart icons) and 3D card hovers. Folded into Phases 2 and 5.

## Plan

**Phase 1, trust and legal.** New `/about`, `/privacy` (PIPEDA), `/terms`, `/shipping`, `/reprints` (refund and reprint guarantee) on one text-first layout. Contact page with `[[ADDRESS]] [[PHONE]] [[EMAIL]] [[HOURS]]`. Footer gets Company and Policies columns; the cart links the policies too. Trust strip in flat sticker marks (no pills): Printed in Canada `[[CITY]]`, Stripe and card/wallet marks, Free proof, Reprint guarantee. A reviews section shows `[[REAL REVIEWS]]`. Its Review/AggregateRating schema is only emitted once real reviews are in the data file (Google penalises placeholder review markup). CASL email signup: unticked consent box; stores consent time, source and wording; every email has an unsubscribe link; signups list in admin. French pages (Bill 96) and a Quebec Law 25 privacy officer are noted as optional.

**Phase 2, one clear shop.** `/shop` = pack grid + a "Build your own" card that opens the configurator. The home builder and the custom product pages share **one Configurator component**, and its button becomes **Add to cart** (no separate `/quote` form). `/quote` redirects to the builder and keeps its options. Every "Order now" / "Upload your design" points here. Material picker beside finish: vinyl, holographic, glitter, clear (already priced in `facts.ts`); kraft shows `[[CONFIRM PRICE]]` and stays unorderable until it has a price. Live price breaks come from the existing price model: per sticker at 3 in, **26% less at 100, 51% at 250, 64% at 500, 73% at 1000** (vs 50). That's plain math, well under 100 ms. Also the new header and the `/track` page (email + order number).

**Phase 3, cart v2.** One cart, as a drawer and as `/cart`. Each line shows: artwork status (uploaded / send later, with upload from the cart), a stepper showing the next price break, and Edit (opens the builder). Free-shipping bar (CAD only). $5 sample-kit upsell (hidden once it's in the cart). Coupon field (Stripe promotion codes, checked on the server). Shipping + tax **estimate** by province: the tax table lives in `facts.ts` with a date; the shipping amount is read from the Stripe rate you set, not typed in by me. The empty state shows best sellers. Focus trap, Esc, live-announced totals. Add to cart: the product sticker flies and slaps onto the cart icon. Remove: the line peels off. The drawer is already in the page and only slides, so there's no layout shift.

**Phase 4, checkout.** The cart's Checkout button goes **straight to Stripe**. Stripe collects email, name, address and phone; the order row gets them when payment completes (the webhook already reads them). "Business name" and "Need them by" become optional Stripe fields. Also: Stripe Tax, shipping rates, wallets and Link, promotion codes. A redesigned thank-you page: order summary, the 3 steps (proof in 12–24 h → print → ship in 2–4 days), and a track link. Abandoned carts: Stripe recovery links with Stripe's consent checkbox (CASL); the stub shows them in admin, and emails stay off until you switch them on. Re-run the paid test on desktop and mobile.

**Phase 5, motion.** Peel pad: fold from a corner so title, art and price stay readable, and give each card a rest window. Heading reveals always finish. ReadPixels check. Lenis: synced with ScrollTrigger, anchor links still work, off for reduced motion. Magnetic CTAs (mouse only, small pull). Cursor-aware 3D tilt on shop cards and product art (off on touch). SplitText on section titles only (the H1 stays CSS so LCP isn't delayed). `ScrollTrigger.refresh()` after fonts and images. Easing: keep the house set (`slap`, `peel`, `expo.out`, `power2.inOut`, `power3.out`, `none` on scrubs), written up in `reference/MOTION.md`. Every moment gets a calm static version for reduced motion.

**Phase 6, SEO and performance.** `sitemap.ts`; robots fix; canonical + OG/Twitter on every page via one helper, with a generated OG image; Organization on home; richer Product/Offer (shipping, return policy). Images: sized sources (two sizes per sticker), correct `sizes`, lazy below the fold. Font: preload Archivo only, with a metric-matched fallback. Target: LCP < 2.5 s, Performance 90+. Admin: verify what's there and add login lockout if it's missing.

**Phase 7, QA.** Playwright full buy flow to Stripe test (desktop + mobile), screenshots of every page at 1440 and 390, Lighthouse mobile on key pages, an axe scan, then a strict jury critique; fix anything under 8 and re-verify.

## Decisions (my default first)

1. **Phone.** Stripe can only make phone required or off, not optional. You earlier promised to call if a design needs changes. **Keep it required in Stripe**, or make it an optional Stripe field?
2. **Pre-Stripe form.** **Remove it entirely**, or keep email only?
3. **`/quote`.** **Redirect to the builder**, or keep it for big custom quotes?
4. **Materials.** **Vinyl, holographic, glitter, clear now; kraft once it has a price**? Confirm the list.
5. **Header.** **Sticker Bros-style header in Phase 2**?
6. **Policies.** **I draft them in plain English and you have them reviewed** before launch (I'm not a lawyer).
7. **French pages.** **Skip for now.**
8. **Commits.** **One commit per phase on this branch, no push.**

## What you'll need to provide

Address · phone · email · business hours · city for "Printed in Canada" (and confirm printing happens in Canada) · carriers and delivery times by region · refund and reprint terms · story facts and team photos · real reviews · materials and kraft price · in Stripe: tax registrations (GST/HST/PST), shipping rates (CAD and USD), wallets and Link on, any promotion codes · final logo.
