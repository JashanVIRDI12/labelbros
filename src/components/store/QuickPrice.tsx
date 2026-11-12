"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Arrow } from "@/components/site/Arrow";
import { useCurrency } from "@/lib/currency";
import { money } from "@/lib/facts";
import { BULK_FROM, QTY_TIERS, SHAPES, SIZE_LIMITS, inch } from "@/lib/options";
import { eachText, quote } from "@/lib/pricing";
import { LABEL_PRODUCTS, STICKER_PRODUCTS, productBySlug, productHref } from "@/lib/products";

/*
 * "Price your labels": pick what you need, type the width and height in inches, pick how many,
 * and the price is there before you've left the homepage. Continue opens the product with those
 * choices already made.
 */

const QTYS = [...new Set([100, 250, ...QTY_TIERS.bulk])];

export function QuickPrice() {
  const cur = useCurrency();
  const id = useId();
  const [slug, setSlug] = useState("custom-labels");
  const p = productBySlug(slug) ?? LABEL_PRODUCTS[0];
  const lim = SIZE_LIMITS[p.range];
  const [wText, setWText] = useState("3");
  const [hText, setHText] = useState("2");
  const [qty, setQty] = useState(1000);

  const equal = Boolean(SHAPES[p.defaults.shape].equal);
  const num = (t: string) => Number(t);
  const ok = (t: string) => t !== "" && Number.isFinite(num(t)) && num(t) >= lim.min && num(t) <= lim.max;
  const valid = ok(wText) && (equal || ok(hText));
  const w = valid ? num(wText) : 3;
  const h = equal ? w : valid ? num(hText) : 2;
  const q = quote({ range: p.range, shape: p.defaults.shape, w, h, material: p.defaults.material, qty }, cur);
  const href = productHref(p, { w: Math.round(w * 100) / 100, h: Math.round(h * 100) / 100, qty, bulk: qty >= BULK_FROM && p.range === "labels" });

  return (
    <form className="qp" aria-labelledby={`${id}-t`} onSubmit={(e) => e.preventDefault()}>
      <p id={`${id}-t`} className="qp-title">
        Price your labels
      </p>
      <label className="qp-field qp-what">
        <span>What for</span>
        <select value={slug} onChange={(e) => setSlug(e.target.value)}>
          <optgroup label="Labels">
            {LABEL_PRODUCTS.map((x) => (
              <option key={x.slug} value={x.slug}>
                {x.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Stickers">
            {STICKER_PRODUCTS.map((x) => (
              <option key={x.slug} value={x.slug}>
                {x.name}
              </option>
            ))}
          </optgroup>
        </select>
      </label>
      <div className="qp-size">
        <label className="qp-field">
          <span>{equal ? "Diameter" : "Width"}</span>
          <span className="qp-box">
            <input inputMode="decimal" value={wText} onChange={(e) => setWText(e.target.value)} aria-invalid={!ok(wText) || undefined} aria-describedby={`${id}-n`} />
            <i>in</i>
          </span>
        </label>
        {!equal && (
          <>
            <span className="qp-x" aria-hidden="true">
              ×
            </span>
            <label className="qp-field">
              <span>Height</span>
              <span className="qp-box">
                <input inputMode="decimal" value={hText} onChange={(e) => setHText(e.target.value)} aria-invalid={!ok(hText) || undefined} aria-describedby={`${id}-n`} />
                <i>in</i>
              </span>
            </label>
          </>
        )}
      </div>
      <label className="qp-field qp-qty">
        <span>How many</span>
        <select value={qty} onChange={(e) => setQty(Number(e.target.value))}>
          {QTYS.map((n) => (
            <option key={n} value={n}>
              {n.toLocaleString("en-CA")}
              {n >= BULK_FROM ? " (bulk)" : ""}
            </option>
          ))}
        </select>
      </label>
      <p className="qp-out" aria-live="polite">
        <b>{money(q.total, cur)}</b>
        <small>
          {" "}
          {cur.toUpperCase()} · {eachText(q.each, cur)} each
        </small>
      </p>
      <Link href={href} className="btn btn-primary qp-go" aria-disabled={!valid || undefined} onClick={(e) => !valid && e.preventDefault()}>
        Continue
        <Arrow />
      </Link>
      <p id={`${id}-n`} className={valid ? "qp-note" : "qp-note qp-bad"}>
        {valid ? "Any size, any shape. Free proof before we print." : `Sizes go from ${inch(lim.min)} to ${inch(lim.max)} inches.`}
      </p>
    </form>
  );
}
