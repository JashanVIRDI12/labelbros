# Ordering guide redesign — November 12, 2026

## Research

Reviewed the site's Archivo typography, blue/cream/yellow palette, label-shaped buttons,
product photographs, format web, material fan and homepage press run. The product-page
card stack was the component being replaced. The public How it works page used an older
four-column explainer; it now uses the same new guide.

The external review covered several component patterns rather than copying one page:

| Website and component | Design takeaway | Used here |
|---|---|---|
| [MOO: stickers by shape, format and material](https://www.moo.com/us/stickers) | Tangible print examples and concrete, scannable benefits help a shopper understand choices. | One recognizable sample label, actual material counts and readable facts. |
| [Packhelp: category switcher and primary shopping actions](https://packhelp.com/) | A clear active choice and a direct route to the product make a broad offering easier to explore. | Four visible stage tabs and an order action available at every stage. |
| [Packlane: How it works and customization guidance](https://packlane.com/) | Explain size, artwork and price in the order a buyer needs them. | Preserve the real ordering sequence and explain that the price is visible before purchase. |
| [Packwire: Custom Boxes Made Easy](https://packwire.com/) | Show the work behind each stage, including the customer's proof approval. | Distinct sizing, artwork, proof and packing scenes, with an explicit approval checkpoint. |

Browser screenshots are in `verification/order-process/references/`. MOO, Packhelp,
Packlane and Packwire were opened in the browser as well as read through web search.
StickerApp and Kraftix were read through the web tool; direct automated browser access
returned 403 responses, so those screenshots were not used for visual decisions.

## Direction

Considered the existing sticky stack, a static four-step grid, an accordion and a stage
browser. Chose a single print desk with four stages: the visitor can jump to the question
they have, while one sample label carries the visual story. It complements the homepage's
scroll-driven press run with a guide that the shopper controls directly.

- One cream sheet with a yellow active stage and a deep-blue drawing surface.
- Original SVG artwork: measurement arrows, a folded artwork file, proof crop marks,
  an approval stamp and a kraft mailer. Uses the existing Your Brand label artwork.
- The label translates and rotates between scenes; the proof stamp lands and its check
  draws in. No autoplay, pinning or scroll locking.
- Product-page actions return to the current configurator without resetting its choices.
  The standalone guide and sample-pack page lead into a custom order.
- Sticker pages use sticker size limits and material counts, rather than label values.
- Real process facts come from the existing shared catalog/facts modules. No reviews,
  delivery guarantees, urgency claims or conversion-rate statistics were invented.

The existing `StepStack` export remains compatible with callers, but its implementation is
now the print desk. The old stack animation and styles were removed. New styles load with
the two routes that use the component rather than the root layout.

## Accessibility and behavior

Four native buttons implement an ARIA tablist with selected state, linked panels and a
roving tab stop. Arrow keys, Home and End move between stages. Touch targets are at least
60 px high. The illustrations are decorative; all instructions and facts are HTML.
Reduced motion switches scenes immediately. With JavaScript disabled, the initial stage
and a readable list of the remaining stages are available, together with the order link.

## Verification

- `pnpm lint`, `pnpm exec tsc --noEmit --incremental false` and `pnpm build` pass.
- [28 page/width checks](./verification/order-process/checks.json): How it works, food
  labels, vinyl stickers and sample packs at 375, 390, 768, 1024, 1280, 1440 and 1920 px.
  Every stage, keyboard controls, Next buttons, order links and horizontal overflow pass.
  Zero browser runtime errors.
- The return action preserves a changed product size on desktop and mobile.
- Normal-motion checks confirm interpolated label movement, the proof scene and packing
  scene. No-JavaScript fallback checked in a separate browser context.
- [Production Lighthouse mobile](./verification/order-process/lighthouse-mobile.json),
  `/how-it-works`: performance 100, accessibility 100, best practices 100, SEO 100;
  LCP 1.4 s, CLS 0. These are local audit results, not measured conversion uplift.

## Review

- [Desktop: proof](./verification/order-process/desktop-proof.png)
- [Mobile: sizing](./verification/order-process/mobile-choose.png)
- [Motion recording](./verification/order-process/walkthrough-desktop.webm)

All four stage previews at both sizes are in `verification/order-process/`.
