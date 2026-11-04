/** A link to the quote page's builder with options already picked (Pricing.tsx reads them). */
export function quoteHref(
  product: "stickers" | "labels",
  params: { shape?: string; size?: number; w?: number; h?: number; finish?: string } = {},
) {
  const q = new URLSearchParams({ product });
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    q.set(k, typeof v === "number" ? String(Math.round(v * 100) / 100) : v);
  }
  return `/quote?${q.toString()}`;
}
