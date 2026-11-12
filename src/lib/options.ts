/*
 * Every choice a customer makes when building an order: shape, size, material, finish, format and
 * quantity. The product pages, the cart and the server all read this file, so they always agree.
 * Prices for these choices are in pricing.ts.
 */

/** What we sell: labels first (for products and packaging), stickers second. */
export type Range = "labels" | "stickers";

export type ShapeId = "rectangle" | "rounded" | "square" | "circle" | "oval" | "die-cut";

export const SHAPES: Record<ShapeId, { label: string; note: string; equal?: boolean }> = {
  rectangle: { label: "Rectangle", note: "Square corners" },
  rounded: { label: "Rounded", note: "Rounded corners" },
  square: { label: "Square", note: "Rounded corners", equal: true },
  circle: { label: "Circle", note: "Round", equal: true },
  oval: { label: "Oval", note: "Long round" },
  "die-cut": { label: "Die-cut", note: "Cut round your design" },
};
export const SHAPE_IDS = Object.keys(SHAPES) as ShapeId[];

/** The shapes each range is cut in. */
export const SHAPES_FOR: Record<Range, ShapeId[]> = {
  labels: ["die-cut", "circle", "square"],
  stickers: ["die-cut", "circle", "square"],
};

export type FinishId = "gloss" | "matte" | "uncoated";
export const FINISHES: Record<FinishId, { label: string; note: string }> = {
  gloss: { label: "Gloss", note: "Shiny laminate: colours pop" },
  matte: { label: "Matte", note: "Soft laminate: no glare" },
  uncoated: { label: "Uncoated", note: "Natural paper: you can write on it" },
};
export const FINISH_IDS = Object.keys(FINISHES) as FinishId[];

export type MaterialId =
  | "white-bopp"
  | "clear-bopp"
  | "paper"
  | "kraft"
  | "silver"
  | "gold"
  | "vinyl"
  | "clear-vinyl"
  | "holographic"
  | "glitter";

export type Material = {
  label: string;
  note: string;
  /** what it's sold as: labels, stickers, or both */
  ranges: Range[];
  finishes: FinishId[];
  /** how the material looks on the preview and its swatch */
  look: "white" | "clear" | "paper" | "kraft" | "silver" | "gold" | "holo" | "glitter";
};

export const MATERIALS: Record<MaterialId, Material> = {
  "white-bopp": {
    label: "White BOPP",
    note: "Waterproof film that wipes clean of oil and water. The everyday choice for food, drinks and bath products.",
    ranges: ["labels"],
    finishes: ["gloss", "matte"],
    look: "white",
  },
  "clear-bopp": {
    label: "Clear BOPP",
    note: "See-through waterproof film, for the no-label look on glass and clear plastic.",
    ranges: ["labels"],
    finishes: ["gloss", "matte"],
    look: "clear",
  },
  paper: {
    label: "White paper",
    note: "Bright paper for dry goods, boxes, bags and jars. Leave it uncoated to write dates on it.",
    ranges: ["labels"],
    finishes: ["uncoated", "gloss", "matte"],
    look: "paper",
  },
  kraft: {
    label: "Kraft paper",
    note: "Natural brown paper with a handmade, earthy look.",
    ranges: ["labels", "stickers"],
    finishes: ["uncoated"],
    look: "kraft",
  },
  silver: {
    label: "Metallic silver",
    note: "Brushed silver film for a premium shine, on cosmetics, spirits and gifts.",
    ranges: ["labels", "stickers"],
    finishes: ["gloss", "matte"],
    look: "silver",
  },
  gold: {
    label: "Metallic gold",
    note: "Brushed gold film for a luxury finish, on candles, spirits and gift boxes.",
    ranges: ["labels", "stickers"],
    finishes: ["gloss", "matte"],
    look: "gold",
  },
  vinyl: {
    label: "White vinyl",
    note: "Thick, durable vinyl: waterproof and scratch-resistant, made for laptops, bottles and outdoors.",
    ranges: ["stickers"],
    finishes: ["gloss", "matte"],
    look: "white",
  },
  "clear-vinyl": {
    label: "Clear vinyl",
    note: "See-through vinyl for windows, glass and packaging.",
    ranges: ["stickers"],
    finishes: ["gloss"],
    look: "clear",
  },
  holographic: {
    label: "Holographic",
    note: "Rainbow foil that shifts colour as it moves.",
    ranges: ["stickers"],
    finishes: ["gloss"],
    look: "holo",
  },
  glitter: {
    label: "Glitter",
    note: "A glitter film under your design that sparkles in every light.",
    ranges: ["stickers"],
    finishes: ["gloss"],
    look: "glitter",
  },
};
export const MATERIAL_IDS = Object.keys(MATERIALS) as MaterialId[];
export const MATERIALS_FOR = (r: Range) => MATERIAL_IDS.filter((m) => MATERIALS[m].ranges.includes(r));

export type FormatId = "roll" | "sheet" | "cut";
export const FORMATS: Record<FormatId, { label: string; note: string }> = {
  roll: { label: "On a roll", note: "Quick to apply by hand or with a label applicator. We confirm the core size and wind direction with your proof." },
  sheet: { label: "On sheets", note: "Several labels to a sheet: easy to store and peel by hand." },
  cut: { label: "Cut one by one", note: "Each sticker on its own backing." },
};
export const FORMAT_IDS = Object.keys(FORMATS) as FormatId[];
export const FORMATS_FOR: Record<Range, FormatId[]> = { labels: ["roll", "sheet"], stickers: ["cut"] };

/** Sizes, in inches: width and height of the label or sticker. */
export const SIZE_LIMITS: Record<Range, { min: number; max: number }> = {
  labels: { min: 0.75, max: 12 },
  stickers: { min: 1, max: 24 },
};

/*
 * Quantities. Shop orders start small; business (bulk) orders start at 500 and go up to 50,000 on
 * the site, with any amount in between. Over 100,000 we quote by hand.
 */
export const QTY_TIERS: Record<Range | "bulk", number[]> = {
  labels: [100, 250, 500, 1000, 2500, 5000, 10000],
  stickers: [50, 100, 250, 500, 1000, 2500],
  bulk: [500, 1000, 2500, 5000, 10000, 25000, 50000],
};
/** The fewest in one order (Sticker Bros' minimums: 10 stickers, 25 for foils; 50 labels). */
export const MIN_QTY: Record<Range, number> = { labels: 50, stickers: 10 };
export const MIN_QTY_FOIL = 25;
export const BULK_FROM = 500;
export const MAX_QTY = 100_000;
export const minQty = (r: Range, m: MaterialId) => (m === "holographic" || m === "glitter" ? MIN_QTY_FOIL : MIN_QTY[r]);

/** How the customer's artwork arrives: their file, ours to design, or sent after ordering. */
export type ArtworkId = "upload" | "design" | "later" | "none";

const r2 = (n: number) => Math.round(n * 100) / 100;
/** "3", "2.5", "4.25": inches without trailing zeros. */
export const inch = (n: number) => String(r2(n));
/** A size in words: "3 × 2 in", or "3 in" for circles and squares. */
export const sizeText = (shape: ShapeId, w: number, h: number) =>
  SHAPES[shape].equal ? `${inch(w)} in` : `${inch(w)} × ${inch(h)} in`;
