/*
 * What "Track my order" shows: the steps every order goes through, and where an order is now.
 * Shared by the API (which works out the step) and the page (which draws it).
 */
export const TRACK_STEPS = [
  { id: "paid", label: "Order placed", note: "We have your order and your payment." },
  { id: "proof_sent", label: "Proof sent", note: "Check your email: open the link to approve it, or tell us what to change." },
  { id: "approved", label: "Proof approved", note: "Your design is final and queued for the press." },
  { id: "printing", label: "Printing", note: "Printed, cut and checked." },
  { id: "shipped", label: "Shipped", note: "On its way to you." },
] as const;

export type TrackResult = {
  ref: string;
  summary: string;
  /** index into TRACK_STEPS of the step reached; -1 when not paid yet */
  step: number;
  /** set when the order left the usual path */
  state?: "cancelled" | "refunded" | "unpaid" | "invoice";
  placed: string;
};
