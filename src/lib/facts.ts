/*
 * Prices and service facts, in one place. At the client's request (2026-11-04, 2026-11-08) these
 * follow the prices and terms Sticker Bros (stickerbros.com) publishes for the same products.
 * Prices are kept in US dollars, exactly as Sticker Bros lists them. Visitors shipping to Canada
 * see and pay Canadian dollars (USD × CAD_PER_USD); everyone else sees and pays US dollars.
 * Change them here when Label Bros has its own list.
 *
 * How a price is found (quotePriceUsd):
 *   1. LISTED_USD: Sticker Bros' own listed price for that product, size and quantity, if entered.
 *   2. Otherwise the model fitted to their listed prices for die-cut vinyl:
 *        each = 1.215 × (qty / 50) ^ -0.438 × (longest side / 3), × 1.128 for holographic/glitter
 *      (it gives 50 × 3 in = $60.75 exactly; Sticker Bros: glitter from $68.50 where die-cut is
 *      from $60.75).
 */

export type Currency = "cad" | "usd";
export const CURRENCIES: Currency[] = ["cad", "usd"];

/** US dollars to Canadian dollars (about the rate in late 2026; update it here). */
export const CAD_PER_USD = 1.38;

const cents = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** A US-dollar amount in the visitor's currency, to the cent. */
export const inCurrency = (usd: number, cur: Currency) => (cur === "usd" ? cents(usd) : cents(cents(usd) * CAD_PER_USD));

/** A price as shown and charged: whole dollars (client, 2026-11-09), e.g. $83.84 → $84. */
export const priceIn = (usd: number, cur: Currency) => Math.round(inCurrency(usd, cur));

export const MIN_QTY = 10; // stickers (Sticker Bros' minimum for standard stickers)
export const MIN_QTY_SPECIAL = 25; // holographic, glitter, sheets, labels

export const PROOF = "Free proof in 12–24 hours";
/** How approval works (client, 2026-11-09): a proof to approve, and a call when the design needs changes. */
export const APPROVAL = "We send you a proof to approve, and call you if your design needs any changes";
export const CALL = "We call you if your design needs changes";
export const SHIPS = "Ships in 2–4 business days";
export const SHIPS_LONG = "Printed and shipped 2–4 business days after you approve your proof";
export const RUSH = "Next-day production available";
export const FREE_SHIPPING = 100; // orders shipped within Canada at or over this, in CAD
export const SHIPPING = `Free shipping in Canada on orders over $${FREE_SHIPPING}`;
export const CURRENCY = "Prices in CAD in Canada, USD everywhere else";
export const SIZE_RANGE = "1 to 24 inches";
export const SHEET_SIZES = "3 × 3 in up to 36 × 24 in";
export const FILES = "PDF, AI, EPS, SVG, PNG, JPG, TIF or PSD";
export const SAMPLE_KIT = { usd: 5, count: 15, sizes: "2, 3 or 4 inches" };

// Sticker Bros: glitter from $68.50, embossed from $78.32, where die-cut is from $60.75 (50 × 3 in).
// Clear, chrome and reflective are NOT yet confirmed against Sticker Bros: clear is priced as
// standard vinyl, chrome and reflective as foil (like holographic). Confirm and change here.
const FINISH = {
  gloss: 1,
  matte: 1,
  holo: 68.5 / 60.75,
  glitter: 68.5 / 60.75,
  embossed: 78.32 / 60.75,
  clear: 1, // to confirm
  chrome: 68.5 / 60.75, // to confirm
  reflective: 68.5 / 60.75, // to confirm
} as const;
/** Every finish and material the shop sells (the server accepts exactly these). */
export const FINISH_IDS = Object.keys(FINISH) as (keyof typeof FINISH)[];
export type Finish = keyof typeof FINISH;

/**
 * Sticker Bros' listed prices in USD, used as they are: "finish|longest side in inches|quantity".
 * Add rows from their price table here and the builder, checkout and product cards all follow.
 */
export const LISTED_USD: Record<string, number> = {
  "gloss|3|50": 60.75,
  "matte|3|50": 60.75,
  "gloss|3|250": 150.0,
  "matte|3|250": 150.0,
  "gloss|4|200": 178.0,
  "matte|4|200": 178.0,
  "holo|3|50": 68.5,
  "embossed|3|50": 78.32,
  "glitter|3|50": 68.5,
};

/** An amount with its symbol: whole dollars without cents ($84), anything else to the cent ($1.24). */
export const money = (n: number, cur: Currency = "cad") => {
  const whole = Number.isInteger(n);
  return n.toLocaleString(cur === "usd" ? "en-US" : "en-CA", {
    style: "currency",
    currency: cur.toUpperCase(),
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  });
};

/** The order total in US dollars, as Sticker Bros would charge it. */
export function quotePriceUsd(qty: number, longest: number, finish: Finish) {
  const listed = LISTED_USD[`${finish}|${Math.round(longest * 100) / 100}|${qty}`];
  if (listed !== undefined) return listed;
  const each = 1.215 * Math.pow(Math.max(qty, 1) / 50, -0.438) * (longest / 3) * FINISH[finish];
  return cents(each * qty);
}

/**
 * The size a price is worked out from, in inches, so bigger always costs more and smaller less.
 * Die-cut, circle and square stickers sit in a square: their longest side (3 in = a 3 × 3 in
 * square, as Sticker Bros sells them). Rectangles have a width and a height: the side of the
 * square with the same area, so a 3 × 1 in label costs less than a 3 × 2 in one. Presets and
 * custom sizes follow the same rule, so the same size is always the same price.
 */
export function priceSize(shape: string, w: number, h: number) {
  const s = shape === "rectangle" ? Math.sqrt(w * h) : Math.max(w, h);
  return Math.round(s * 100) / 100;
}

/** Total and price each, in the given currency: quantity, size in inches (see priceSize), finish. */
export function quotePrice(qty: number, longest: number, finish: Finish, cur: Currency = "cad") {
  const total = priceIn(quotePriceUsd(qty, longest, finish), cur); // whole dollars; the price each keeps its cents
  return { total, each: total / qty, currency: cur };
}

/** "From" prices shown on product cards, in USD: 50 at 3 inches, as Sticker Bros lists them. */
export const FROM_USD = {
  dieCut: quotePriceUsd(50, 3, "gloss"),
  holo: 68.5,
  seals: 44.78,
  sheets: 102.9,
  labels: quotePriceUsd(50, 3, "gloss"),
};
