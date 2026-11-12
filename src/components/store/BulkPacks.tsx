"use client";

import Link from "next/link";
import { Arrow } from "@/components/site/Arrow";
import { useCurrency } from "@/lib/currency";
import { money } from "@/lib/facts";
import { MATERIALS, SHAPES, sizeText, type MaterialId, type ShapeId } from "@/lib/options";
import { eachText, quote } from "@/lib/pricing";
import { productBySlug, productHref } from "@/lib/products";
import { ProductThumb } from "./ProductMedia";

/*
 * Bulk orders people often place, priced on the spot. Each opens its product with the size,
 * quantity and material already set, ready to add artwork and buy (any of them can be changed).
 */

type Pack = { slug: string; shape: ShapeId; w: number; h: number; qty: number; material: MaterialId };

const PACKS: Pack[] = [
  { slug: "roll-labels", shape: "die-cut", w: 3, h: 2, qty: 1000, material: "white-bopp" },
  { slug: "food-labels", shape: "circle", w: 3, h: 3, qty: 2500, material: "white-bopp" },
  { slug: "bottle-labels", shape: "die-cut", w: 3, h: 4, qty: 2500, material: "white-bopp" },
  { slug: "beverage-labels", shape: "die-cut", w: 6, h: 2.5, qty: 5000, material: "white-bopp" },
  { slug: "circle-labels", shape: "circle", w: 2, h: 2, qty: 10000, material: "white-bopp" },
  { slug: "custom-labels", shape: "die-cut", w: 4, h: 3, qty: 25000, material: "paper" },
];

export function BulkPacks() {
  const cur = useCurrency();
  return (
    <ul className="packs">
      {PACKS.map((k) => {
        const p = productBySlug(k.slug);
        if (!p) return null;
        const q = quote({ range: "labels", shape: k.shape, w: k.w, h: k.h, material: k.material, qty: k.qty }, cur);
        return (
          <li key={`${k.slug}-${k.qty}`}>
            <Link href={productHref(p, { shape: k.shape, w: k.w, h: k.h, qty: k.qty, material: k.material, bulk: true })} className="pack">
              <ProductThumb p={p} className="pack-thumb" />
              <span className="pack-main">
                <b className="pack-name">
                  {k.qty.toLocaleString("en-CA")} {p.plural}
                </b>
                <span className="pack-spec">
                  {sizeText(k.shape, k.w, k.h)} {SHAPES[k.shape].label.toLowerCase()} · {MATERIALS[k.material].label}
                </span>
              </span>
              <span className="pack-price">
                <b>{money(q.total, cur)}</b>
                <small>{eachText(q.each, cur)} each</small>
              </span>
              <span className="pack-go" aria-hidden="true">
                <Arrow />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
