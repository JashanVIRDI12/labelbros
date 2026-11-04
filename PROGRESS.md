# Progress

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
