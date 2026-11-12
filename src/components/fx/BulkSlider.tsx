"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Arrow } from "@/components/site/Arrow";
import { useCurrency } from "@/lib/currency";
import { INVOICE_MIN, money } from "@/lib/facts";
import { gsap } from "@/lib/gsap";
import { MATERIALS, SHAPES, inch } from "@/lib/options";
import { eachText, quote } from "@/lib/pricing";
import { productBySlug, productHref } from "@/lib/products";
import { configure } from "@/lib/configure";

/*
 * Bulk pricing you can feel: drag from 500 to 50,000 labels and watch the price of one label fall,
 * counting down as a dot rides the price curve. Three common sizes. The numbers come from the same
 * formula the shop charges; the button opens roll labels at that quantity and size. On a product
 * page (`slug`) it uses that product's shape, sizes and material, and the button sets the quantity
 * in the buy box above instead.
 */

const STEPS = [500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 40000, 50000];
const SIZES: { w: number; h: number; label: string }[] = [
  { w: 2, h: 2, label: "2 × 2 in" },
  { w: 3, h: 2, label: "3 × 2 in" },
  { w: 4, h: 3, label: "4 × 3 in" },
];
const VB = { w: 600, h: 260, pad: 18 };

export function BulkSlider({
  title = "The more you order, the less each label costs.",
  headingId = "bulk-title",
  slug,
}: {
  title?: string;
  headingId?: string;
  /** a product page: price this product, and set its buy box */
  slug?: string;
}) {
  const cur = useCurrency();
  const id = useId();
  const p = slug ? productBySlug(slug) : undefined;
  const shape = p?.defaults.shape ?? "rectangle";
  const material = p?.defaults.material ?? "white-bopp";
  const equal = Boolean(SHAPES[shape].equal);
  const sizes = p
    ? (equal ? [...new Set(p.presets.map(([w]) => w))].map((w) => [w, w] as [number, number]) : p.presets).slice(0, 3).map(([w, h]) => ({ w, h, label: equal ? `${inch(w)} in` : `${inch(w)} × ${inch(h)} in` }))
    : SIZES;
  const [i, setI] = useState(6); // 3,000
  const [size, setSize] = useState(Math.min(1, sizes.length - 1));
  const each = useRef<HTMLSpanElement>(null);
  const shown = useRef({ v: 0 });
  const sz = sizes[size];
  const base = { range: "labels" as const, shape, w: sz.w, h: sz.h, material };
  const qty = STEPS[i];
  const q = quote({ ...base, qty }, cur);
  const first = quote({ ...base, qty: STEPS[0] }, cur);
  const save = Math.max(0, Math.round((1 - q.each / first.each) * 100));

  // the curve: price each against quantity (log scale)
  const pts = useMemo(() => {
    const ys = STEPS.map((n) => quote({ ...base, qty: n }, cur).each);
    const max = ys[0];
    const min = ys[ys.length - 1];
    return STEPS.map((n, k) => ({
      x: VB.pad + (k / (STEPS.length - 1)) * (VB.w - VB.pad * 2),
      // dearest at the top left, cheapest at the bottom right
      y: VB.pad + (1 - (ys[k] - min) / (max - min || 1)) * (VB.h - VB.pad * 2),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, cur, slug]);
  const path = pts.map((p, k) => `${k ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const dot = pts[i];

  // the price each counts to its new value
  useEffect(() => {
    const el = each.current;
    if (!el) return;
    const write = () => (el.textContent = eachText(shown.current.v, cur));
    if (!shown.current.v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      shown.current.v = q.each;
      write();
      return;
    }
    const t = gsap.to(shown.current, { v: q.each, duration: 0.6, ease: "expo.out", onUpdate: write });
    return () => {
      t.kill();
    };
  }, [q.each, cur]);

  const roll = productBySlug("roll-labels");
  const href = roll ? productHref(roll, { shape: "rectangle", w: sz.w, h: sz.h, qty, bulk: true }) : "/business";

  return (
    <section className="bs" aria-labelledby={headingId} data-motion-root>
      <div className="bs-copy">
        <h2 id={headingId} className="display bs-title" data-reveal>
          {title}
        </h2>
        <p className="bs-lede">Bulk prices are built into every label: no setup fees, no plate charges, no quote to wait for. Orders over ${INVOICE_MIN} can pay by invoice.</p>
      </div>

      <div className="bs-panel">
        <div className="bs-read">
          <p className="bs-each">
            <span ref={each}>{eachText(q.each, cur)}</span>
            <small> a label</small>
          </p>
          <p className="bs-total">
            {qty.toLocaleString("en-CA")} labels · {money(q.total, cur)} {cur.toUpperCase()}
            {save > 0 && <b> · {save}% less each than at 500</b>}
          </p>
        </div>

        <svg className="bs-curve" viewBox={`0 0 ${VB.w} ${VB.h}`} aria-hidden="true">
          <path d={path} className="bs-curve-line" />
          <path d={`${path} L${VB.w - VB.pad} ${VB.h} L${VB.pad} ${VB.h} Z`} className="bs-curve-fill" />
          <line x1={dot.x} x2={dot.x} y1={dot.y} y2={VB.h} className="bs-curve-drop" />
          <circle cx={dot.x} cy={dot.y} r="10" className="bs-curve-dot" />
        </svg>

        <label htmlFor={`${id}-q`} className="sr-only">
          How many labels
        </label>
        <input
          id={`${id}-q`}
          className="bs-range"
          type="range"
          min={0}
          max={STEPS.length - 1}
          step={1}
          value={i}
          onChange={(e) => setI(Number(e.target.value))}
          aria-valuetext={`${qty.toLocaleString("en-CA")} labels, ${eachText(q.each, cur)} each`}
          style={{ ["--p" as string]: `${(i / (STEPS.length - 1)) * 100}%` }}
        />
        <div className="bs-scale" aria-hidden="true">
          <span>500</span>
          <span>5,000</span>
          <span>50,000</span>
        </div>

        <div className="bs-foot">
          <div className="bs-sizes" role="group" aria-label="Label size">
            {sizes.map((s, k) => (
              <button key={s.label} type="button" className="bs-size" aria-pressed={k === size} onClick={() => setSize(k)}>
                {s.label}
              </button>
            ))}
          </div>
          {p ? (
            <button type="button" className="btn btn-primary" data-magnetic onClick={() => configure({ shape, w: sz.w, h: sz.h, qty, bulk: true })}>
              Use {qty.toLocaleString("en-CA")} labels
              <Arrow />
            </button>
          ) : (
            <Link href={href} className="btn btn-primary" data-magnetic>
              Order {qty.toLocaleString("en-CA")} labels
              <Arrow />
            </Link>
          )}
        </div>
        <p className="bs-note">
          {p ? `${MATERIALS[material].label} ${p.plural}, ${SHAPES[shape].label.toLowerCase()}, ${cur.toUpperCase()}. Any size and material: choose them above.` : `White BOPP roll labels, ${cur.toUpperCase()}. Any size and material: type yours on the product page.`}
        </p>
      </div>
    </section>
  );
}
