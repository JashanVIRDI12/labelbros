/*
 * The choices on the contact and business forms, shared by the forms (browser) and the checks
 * on the server, so both always agree.
 */

export const CONTACT_TOPICS = [
  { id: "quote", label: "A quote" },
  { id: "artwork", label: "My artwork" },
  { id: "order", label: "An order" },
  { id: "other", label: "Something else" },
] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number]["id"];

export const BUSINESS_KINDS = [
  { id: "food", label: "Food" },
  { id: "beverage", label: "Drinks" },
  { id: "cosmetic", label: "Cosmetics and skincare" },
  { id: "candle", label: "Candles and home" },
  { id: "coffee", label: "Coffee and tea" },
  { id: "retail", label: "Retail packaging" },
  { id: "shipping", label: "Shipping and warehouse" },
  { id: "other", label: "Something else" },
] as const;

export const BUSINESS_VOLUME = [
  { id: "1k-10k", label: "1,000 to 10,000" },
  { id: "10k-50k", label: "10,000 to 50,000" },
  { id: "50k-100k", label: "50,000 to 100,000" },
  { id: "100k-plus", label: "Over 100,000" },
] as const;

export const BUSINESS_OFTEN = [
  { id: "once", label: "Just once" },
  { id: "few", label: "A few times a year" },
  { id: "monthly", label: "Every month" },
  { id: "ongoing", label: "All the time" },
] as const;

/** The label for an option id, or the id itself. */
export const labelOf = (list: readonly { id: string; label: string }[], id: string | undefined) =>
  (id && list.find((x) => x.id === id)?.label) || id || "";

/** A client-side email check (the server checks again). */
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
