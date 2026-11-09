"use client";

import { money, priceIn } from "@/lib/facts";
import { useCurrency } from "@/lib/currency";

/** A US-dollar price shown in the visitor's currency, in whole dollars, with its code: $84 CAD / $61 USD. */
export function Price({ usd, code = true }: { usd: number; code?: boolean }) {
  const cur = useCurrency();
  return (
    <>
      {money(priceIn(usd, cur), cur)}
      {code && <span className="price-code"> {cur.toUpperCase()}</span>}
    </>
  );
}
