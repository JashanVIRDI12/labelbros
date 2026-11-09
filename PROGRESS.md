# Progress

## 2026-11-09 (late): a shop, Sticker Bros style

**Why.** The client asked for e-commerce like stickerbros.com (product pages with finish, upload, notes, quantity and Add to cart; all their products at their prices in CAD), keeping the design language.

**Built.** `src/lib/products.ts`: the catalogue in one file, read by the pages, the cart and the server. Five deal packs from Sticker Bros' published deals (50 × 3 in $29 from the client's screenshot; the other four from search snapshots, to be checked against their site) and six build-your-own products priced by the builder's model. `/shop` (packs, then build your own), `/shop/[slug]` (picture left; name, price with the regular price struck, finish, size and quantity, upload or "Design it for me", notes, packs, Add to cart / Buy now; what's included, how ordering works, more products; Product structured data), a cart in the browser (lines in localStorage, artwork in IndexedDB) with a bag and count in the header and a drawer, `/cart` (lines, name, email, phone, ship-to, total, Pay) and `POST /api/checkout` (every line checked and priced on the server, one order with all lines and their files, one Stripe Checkout with a line each). Product pictures drawn from our sample stickers on house-colour cards with a "Save" burst and price tag. Home: "Shop the packs" under the hero (a yellow trust strip, the packs, build-your-own chips). Header: Shop first, the bag, "Order now" → /shop. Admin: shop orders listed item by item; emails carry every item and every file. The thank-you page empties the cart.

**Verified.** tsc, lint, build (product pages prerendered). A whole cart paid in Stripe test mode on a local database: two lines (one with an uploaded file, one "design it for me"), "Pay $204 CAD", Stripe showed both lines, the order saved as paid with both items, the file and the address; the cart emptied; the admin shows both items and the board says "2 items". Phone: no sideways scrolling.

**Added later the same night.** Embossed stickers and embossed labels (Sticker Bros: from $78.32 for 50 × 3 in → $108 CAD), glitter stickers (from $68.50), and clear, chrome, kiss-cut, bumper (long rectangles, 8–12 in), reflective and QR code stickers, whose prices are NOT yet confirmed against Sticker Bros (`priceToConfirm` in products.ts; clear priced as vinyl, chrome and reflective as foil, in facts.ts). New finishes: glitter, embossed, clear, chrome, reflective (the server accepts exactly `FINISH_IDS`). Product pictures show the material (raised, sparkle, see-through, mirror); headlines size themselves to fit. 20 products in all.

**Next.** Sticker Bros' full catalogue (their site refused automated reads): add the rest to `products.ts` once the client pastes it, and confirm whether to sell banners, magnets and signs.

## 2026-11-09 (night): sample kit off for now

**Why.** The client asked to remove the sample kit for now.

**Changed.** One switch, `SAMPLE_KIT_ON = false` in `src/lib/site.ts`. Off: the homepage section is not rendered, its checkout (`/api/sample-kit`) answers 404, the order bar has just "Upload your design", and every "Order a sample kit" second button became "We design it" (`site/SecondAsk.tsx`, opens the builder on "Design it for me"). The "Feel them first" cells on the stickers and labels pages became "We design it"; the samples FAQ is hidden; footer, contact, builder, journey and service FAQs no longer mention it. The kit's code, admin section and orders stay; set the switch to true to bring it all back.

**Verified.** tsc, lint; 11 pages scanned in the browser with no mention of the kit or links to it; the kit checkout returns 404.

## 2026-11-09 (evening): phones, built to convert

**Why.** The client found the site poor on phones and asked for it beautiful and conversion-worthy.

**Found.** Scrolling the homepage at 390 × 844: 22 screens (16,433 px), 13 of them three pinned scroll sections (peel-off pad, labels shelf, proof) where the same heading sat for 4–5 screens and the page curl covered it; no order button in reach for ~15 screens (the header doesn't stick); the builder's price below every option; tall gaps between sections everywhere.

**Built (phones under 768 px; tablets and desktops unchanged).** A sticky order bar ("Upload your design" + "Sample kit", `site/BuyBar.tsx`) that slides up after the first screen and steps aside over the builder, the order form and the footer's buttons. A live price bar in the builder (price, quantity × size, "Checkout") until the real total is on screen. Products as a swipeable row (scroll-snap, next card peeking, "Swipe for more"); the labels shelf as its still two-column grid; the proof plays by itself once in view (~6 s), steps opening as it goes. Section spacing as shared values that tighten on phones (`--sy`, `--sy-sm`, `--sy-svc`); a trust line under the hero buttons; a shorter footer; the last "Price …" links on the stickers and labels pages now say "Order …".

**Verified.** tsc, lint, build. Phone captures of home, order page, stickers, labels, business, how it works, a service page: homepage 22 → 12 screens (9,006 px), no sideways scrolling, no page errors; the swipe row snaps card to card; desktop keeps the pinned sections (products 4,266 px, labels 3,915 px, proof 3,594 px).

## 2026-11-09 (later): buy now, we design it, we call you

**Why.** The client asked for "Get instant pricing" to become buy-now wording everywhere ("upload your design and pay"), for "we design it for you" to be a clear option, and for the promise that we send a proof to approve and call if the design needs changes.

**Built.** Every "Get instant pricing" became "Upload your design" (header: "Order now"); product links now land on the builder's upload area (`quoteHref` adds `#pricing`). Builder: "Upload your design.", "Continue to checkout" / "Checkout"; choosing "Design it for me" shows how it works (tell us your idea, a designer draws it and sends a proof, we call if anything needs changing). Order page: "Upload. Pay. Done." and "Pay and we start."; phone is now required ("We call if your design needs changes"), and a design order asks for "Your idea" (checked on the server too). Links that open the builder on design say "Start your design" (`orderLabel`), e.g. the custom design page; the homepage's process section links "No design? We make it". The promise (`APPROVAL`, `CALL` in facts.ts) is in the hero, process, steps, FAQ, the thank-you page and the confirmation email. Admin: a Call button on every job, and a "We design it" flag on design jobs.

**Verified.** tsc and lint pass; in the browser at 1440 and 390 the design panel, the order form's phone and idea errors, the custom design page's "Start your design" link, and the server refusing an order without a phone or a design order without an idea.

## 2026-11-09: the back office, redesigned

**Why.** The client found the admin plain and asked for a more specialised, sectioned, world-class back office.

**Built.** A press-blue sidebar with sections (Overview; Production: Orders, Sample kits; Sales: Quotes, Business leads, Messages; Everything) and a yellow count of what is waiting in each; search in the top bar; setup progress at the foot. Overview: money this month per currency, proofs to send, in production (late jobs in red), new enquiries, the production line as labels along a roll, paid orders per day for 30 days (single series, hover tooltips, a screen-reader table), "Needs you" and an activity feed. Orders: a production board (Send proof → Proof sent → Approved → Printing → Shipped), each job a ticket with its sticker drawn in shape and finish and a tear-off "next step" button; a list view with status filters. Quotes, leads, messages and kits: lists with their own columns. A job's page: stepper with the next step one click away, the job ticket (sticker on its cutting mat, every spec), the customer's message, artwork, shop notes, customer, payment and address, history. Narrow screens: sections across the top, tiles two to a row, the line runs down. Code: `src/app/admin/ui.tsx` (shell and pieces), one folder per section, `overview()` and next-step rules in `src/server/inbox.ts`.

**Verified.** tsc, lint, build. Against a local database seeded with 36 realistic jobs: every section at 1440 × 900 and 390 × 844, one job of each kind, the board's one-click next step (Send proof 4 → 3); no console errors and no sideways scrolling at either width.

## 2026-11-08 (later): Sticker Bros prices, CAD in Canada, USD everywhere else

**Why.** The client asked for Sticker Bros' prices on everything, in CAD for Canada and USD for the US and other countries.

**Built.** Prices are now kept in US dollars (`src/lib/facts.ts`): Sticker Bros' listed prices (`LISTED_USD`) are used exactly, the fitted model fills the rest, and CAD is USD × `CAD_PER_USD`. The visitor's currency comes from their location on the first visit (proxy, Vercel/Cloudflare headers; no location: CAD) and a "Shipping to: Canada · CAD / Elsewhere · USD" switch under the builder's price; every price on the site follows it (builder, quote ticket, pay button, product cards, sticker and label pages, sample kit). Server prices, Stripe Checkout, emails and the admin use the order's currency; CAD orders ship to Canada only (free over $100 CAD), USD orders everywhere else Stripe ships (`SHIP_COUNTRIES_USD` narrows it), each with its own shipping rate.

**Verified.** tsc, lint, build. End to end on the production build: 32 checks pass (new: a USD order is saved at Sticker Bros' USD price, $89.69 for 100 × 3 in; an unknown currency falls back to CAD; US and UK visitors get USD, Canada and unknown get CAD, a visitor's own choice is kept). In the browser at 1440 and 390: switching to USD changes the builder ($123.77 CAD → $89.69 USD), the quote ticket, the pay button and the stickers page; a US visitor sees "From $60.75 USD" and "$5.00 USD for the kit"; no console errors.

**Not done.** Sticker Bros' full price table: stickerbros.com refused automated requests (HTTP 429), so only the prices already known are listed exactly (50 × 3 in $60.75, 250 × 3 in $150, 200 × 4 in $178, holographic 50 × 3 in $68.50). Add the rest to `LISTED_USD`.

## 2026-11-08: backend, payments, business enquiry form, admin

**Why.** The client asked for a backend with a payment gateway, plus a contact form on the business page with its own backend: easy to use and secure. Decisions (client, 2026-11-08): Stripe; pay at checkout, free proof after; Postgres plus an admin inbox; hosting on GoDaddy cPanel or Vercel, so nothing host-specific.

**Built.** Server code in `src/server/` (settings, Postgres via postgres.js with tables made on first use, inbox with statuses and history, Stripe Checkout, SMTP email, admin sign-in, rate limits, form checks and server-side prices). Endpoints: `/api/orders` (pay or send as a quote, artwork up to 4 MB), `/api/sample-kit`, `/api/messages` (contact and business), `/api/stripe/webhook`. `/order/thanks` after paying. `/admin`: To do / per-kind inbox, search, order page (customer, payment and shipping, details, artwork download, status, notes, history), setup checklist. The quote page's form now ends in "Pay $X and order" with "Or send it as a quote first"; the sample kit button goes to checkout; the contact form uses the backend. `/business` gets "Tell us what you label.": label kinds, volume and frequency as chips, and our sample asset tag prints the visitor's company name as they type. EmailJS removed. Security headers, robots rules, `.env*` ignored. Setup guide: `reference/BACKEND.md`; settings: `.env.example`.

**Verified.** tsc, lint and build pass (marketing pages still static). End to end against a local Postgres (PGlite) and an SMTP sink: 25 checks pass (forms saved; bad input, header injection, other-site posts, honeypot, too-fast sends and the 6th message in 10 minutes refused; quote saved with its file; the server's price kept when the browser sent $0.01; webhook signature checked, event handled once, order marked paid with its address; thank-you page shown only for the right session; admin, artwork downloads and forged cookies turned away), plus emails to the shop (artwork attached) and the paid customer, and sign-in rate limiting. Screenshots at 1440 × 900 and 390 × 844 of the business form (empty, errors, sent), quote form, cancelled checkout, thank-you page and admin (sign-in, error, inbox, order, after a status change and notes); no console errors. Not yet run against live Stripe (needs the shop's test keys).

**Next.** The shop's Neon, Stripe and SMTP settings; decide shipping under $100 and GST/HST (Stripe Tax); a test order in Stripe test mode, then live keys.

## 2026-11-05: the whole site, checked and tuned for phones

**Why.** The client asked for the whole website to be checked and made mobile-optimised.

**Checked.** Every page (home, stickers, labels, how it works, business, services and its six pages, quote, contact, 404) at 360, 375, 390 and 768 as a touch phone, scrolled top to bottom: page width, tap targets, text under 12 px, clipped text, image weight, console errors; every page screen by screen at 390 × 844 by eye; Lighthouse mobile on the production build.

**Fixed.** The yellow tape in "How ordering works" ran through the step text on phones (services hub, every service page, business): on phones each step now sits beside its icon and the tape runs down behind the icons (it also now grows downward there, not sideways). Breadcrumb links were 21 px tall: padded to 33 px. Footer links: 44 px on touch screens, and less empty space above the footer on phones. The business label artwork reads as pictures (`role="img"` with a description), so its fine print is not read as page text. Four service pages (die-cut, holographic, packaging seals, custom design) had a mobile LCP of 3.2 to 3.4 s: Chrome counts a drop-shadow's blur as part of an image's painted area (about 3× the sticker), so the hero art beat the lede as the largest paint and the score waited on an image. The art now paints once plain and invisible (no shadows until it slaps in), the intro waits for the art to load and paint at rest, only the main piece loads eagerly (preloaded, quality 62), and on phones the hero art is a little smaller per kind (collage 60%, ink 62%, seal 52%) so the lede stays the largest paint.

**Verified.** No horizontal overflow at any width; no tap targets under 24 px; no console errors. Lighthouse mobile (production): every page 100 performance (the four service pages up from 92–94, their LCP down from 3.2–3.4 s to 1.1 s; all pages 1.1 to 1.2 s), 100 accessibility, 100 best practices, 100 SEO.

## 2026-11-04 (late): a quote page and an easy contact page

**Why.** The client asked for a quote page and an easy way to contact them; they use EmailJS, and the contact details are not decided yet.

**Built.** `/quote`: a short hero, the same live builder ("Build it.", with artwork upload), then "Send it to us": a cream ticket that follows the quote as built (summary, CAD price, artwork) beside a form (name, email, optional phone, business, date, file link, notes). It sends by EmailJS, attaching the artwork when it fits `NEXT_PUBLIC_EMAILJS_ATTACHMENT_KB`, and ends on a "Sent" stamp. "Continue with this quote" on the homepage now goes there with its choices in the URL and the uploaded file carried across. `/contact`: "Talk to a person.", a short form (topic chips, name, email, message; an order number for orders; "A quote" points to the quote page) and four quicker routes; email, phone and city appear once filled in `CONTACT` (`src/lib/site.ts`). Both forms check their fields inline, catch bots with a hidden field, and say plainly when sending is not set up. "Contact" joined the menu (the dead "Sign in" link is gone from the header, menu and footer); "Get instant pricing" outside the homepage and the header button go to `/quote`. Setup: `reference/EMAILJS.md`.

**Verified.** tsc, lint and build pass (17 static routes). The homepage → quote page hand-off with an uploaded file; validation (errors shown, first field focused); the not-connected message; with placeholder keys and EmailJS intercepted, both forms send the right fields to `send-form`, a 768 KB file is attached and a 3.1 MB one only named, and the bot trap sends nothing. Screenshots at 1440 and 390, header at 768, 1024 and 1280 (fits), no overflow or console errors. Lighthouse mobile (production): `/quote` and `/contact` 100 / 100 / 100 / 100. Fixed on the way: a stale dev server cache (cleared), the carried file lost to React's dev double mount, the artwork choice sharing its name with the attachment.

## 2026-11-04 (night): Canadian dollars, and their own artwork in the builder

**Why.** The client asked for prices in Canadian dollars and for an option to upload a custom design.

**Built.** Every price is converted from Sticker Bros' US prices at one rate (`CAD_PER_USD = 1.38`, in `src/lib/facts.ts`; recent published rates ran 1.35 to 1.41) and shown as Canadian dollars: die-cut from $83.84, holographic $94.53, seals $61.80, sheets $142.00, the sample kit $6.90, 100 die-cut at 3 in $123.77 CAD. Shipping reads "Free shipping in Canada on orders over $100" everywhere (the FAQ adds the US and worldwide at extra cost). The pricing builder has an Artwork step: upload (drop zone, file chip with Replace and Remove, wrong types refused with the list of ones we print from) or "Design it for me". An uploaded PNG, JPG or SVG appears on the mat with a die-cut line traced round it, in the browser. Fixed on the way: the sample kit section widened phone pages by 2 px.

**Verified.** tsc, lint and build pass. Uploads tested at 1440 and 390: a transparent sticker (traced round its shape), separate pieces (joined into one die-cut), a photo (rounded rectangle, holographic), a PDF (no preview, note shown), a Word file (refused); shapes, keyboard focus on the drop zone, "Design it for me"; no console errors; visible text on six pages shows only CAD prices and no US wording. Lighthouse mobile (production, `/`): 99 / 100 / 100 / 100.

**Next.** A checkout that receives the file (it stays in the browser for now) and Label Bros' own CAD price list.

## 2026-11-04 (evening): the labels shelf, rebuilt

**Why.** The client did not like the homepage "Labels that sell the product" shelf (sparse, products floating far apart, labels hanging in the air, the row cut off at both edges) and asked for a revamp.

**Built.** One pinned screen with a full shelf: six bare containers close together, then an empty "Your product next" spot with "Price your labels". Each label comes down onto its container, slaps on, wraps round if it is a wrap-around, and is smoothed into the printed one with a shine; a shelf tag swings in with the stock and cut; at the end the empty spot firms up and its button slaps down. Six label-free product photos made with Higgsfield (GPT Image 2.5 edits of the labelled ones, about 12 credits with one redo), aligned to the originals by outline (within 1%). Details in `reference/DESIGN-DIRECTION.md`.

**Verified.** tsc, lint and build pass. Frames through a full label step (in hand, landing, wrap, smoothing) at 1440, the finale, and mid-run frames at 375×667, 390×844, 768×1024, 1024×768, 1280×800 and 1920×1080; reduced motion at 1440 and 390; no horizontal overflow or console errors; the button fits its spot at every width. Lighthouse mobile (production, `/`): 99 / 100 / 100 / 100, LCP 1.2 s, TBT 70 ms, CLS 0. Fixed on the way: the shelf jumped when the first tag appeared, the tag followed the scroll instead of the scrubbed playhead, the phone shelves had a double gap, and the still layout inherited the one-row desktop rules.

## 2026-11-04 (later): real prices and details, custom quantity, fixes

**Why.** The client asked for every `[[PLACEHOLDER]]` to be filled with Sticker Bros' published prices and details, for a custom quantity in the pricing builder, and for fixes to the labels page swatch book and kit and to the homepage proof on phones.

**Built.** `src/lib/facts.ts` holds every price and fact in one place: minimums (10 stickers, 25 for holographic, glitter, sheets and labels), proof in 12–24 hours, ships in 2–4 business days, next-day production, free US shipping over $100, sizes 1 to 24 in (sheets 3 × 3 up to 36 × 24 in), file types, the $5 sample kit of 15, and "from" prices. The pricing builder now shows a live price and price each (a curve fitted to Sticker Bros' regular prices: 50 × 3 in = $60.75, 250 × 3 in = $150, 200 × 4 in = $178), and its quantity has a Custom field (10 to 100,000, also read from `?qty=`). Every service page, `/business`, the how it works journey and questions, the homepage cards, process notes, sample kit and footer are filled in. Where there was nothing to say (About, Contact, address, Privacy, Terms) the link was removed; the footer's third column is now Help. Swatch book: names at the tips of a reversed fan, none clipped. Kit envelope: a real kraft mailer, smaller, clear of the copy. Homepage proof on phones: it shrinks to fit under the heading.

**Verified.** tsc, lint and build pass (15 static routes). Visible text, labels, metadata and JSON-LD of every page scanned: no `[[` left. Screenshots of the builder (price, custom quantity), kit facts, a facts panel, the questions and the footer at 1440 and 390; the proof at 353, 375, 390 and 768; no console errors.

**Next.** A checkout (order buttons go to the builder or how it works for now), real reviews and logo, and Label Bros' own price list in `facts.ts` if it differs. Four service pages still have a simulated mobile LCP of 2.9 to 3.3 s.

## 2026-11-04: simpler service and business pages, ready for SEO

**Why.** The client found the 3D concept too complex and asked for simpler pages, ready for SEO later, still GSAP-worthy; then asked for business labels that turn right over on hover, and for the labels not to be cut off.

**Built.** The WebGL specimen, the cabinet and the press are gone. Service pages, `/services` and `/business` now read top to bottom as text (breadcrumbs, one H1 naming the service, H2 sections, structured data), with one GSAP module for all of them: the hero product comes in its own way and follows the pointer, things slap on as they arrive, the cross-section and facts panel draw themselves, finish samples show their finish, business labels print in and turn a full 360 on hover (as do the "Where it goes" stickers). Fixed: business labels clipped their own text (page-sized corners); two label inks failed contrast; images downloaded at full size on phones.

**Verified.** tsc, lint and build pass. Screenshots of every page at 1440 and 390, the hero intros mid-flight, a label printing, the spin mid-turn and landed; no overflow or console errors. Lighthouse mobile (production): `/business`, `/services`, kiss-cut sheets and roll labels 100 / 100 / 100 / 100; die-cut, holographic, packaging seals and custom design 92 to 96 / 100 / 100 / 100, with a simulated LCP of 2.9 to 3.3 s (the hero sticker image is the largest paint); desktop 99 to 100 everywhere.


## 2026-11-03 (night): business labels, services, the final pass

**Why.** The client asked for a business page, service pages, "Sample kit" out of the header, and a final version: GSAP, three.js, something nobody has seen.

**Built.** `/business`: a press feeds a strip of business labels out as you scroll, each printed line by line when it clears the slot, asset tags numbered as they print. `/services` and six service pages (die-cut stickers, holographic and glitter, kiss-cut sheets, roll labels, packaging seals, custom design) from one template: a three.js specimen built from its real layers explodes into them with named callouts, goes back together and peels off its backing; finish chips change the material live; then uses, a "Sticker Facts" panel, questions and neighbours. The index is a cabinet whose specimen turns over to each service. Header: Stickers, Labels, Business, Services, How it works ("Sample kit" left the header only). Footer links to every service. A branded 404. Details in `reference/DESIGN-DIRECTION.md`.

**Verified.** tsc, lint and build pass (14 static routes). Screenshots of every service at rest, exploded and peeled at 1440 (die-cut also at 390), the hub (desktop mid-turn, phone), the press through its feed at 1440 and 390, reduced motion for all three new templates, the header at 768, 1024 and 1280; no overflow or console errors. Lighthouse (production): service pages 99 to 100 on mobile (LCP 1.1 s, TBT 60 to 90 ms, CLS 0) and 100 on desktop; `/services` and `/business` 100 / 100 / 100 / 100 on mobile and desktop. Fixed on the way: every non-peeling plane folded along a diagonal, strip labels had no width, the stuck-on button styles outranked the new sheets, the ink pass ran as one long task.

**Next.** Real facts for every `[[PLACEHOLDER]]` (materials, adhesives, numbering, sizes, quantities, turnaround, prices). The pricing builder still has no material, foil or label shapes.


## 2026-11-03 (evening): how it works surfaces, smoother motion, no double throws

**Why.** The client found the how it works background unrealistic, the envelope bad, and some animations not smooth, with things "shooting double".

**Built.** Two new Higgsfield images (about 3 credits): a photographed blue self-healing cutting mat and a photographed kraft mailer. The mat is painted into a canvas in the brand blue, its far edge and sides faded into the page (no slab); the mailer photo is the last step's envelope and the homepage kit's mailer (sliced across the tear). Double motion fixed: the homepage kit stays open once opened (it used to put the samples away on a small scroll back and throw them out again), the journey's snap is gone (it scrolled the page by itself after you stopped), and only the thing in hand is shown (the next sticker used to sit beside the current one). Smoother: pre-blurred shadows instead of live blur, the mat's fade baked into its pixels.

**Verified.** tsc, lint and build pass. Frames of every step at 1440 and 390 on the production build; the kit opened, scrolled back, scrolled down again (no second throw) and reset out of sight; no overflow or console errors at 375 or 1440. Frame timing over a full journey scroll (headless, production): 145 frames, median 16.7 ms, 10 frames over 33 ms (was 28 before the canvas). Lighthouse (production): `/how-it-works` 100 / 100 / 100 / 100 mobile and desktop (LCP is the heading, not the mat); `/` 99 / 100 / 100 / 100 mobile, 100 desktop. Fixed on the way: the dev server had gone stale and served old CSS (cache cleared).


## 2026-11-03 (later): a better sample kit, a new sticker for how it works

**Why.** The client found the sample kit envelope and its animation boring, and asked for a different sticker on the how it works page, with a pencil sketch and any images we like from Higgsfield.

**Built.** Four images from Higgsfield (GPT Image 2.5, about 6 credits): the "Desert Bloom" cactus sticker, its pencil sketch (generated from it, aligned to the same box), a yellow pencil and a kraft paper texture. The sample kit is now a kraft mailer with a printed wordmark, a shipping label and a tear strip: it slaps down, the strip is pulled across as you scroll, the top is torn off, the printed inside shows and seven samples burst out and land, then float with the pointer. How it works follows Desert Bloom (sketch inked into art, a cut line traced from its outline, the pencil on the mat). Details in `reference/DESIGN-DIRECTION.md`.

**Verified.** tsc, lint and build pass. Frames of the mailer sealed, mid-pull, bursting and open at 1440 and 390, with reduced motion (open) and landing on `#samples`; every how it works step with the new art; no overflow or console errors. Lighthouse (production): `/` 98–100 mobile, 100 desktop; `/how-it-works` 100 / 100 / 100 / 100 mobile and desktop.


## 2026-11-03: the how it works page

**Why.** The client asked for a how it works page built with the same intent as the stickers and labels pages.

**Built.** `/how-it-works`: "From idea to your door.", then "Follow one sticker", a pinned 3D scene on a cutting mat where five things (sketch and file, artboard, proof, printed sheet, mailer) each stand up and play their moment while a job ticket ticks the steps off, then "Questions, answered" (eight `<details>`, unknown answers as placeholders). Header "How it works" and footer "Questions" now link to it. Details in `reference/DESIGN-DIRECTION.md`.

**Verified.** tsc, lint and build pass (`/how-it-works` static). Frames of every step at 1440×900 and 390×844, the FAQ open with keyboard focus, reduced motion; no overflow or console errors at 375, 390, 768, 1280, 1440, 1920. Lighthouse on the production build: 100 / 100 / 100 / 100 on mobile (LCP 0.9 s) and desktop (LCP 0.2 s), CLS 0. Fixed on the way: later tweens rendered their start states at load (every thing stood up at once); standing things drifted sideways (two pivots in one transform). An independent design review raised 10 points; done: past objects fade instead of sitting under the copy, a tear-off stub with both asks on the ticket, objects stand on the table (lean, contact shadow, paper edge) and the envelope rebuilt, the sketch inks into artwork, snap to each step, a steady phone ticket with progress dashes, kiss-cut lines on the printed sheet, captioned reduced-motion frames, a clean end state, `aria-current`, FAQ links (and a pricing question), a homepage link ("See every step"). Not done: product on the desktop first screen (the scene is pinned below the hero). Lighthouse after the fixes: `/how-it-works` 100 / 100 / 100 / 100 on mobile and desktop.


## 2026-11-02 (late night, later): labels page without the roll

**Why.** The client did not like the roll lying across the bottom of the screen (it read as a rolling pin) and asked for something else.

**Built.** The roll is gone. Labels are now smoothed on: each label below the fold waits held by its top edge with its bottom lifted, and as it scrolls in it is pressed down from the top under a band of light and settles into its cut line (`labels-page/web-motion.ts`, `LabelWeb.tsx`). The bottle wrap, the other cell moments, tilt and peel are unchanged.

**Verified.** tsc, lint and build pass; frames of a label held, being pressed and on, at 1440 and 390; no overflow or console errors at 375, 768, 1280, 1440, 1920 or with reduced motion. Lighthouse on the production build, `/labels`: 100 / 100 / 100 / 100 on mobile (LCP 0.9 s) and desktop (LCP 0.2 s), CLS 0.


## 2026-11-02 (late night): custom sizes, the labels page

**Why.** The client asked for custom size options, and a labels page built the same way as the stickers page.

**Built.** Custom width × height in the pricing builder (linked for die-cut, circle and square, free for rectangles, the preview mat zooms out for big sizes) and in the stickers page's size cell (presets or custom, on the builder's own die-cut sticker), carried across by the links. `/labels`: "Labels that sell." and the labels as a roll that unrolls as the page scrolls, nine cells with a 3D wrap-around label that bends round a bottle and turns under the pointer. Header and footer link to it. Shared pieces moved to `src/components/sheet/`. Details in `reference/DESIGN-DIRECTION.md`.

**Verified.** tsc, lint and build pass (`/`, `/stickers`, `/labels` static). Screenshots of `/labels` at 375×667, 390×844, 768×1024, 1280×800, 1440×900, 1920×1080 and reduced motion; hover (bottle turned both ways, shapes, shelf, foil, swatches), keyboard (size chips, custom width × height), touch; custom sizes from both pages into the builder; no overflow, no console errors. Lighthouse on the production build: `/labels` and `/stickers` 100 / 100 / 100 / 100 on mobile and desktop (LCP 0.9 s / 0.2 s, CLS 0); `/` with a custom size preselected 100 / 100 / 100 / 100 (mobile). An independent design review raised 12 points; done: one label on the bottle (ours covers the photo's printed one, plain glass behind the gap), keyboard focus kept clear of the roll, the roll on the bottom edge (no dead band, first row readable), "Check every word" instead of a proofreading claim, gold foil glint with matching copy, shapes resting half fanned, a hint for turning the bottle, a real label in the size cell, the roll's columns matching the web's and its core dropping away at the end, the builder's size legend. Fixed on the way: scroll triggers already past at load fired before the GSAP context existed.

**Next.** Real custom size range, roll and sheet options, minimum quantities and prices (`[[PLACEHOLDERS]]`). Open from the review: the pricing builder offers only die-cut, circle, square and rectangle with gloss, matte or holographic, so it cannot yet price the label materials (paper, vinyl, kraft), gold foil or oval and arch shapes the labels page shows, and its preview is still the Liftoff sticker for labels.

## 2026-11-02 (night): the stickers page

**Why.** The client asked for a stickers page: an animated 3D GSAP bento grid that makes visitors want to buy.

**Built.** `/stickers`: a short poster hero, then the product range as one kiss-cut sticker sheet (nine cells, ordered want → easy → safe → act, ending on the yellow "Price your stickers" sticker). The sheet stands up as it scrolls (wide screens), cells slap down as they come in, tilt and peel under the pointer, and each cell demonstrates its product (lift-off footprint, foil and glitter, gloss vs matte light, sketch to ink, seals, a size slider on an inch mat, the kit). Links carry shape, size and finish into the homepage pricing builder (`Pricing.tsx` now reads them from the URL). The header's Stickers link goes to the new page and is marked as current; header and footer links are absolute (`/#labels` etc.) so they work from either page. Details in `reference/DESIGN-DIRECTION.md`.

**Verified.** tsc, lint and build pass (`/stickers` is static). Screenshots at 375×667, 390×844, 768×1024, 1024×768, 1280×800, 1440×900, 1920×1080 and reduced motion; hover, landing, keyboard (slider, price link) and touch (tap does not tilt, hold does) checks; no horizontal overflow, no cell content overflow, no console errors. An independent design review raised 14 points; the high and medium ones are done (sheet reads as a sheet at rest, links on the product cells, no tilt wobble while scrolling on phones, a visible die-cut lift, the rocket's clipped shadow, rest states that tell the story, gloss vs matte, the price sticker, seals packaging, colour balance, copy that no longer promises unconfirmed numbers). Lighthouse on the production build, `/stickers`: mobile 100 / 100 / 100 / 100 (LCP 0.9 s, the hero paragraph; TBT 30 ms; CLS 0), desktop 100 / 100 / 100 / 100 (LCP 0.2 s, the H1). Fixed on the way: a window taller than the page left the sheet tilted, and the tilted phone sheet's far end overlapped the footer for accessibility tools.

**Next.** Real file types, minimum quantity, turnaround, size range and prices (`[[PLACEHOLDERS]]`). Smaller image variants would save about 0.9 MB on phones (Lighthouse estimate; the same files serve the homepage).

## 2026-11-02 (evening): generated artwork, labels shelf, new proof section

**Why.** The client found the drawn stickers unpolished, wanted the hover info chip gone, a redesigned "See it before we print it" (no Peach Club), and more focus on labels.

**Built.** 25 pieces of artwork generated with Higgsfield (GPT Image 2.5, transparent): the 11 hero stickers, the Liftoff sticker and its pencil sketch, four product labels and six labelled product shots, all trimmed to WebP (`public/stickers`, `public/labels`, about 1.9 MB, all lazy). The sticker engine draws the images (drawn art kept as a fallback), so the hero no longer waits for sticker fonts. Info chip removed. New "Labels that sell the product" shelf (pinned sideways scroll, labels peel out beside each product); the header's Labels link goes there. "See it before we print it" rebuilt as one pinned screen (step rail plus a large proof: sketch, ink, traced cut line, cursor approves, seal, printed stack). Pricing preview now uses Liftoff with its traced outline.

**Verified.** tsc, lint and build pass; screenshots at 375, 390, 768, 1280, 1440 and 1920 plus reduced motion: no broken images, no horizontal overflow, no console errors. Fixed on the way: the proof timeline lost its starting state when another section refreshed ScrollTrigger (now all `fromTo`).

## 2026-11-02 (later): five sections below the hero

**Why.** The client asked for the next sections: card designs with strong GSAP scroll effects, plus the other sections the homepage needs, in the sticker-table language.

**Built.** Products as a peel-off pad of label-cards (`#stickers`, `#labels`); How it works as a proof that builds itself (`#process`); a to-scale pricing builder on a cream band (`#pricing`); the sample kit envelope (`#samples`); the footer with the giant wordmark sticker. Details in `reference/DESIGN-DIRECTION.md`. Fixed on the way: sticker fonts finished "loading" early where Arial is missing, and `Placement` was missing its `s` field (tsc failed).

**Verified.** tsc, lint and build pass. Screenshots at 375×667, 390×844, 768×1024, 1280×800, 1440×900, 1920×1080 at several scroll points per section, plus hover, keyboard focus, index jump, `#labels` anchor and reduced-motion runs; no horizontal overflow, no console errors. An independent design review found 14 issues; the high and medium ones are fixed (price under the fold, phone step sync, focus on cream, art overlapping copy, kit fan cut off, kit CTA order, reduced-motion grid, rhythm). Lighthouse in the cloud container (no GPU, so the hero's WebGL runs in software): hero alone 69 / TBT 8.3 s, full page 68 / TBT 8.8 s, LCP 2.4 s (hero alone 2.0 s), CLS 0, A11y / Best Practices / SEO 100. Re-run Lighthouse on a machine with a GPU for the real numbers.

**Next.** Real prices, kit contents, turnaround times and links (all `[[PLACEHOLDERS]]`). Consider lazy-loading the pricing builder's client code to win back the 0.4 s of LCP.

## 2026-11-02: fresh start, hero only

**Why.** The client asked to delete the previous site and redesign from scratch, section by section, starting with an interactive, GSAP-level sticker hero. Reference studied: stickerbros.com.

**Removed.** All of `src/`, `public/`, `tests/`, the old reference docs, PLAN/QA/README/PROGRESS, the old motion-skill files. Backup: `qa/backups/pre-fresh-start-2026-11-02.tgz`.

**Built.** New tokens and type (press blue, liner cream, label yellow; Archivo), header with mobile menu, and the hero: headline, paragraph, both CTAs, and a WebGL sticker table (11 sample stickers: peel on hover, lift and curl on grab, sway and tilt on drag, throw with spin, slap with squash; holo, glitter, kraft, matte and gloss finishes; info chip; keyboard stand-ins; reset). Direction doc: `reference/DESIGN-DIRECTION.md`.

**Tooling.** Tailwind moved from the Turbopack loader to `@tailwindcss/postcss` (the loader stopped picking up CSS edits). Favicon added.

**Verified.** tsc, lint and build pass. Screenshots at 375×667, 390×844, 768×1024, 1280×800, 1440×900, 1920×1080, plus hover, grab, hold, throw, landed, touch drag, keyboard and reduced-motion runs: no console errors. Lighthouse (prod build): mobile 98 / 100 / 100 / 100 (TBT ~60 ms, CLS 0; LCP observed at first paint, simulated 2.4 s), desktop 100 / 100 / 96→100 / 100.

**Next.** Design the next section with the client.
