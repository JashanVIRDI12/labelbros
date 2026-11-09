"use client";

import { useId } from "react";
import { setCurrency, useCurrency } from "@/lib/currency";

/*
 * "Shipping to": Canada (prices in CAD) or anywhere else (prices in USD). Two chips, like the
 * builder's own options; picking one changes every price on the site.
 */
export function ShipTo({ className = "" }: { className?: string }) {
  const cur = useCurrency();
  const name = useId();
  return (
    <fieldset className={`ship-to ${className}`}>
      <legend>Shipping to</legend>
      <div className="chips">
        <label className="chip">
          <input type="radio" name={name} value="cad" checked={cur === "cad"} onChange={() => setCurrency("cad")} />
          <span>Canada · CAD</span>
        </label>
        <label className="chip">
          <input type="radio" name={name} value="usd" checked={cur === "usd"} onChange={() => setCurrency("usd")} />
          <span>Elsewhere · USD</span>
        </label>
      </div>
    </fieldset>
  );
}
