import { quoteHref as quote } from "@/components/sheet/quote";

/*
 * Sample label artwork for the labels page (made-up brands, not customers): product shots and
 * flat labels in public/labels, with their natural pixel sizes.
 */

export const LABELS = {
  olive: { src: "/labels/olive.webp", w: 218, h: 900 },
  "olive-label": { src: "/labels/olive-label.webp", w: 301, h: 560 },
  jam: { src: "/labels/jam.webp", w: 705, h: 900 },
  "jam-label": { src: "/labels/jam-label.webp", w: 551, h: 560 },
  kombucha: { src: "/labels/kombucha.webp", w: 249, h: 900 },
  "kombucha-label": { src: "/labels/kombucha-label.webp", w: 560, h: 372 },
  fern: { src: "/labels/fern.webp", w: 278, h: 900 },
  "fern-label": { src: "/labels/fern-label.webp", w: 271, h: 560 },
  candle: { src: "/labels/candle.webp", w: 883, h: 810 },
  "candle-label": { src: "/labels/candle-label.webp", w: 560, h: 379 },
  coffee: { src: "/labels/coffee.webp", w: 547, h: 900 },
  "coffee-label": { src: "/labels/coffee-label.webp", w: 331, h: 560 },
} as const;

export type LabelId = keyof typeof LABELS;

export const maskOf = (id: LabelId) => `url(${LABELS[id].src})`;

/** A link into the pricing builder with labels and these options picked. */
export const quoteHref = (params: Parameters<typeof quote>[1] = {}) => quote("labels", params);
