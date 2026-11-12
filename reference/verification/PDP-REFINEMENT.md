# Product page refinement — November 12, 2026

## Layout

The product stage now derives its aspect ratio from the image's recorded width and height.
All current catalog photos are 1024 × 1280, so their frames are 4:5 at every breakpoint.
Removed viewport-height sizing and mobile height caps that changed the frame's proportions.
The photograph fills its frame without side bands. Hover zoom remains removed.

Desktop keeps the sticky photo beside the order sheet, with a more balanced column split.
The Photo / Your label controls sit below the image. Mobile follows the DOM reading order:
product name and price, photograph, then configuration. Titles and spacing are more compact.

## Buying clarity

- Label the price as the order total, retaining quantity, dimensions and unit price.
- Place existing proof and production/shipping facts beside the price.
- Give the order sheet a clear heading and a contact link for help.
- Identify sample packaging/designs and link directly to product details.
- Use sample-pack-specific copy rather than proof/approval promises for unprinted samples.

Pricing formulas, customization choices, artwork modes, cart storage and checkout remain
unchanged. These are usability improvements; no conversion-rate uplift has been measured.

## Search metadata

Every product now uses its own photograph for Open Graph and Twitter cards. Product JSON-LD
includes the full photo and square thumbnail, canonical URL, stable catalog slug as SKU,
category and new-item condition, retaining its existing CAD default-order offer price.
Breadcrumb structured data uses the same canonical base as page metadata, including when
the base comes from the existing production-host fallback.

Product data was checked against Google's primary
[merchant listing documentation](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).
No reviews, ratings, GTINs, certifications or policies were invented.

## Verification

- Full lint, TypeScript and production build pass.
- [58 browser checks](./pdp-refinement/checks.json): all 19 products at 390 and 1440 px,
  plus food labels, bottle labels, vinyl stickers and sample packs at 375, 768, 1024,
  1280 and 1920 px. Exact frame ratio, no horizontal overflow, one H1, descriptive alt
  text, product-specific share images, canonical URLs, breadcrumbs and matching visible/
  structured offer prices pass. Zero browser runtime errors.
- Desktop and mobile interactions pass: size and quantity update the live price; Photo /
  Your label switching works; adding to cart preserves dimensions, quantity and artwork
  choice. Sticker deals and sample packs correctly update price and cart pack count.
- Normal-motion hover check confirms the photo stays still.
- Screenshots of four representative products at desktop and mobile widths are in
  [pdp-refinement/](./pdp-refinement/).

## Lighthouse mobile

Production `/shop/food-labels`, Lighthouse 13.6.0, default simulated mobile throttling:

| Run | Performance | Accessibility | Best practices | SEO | LCP | CLS |
|---|---:|---:|---:|---:|---:|---:|
| [Initial image processing](./pdp-refinement/lighthouse-mobile.json) | 88 | 100 | 100 | 100 | 3.9 s | 0 |
| [Image processing cached](./pdp-refinement/lighthouse-mobile-cached.json) | 92 | 100 | 100 | 100 | 3.3 s | 0 |

The photo is discoverable in the initial HTML, preloaded, high priority and responsive;
the mobile AVIF response is approximately 17 KB. The audit reports no image-delivery
savings. LCP still exceeds the repository's 2.5 s target under simulated mobile throttling.
