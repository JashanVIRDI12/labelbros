/*
 * Product photos with sample labels (made-up brands, not customers), in public/labels: each one
 * labelled, bare (no label), and the label on its own, all at their natural pixel sizes. `spot`
 * is where the label sits on the product (left, top, width, height in % of the photo), so the
 * label can be shown landing on it.
 */

export type PhotoId = "olive" | "jam" | "kombucha" | "fern" | "candle" | "coffee";

export type Photo = {
  id: PhotoId;
  brand: string;
  /** what the label is, and what it is printed on (sample specs) */
  what: string;
  spec: string;
  /** height on a shelf, as a share of the tallest product (a jar is shorter than a bottle) */
  size: number;
  photo: { w: number; h: number };
  label: { w: number; h: number };
  spot: [number, number, number, number];
  /** a wrap-around label: it lands flat, wider than the bottle, and wraps round it */
  wrap?: boolean;
};

export const PHOTOS: Record<PhotoId, Photo> = {
  olive: { id: "olive", brand: "Old Harbor olive oil", what: "Bottle label", spec: "White BOPP, matte, rounded", size: 1, photo: { w: 218, h: 900 }, label: { w: 301, h: 560 }, spot: [9.2, 38.3, 81.7, 43.6] },
  jam: { id: "jam", brand: "Sunday Jam Co.", what: "Jar label", spec: "White BOPP, gloss, die-cut", size: 0.62, photo: { w: 705, h: 900 }, label: { w: 551, h: 560 }, spot: [22.7, 36, 56, 50.6] },
  kombucha: { id: "kombucha", brand: "Tidewater kombucha", what: "Wrap-around label", spec: "White BOPP, gloss, on a roll", size: 0.94, photo: { w: 249, h: 900 }, label: { w: 560, h: 372 }, spot: [4.4, 52, 91.6, 34.1], wrap: true },
  fern: { id: "fern", brand: "Wild Fern face oil", what: "Cosmetics label", spec: "White BOPP, matte", size: 0.62, photo: { w: 278, h: 900 }, label: { w: 271, h: 560 }, spot: [5.8, 48.3, 87.8, 42.4] },
  candle: { id: "candle", brand: "Ember & Oak candle", what: "Candle label", spec: "White BOPP, matte, circle", size: 0.58, photo: { w: 883, h: 810 }, label: { w: 560, h: 379 }, spot: [12.2, 27.4, 47, 48.8] },
  coffee: { id: "coffee", brand: "Night Shift coffee", what: "Bag label", spec: "White BOPP, matte, die-cut", size: 0.84, photo: { w: 547, h: 900 }, label: { w: 331, h: 560 }, spot: [22.5, 31.1, 54.3, 46.8] },
};

export const photoSrc = (id: PhotoId, kind: "full" | "bare" | "label" = "full") =>
  `/labels/${id}${kind === "full" ? "" : `-${kind}`}.webp`;

/** Sample sticker artwork (made-up brands), in public/stickers. */
export const STICKER_ART = {
  approved: { w: 804, h: 820 },
  beeline: { w: 706, h: 820 },
  caution: { w: 820, h: 358 },
  "ember-oak": { w: 820, h: 555 },
  "fire-escape": { w: 800, h: 820 },
  fresh: { w: 820, h: 419 },
  "hop-scotch": { w: 400, h: 820 },
  "label-bros": { w: 820, h: 451 },
  liftoff: { w: 553, h: 800 },
  "new-burst": { w: 805, h: 820 },
  "night-shift": { w: 485, h: 820 },
  "thank-you": { w: 804, h: 820 },
} as const;
export type StickerArtId = keyof typeof STICKER_ART;
export const stickerSrc = (id: StickerArtId) => `/stickers/${id}.webp`;
