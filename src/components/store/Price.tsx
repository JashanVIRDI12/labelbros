"use client";

import { useCurrency } from "@/lib/currency";
import { money } from "@/lib/facts";
import { BULK_FROM } from "@/lib/options";
import { eachText, priceIn, quote } from "@/lib/pricing";
import type { Product } from "@/lib/products";

/*
 * Prices that follow the visitor's currency (CAD in Canada, USD elsewhere). Pages are built in
 * CAD and switch on arrival, so these are small client pieces inside server-drawn cards.
 */

/** A US-dollar price in the visitor's currency, whole dollars, with its code. */
export function Price({ usd, code = true }: { usd: number; code?: boolean }) {
  const cur = useCurrency();
  return (
    <>
      {money(priceIn(usd, cur), cur)}
      {code && <span className="price-code"> {cur.toUpperCase()}</span>}
    </>
  );
}

/**
 * A card's price. Labels: the price each at 1,000 (what a business compares), and the order it
 * starts from. Stickers: the default order. Deals: the pack price and the regular price.
 */
export function CardPrice({ p }: { p: Product }) {
  const cur = useCurrency();
  if (p.kind === "deal")
    return (
      <span className="cprice">
        <b>{money(priceIn(p.priceUsd ?? 0, cur), cur)}</b>
        {p.valueUsd ? <s>{money(priceIn(p.valueUsd, cur), cur)}</s> : null}
        <small>{cur.toUpperCase()}</small>
      </span>
    );
  const d = p.defaults;
  const base = { range: p.range, shape: d.shape, w: d.w, h: d.h, material: d.material };
  if (p.range === "labels") {
    const at = quote({ ...base, qty: 1000 }, cur);
    return (
      <span className="cprice">
        <b>{eachText(at.each, cur)}</b>
        <small> each at 1,000</small>
      </span>
    );
  }
  const q = quote({ ...base, qty: d.qty }, cur);
  return (
    <span className="cprice">
      <small>From</small>
      <b>{money(q.total, cur)}</b>
      <small>
        {cur.toUpperCase()} for {d.qty}
      </small>
    </span>
  );
}

/** "From $0.09 each at 10,000": the lowest price each a product reaches on the site. */
export function BulkFrom({ p, qty = 10000 }: { p: Product; qty?: number }) {
  const cur = useCurrency();
  const d = p.defaults;
  const q = quote({ range: p.range, shape: d.shape, w: d.w, h: d.h, material: d.material, qty: Math.max(qty, BULK_FROM) }, cur);
  return <>{eachText(q.each, cur)}</>;
}
