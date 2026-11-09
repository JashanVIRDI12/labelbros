/** A link to the order page's builder, at the upload, with options already picked (Pricing.tsx reads them). */
export function quoteHref(
  product: "stickers" | "labels",
  params: { shape?: string; size?: number; w?: number; h?: number; finish?: string; artwork?: "upload" | "design" } = {},
) {
  const q = new URLSearchParams({ product });
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    q.set(k, typeof v === "number" ? String(Math.round(v * 100) / 100) : v);
  }
  return `/quote?${q.toString()}#pricing`;
}

/** The main button's words for a builder link: we design it, or they upload theirs. */
export const orderLabel = (href: string) => (href.includes("artwork=design") ? "Start your design" : "Upload your design");
