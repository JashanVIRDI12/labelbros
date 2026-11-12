/*
 * Service facts and money, in one place. At the client's request (2026-11-04, 2026-11-08) the
 * terms follow what Sticker Bros (stickerbros.com) publishes, in our own words. Prices are worked
 * out in pricing.ts; the catalogue is in products.ts. Change them here when Label Bros has its own.
 */

export type Currency = "cad" | "usd";
export const CURRENCIES: Currency[] = ["cad", "usd"];

/** US dollars to Canadian dollars (about the rate in late 2026; update it here). */
export const CAD_PER_USD = 1.38;

export const PROOF = "Free proof in 12–24 hours";
/** How approval works (client, 2026-11-09): a proof to approve, and a call when the design needs changes. */
export const APPROVAL = "We check your file and send a proof to approve. If it needs changes, we call you";
export const CHECK = "We check every file by hand before it prints";
export const CALL = "We call you if your design needs changes";
/** Confirmed by the client 2026-11-12: proofs are revised until the customer is happy. */
export const CHANGES = "Changes until you're happy";
export const SHIPS = "Ships in 2–4 business days";
export const SHIPS_LONG = "Printed and shipped 2–4 business days after you approve your proof";
export const RUSH = "Next-day production available";
export const FREE_SHIPPING = 100; // orders shipped within Canada at or over this, in CAD
export const SHIPPING = `Free shipping in Canada on orders over $${FREE_SHIPPING}`;
export const CURRENCY = "Prices in CAD in Canada, USD everywhere else";
export const FILES = "PDF, AI, EPS, SVG, PNG, JPG, TIF or PSD";
export const SAMPLE_KIT = { usd: 5, count: 15 };

/** Business orders at or over this (in the order's currency) can be paid by invoice. */
export const INVOICE_MIN = 500;
/** Days a business has to pay an invoice, unless the admin changes it when sending. */
export const INVOICE_DAYS = 14;

/* Reprints, refunds and carriers, as the FAQ has always said them (Sticker Bros' terms). */
export const REPRINT_WINDOW = "72 hours";
export const REPRINT = `Something wrong when it arrives? Tell us within ${REPRINT_WINDOW} of delivery and we reprint it free`;
export const NO_REFUND = "Custom prints cannot be refunded once production starts";
export const WORLD_CARRIERS = "UPS or FedEx";
/** When the policy pages were last changed (shown at the top of each). */
export const LEGAL_UPDATED = "November 9, 2026";

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
