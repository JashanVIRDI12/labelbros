import { CAD_PER_USD, type Currency } from "./facts";
import type { MaterialId, Range, ShapeId } from "./options";

/*
 * The price formula. One formula prices every label and sticker on the site, so the product
 * pages, the cart, the server and the admin always agree. At the client's request (2026-11-04 and
 * 2026-11-11) it follows Sticker Bros' prices: the curve below is fitted to their listed prices for
 * die-cut vinyl stickers (50 × 3 in = $60.75 USD exactly), and prices are kept in US dollars.
 *
 *   price each (USD) = 1.215 × (quantity ÷ 50) ^ −0.438 × (size ÷ 3) × material
 *   total            = price each × quantity
 *
 *   size      labels: √(width × height) in inches, so a 4 × 1 in label costs what a 2 × 2 does;
 *             stickers that sit in a square (die-cut, circle, square): their longest side, as
 *             Sticker Bros prices them; rounded rectangles: √(width × height).
 *   quantity  the more you order, the less each costs: double the quantity and each one costs
 *             about 26% less (2 ^ −0.438 = 0.738). There are no setup or plate fees.
 *   material  1 for white BOPP, clear BOPP, paper, kraft and vinyl; foils (metallic silver and
 *             gold, holographic, glitter) cost 12.8% more, as Sticker Bros' holographic does
 *             ($68.50 vs $60.75 for 50 × 3 in).
 *
 * Shown and charged in whole dollars: CAD (USD × CAD_PER_USD) for Canada, USD everywhere else.
 * Change the numbers here and every price on the site follows.
 */

export const CURVE = {
  /** the price of one 3 in sticker in an order of 50, in USD */
  each: 1.215,
  /** the quantity and size the curve is measured from */
  qty: 50,
  size: 3,
  /** how fast the price each falls as the quantity grows */
  bend: 0.438,
};

/** Each material's price against white vinyl / BOPP. Not yet confirmed by Label Bros: see above. */
export const MATERIAL_FACTOR: Record<MaterialId, number> = {
  "white-bopp": 1,
  "clear-bopp": 1,
  paper: 1,
  kraft: 1,
  silver: 68.5 / 60.75,
  gold: 68.5 / 60.75,
  vinyl: 1,
  "clear-vinyl": 1,
  holographic: 68.5 / 60.75,
  glitter: 68.5 / 60.75,
};

/** Sticker Bros' own listed prices in USD, used exactly: "material|size|quantity". */
export const LISTED_USD: Record<string, number> = {
  "vinyl|3|50": 60.75,
  "vinyl|3|250": 150,
  "vinyl|4|200": 178,
  "holographic|3|50": 68.5,
  "glitter|3|50": 68.5,
};

const cents = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const r2 = (n: number) => Math.round(n * 100) / 100;

/** The size a price is worked out from, in inches (see above). */
export function priceSize(range: Range, shape: ShapeId, w: number, h: number) {
  const square = range === "stickers" && (shape === "die-cut" || shape === "circle" || shape === "square");
  return r2(square ? Math.max(w, h) : Math.sqrt(w * h));
}

export type PriceInput = { range: Range; shape: ShapeId; w: number; h: number; material: MaterialId; qty: number };

/** The order's total in US dollars, to the cent. */
export function priceUsd({ range, shape, w, h, material, qty }: PriceInput) {
  const size = priceSize(range, shape, w, h);
  const listed = range === "stickers" ? LISTED_USD[`${material}|${size}|${qty}`] : undefined;
  if (listed !== undefined) return listed;
  const each = CURVE.each * Math.pow(Math.max(qty, 1) / CURVE.qty, -CURVE.bend) * (size / CURVE.size) * MATERIAL_FACTOR[material];
  return cents(each * qty);
}

/** A US-dollar amount in the visitor's currency, to the cent. */
export const inCurrency = (usd: number, cur: Currency) => (cur === "usd" ? cents(usd) : cents(cents(usd) * CAD_PER_USD));

/** A price as shown and charged: whole dollars (client, 2026-11-09), e.g. $83.84 → $84. */
export const priceIn = (usd: number, cur: Currency) => Math.max(1, Math.round(inCurrency(usd, cur)));

/** The total in whole dollars and the price each, in the visitor's currency. */
export function quote(input: PriceInput, cur: Currency) {
  const total = priceIn(priceUsd(input), cur);
  return { total, each: total / input.qty };
}

/**
 * Price breaks: the price each at every quantity, and how much less each one costs than at the
 * first. Worked out from the same formula, so "save 51%" is always true.
 */
export function priceBreaks(input: Omit<PriceInput, "qty">, quantities: number[], cur: Currency) {
  const rows = quantities.map((qty) => ({ qty, ...quote({ ...input, qty }, cur) }));
  const first = rows[0]?.each ?? 0;
  return rows.map((r) => ({ ...r, save: first ? Math.max(0, Math.round((1 - r.each / first) * 100)) : 0 }));
}
export type Break = ReturnType<typeof priceBreaks>[number];

/** The next break above `qty`: how many, the price each, and how much less each is than now. */
export function nextBreak(rows: Break[], qty: number, eachNow: number) {
  const next = rows.find((r) => r.qty > qty);
  if (!next || !eachNow) return null;
  const save = Math.round((1 - next.each / eachNow) * 100);
  return save > 0 ? { ...next, save } : null;
}

/** A price each, readable at any size: "$0.37", "$0.042", "$1.24". */
export function eachText(n: number, cur: Currency) {
  const digits = n < 0.1 ? 3 : 2;
  return n.toLocaleString(cur === "usd" ? "en-US" : "en-CA", { style: "currency", currency: cur.toUpperCase(), minimumFractionDigits: digits, maximumFractionDigits: digits });
}
