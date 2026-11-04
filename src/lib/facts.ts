/*
 * Prices and service facts, in one place. At the client's request (2026-11-04) these follow the
 * prices and terms Sticker Bros (stickerbros.com) publishes for the same products, converted to
 * Canadian dollars at one rate (CAD_PER_USD). Change them here when Label Bros has its own list.
 *
 * Price model, fitted to Sticker Bros' listed regular prices for die-cut vinyl (in US dollars):
 *   50 × 3 in = $60.75, 250 × 3 in = $150.00, 200 × 4 in = $178.00
 * Price per sticker falls with quantity (each = 1.215 × (qty / 50) ^ -0.438) and grows in step
 * with the size's longest side (× size / 3). Holographic and glitter cost about 13% more
 * (Sticker Bros: glitter from $68.50 where die-cut is from $60.75).
 */

/** US dollars to Canadian dollars (about the rate in late 2026; update it here). */
export const CAD_PER_USD = 1.38;

const cents = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const toCad = (usd: number) => cents(usd * CAD_PER_USD);

export const MIN_QTY = 10; // stickers (Sticker Bros' minimum for standard stickers)
export const MIN_QTY_SPECIAL = 25; // holographic, glitter, sheets, labels

export const PROOF = "Free proof in 12–24 hours";
export const SHIPS = "Ships in 2–4 business days";
export const SHIPS_LONG = "Printed and shipped 2–4 business days after you approve your proof";
export const RUSH = "Next-day production available";
export const FREE_SHIPPING = 100; // orders shipped within Canada over this, in CAD
export const SHIPPING = `Free shipping in Canada on orders over $${FREE_SHIPPING}`;
export const CURRENCY = "Prices in Canadian dollars";
export const SIZE_RANGE = "1 to 24 inches";
export const SHEET_SIZES = "3 × 3 in up to 36 × 24 in";
export const FILES = "PDF, AI, EPS, SVG, PNG, JPG, TIF or PSD";
export const SAMPLE_KIT = { price: toCad(5), count: 15, sizes: "2, 3 or 4 inches" };

const FINISH = { gloss: 1, matte: 1, holo: 68.5 / 60.75 } as const;

/** A price in Canadian dollars: $83.84 */
export const money = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Total and per-sticker price for an order, in CAD: quantity, longest side in inches, finish. */
export function quotePrice(qty: number, longest: number, finish: keyof typeof FINISH) {
  const each = 1.215 * Math.pow(Math.max(qty, 1) / 50, -0.438) * (longest / 3) * FINISH[finish];
  const total = toCad(each * qty);
  return { total, each: total / qty };
}

/** "From" prices shown on product cards, in CAD: 50 at 3 inches, as Sticker Bros lists them. */
export const FROM = {
  dieCut: quotePrice(50, 3, "gloss").total,
  holo: toCad(68.5),
  seals: toCad(44.78),
  sheets: toCad(102.9),
  labels: quotePrice(50, 3, "gloss").total,
};
