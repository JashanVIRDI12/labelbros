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
  { id: "shipping", label: "Shipping and address" },
  { id: "asset", label: "Asset tags" },
  { id: "warning", label: "Warning and safety" },
  { id: "inspection", label: "Inspection and QC" },
  { id: "bin", label: "Bin and shelf" },
  { id: "badge", label: "Name badges" },
  { id: "product", label: "Product labels" },
  { id: "other", label: "Something else" },
] as const;

export const BUSINESS_VOLUME = [
  { id: "under-500", label: "Under 500" },
  { id: "500-5k", label: "500 to 5,000" },
  { id: "5k-50k", label: "5,000 to 50,000" },
  { id: "50k-plus", label: "Over 50,000" },
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
