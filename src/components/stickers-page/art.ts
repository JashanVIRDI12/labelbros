import { quoteHref as quote } from "@/components/sheet/quote";

/*
 * Sample sticker artwork for the stickers page (made-up brands, not customers): the trimmed WebP
 * files in public/stickers and their natural pixel sizes, so every image reserves its box.
 */

export const ART = {
  approved: { src: "/stickers/approved.webp", w: 804, h: 820 },
  beeline: { src: "/stickers/beeline.webp", w: 706, h: 820 },
  caution: { src: "/stickers/caution.webp", w: 820, h: 358 },
  "ember-oak": { src: "/stickers/ember-oak.webp", w: 820, h: 555 },
  "fire-escape": { src: "/stickers/fire-escape.webp", w: 800, h: 820 },
  fresh: { src: "/stickers/fresh.webp", w: 820, h: 419 },
  "hop-scotch": { src: "/stickers/hop-scotch.webp", w: 400, h: 820 },
  "label-bros": { src: "/stickers/label-bros.webp", w: 820, h: 451 },
  liftoff: { src: "/stickers/liftoff.webp", w: 553, h: 800 },
  "liftoff-sketch": { src: "/stickers/liftoff-sketch.webp", w: 553, h: 800 },
  "new-burst": { src: "/stickers/new-burst.webp", w: 805, h: 820 },
  "night-shift": { src: "/stickers/night-shift.webp", w: 485, h: 820 },
  "thank-you": { src: "/stickers/thank-you.webp", w: 804, h: 820 },
} as const;

export type ArtId = keyof typeof ART;

/** The artwork's own outline, for masks (footprints, glare that stays on the sticker). */
export const maskOf = (id: ArtId) => `url(${ART[id].src})`;

/** A link into the pricing builder with stickers and these options picked. */
export const quoteHref = (params: Parameters<typeof quote>[1] = {}) => quote("stickers", params);
