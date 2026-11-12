"use client";

import Link from "next/link";
import { Arrow } from "@/components/site/Arrow";
import { Motion } from "@/components/site/Motion";
import { useCurrency } from "@/lib/currency";
import { INVOICE_MIN, money } from "@/lib/facts";
import { BULK_FROM, QTY_TIERS } from "@/lib/options";
import { eachText, priceBreaks } from "@/lib/pricing";

/*
 * Bulk for business, shown rather than told: the price of one 3 × 2 in label at every bulk
 * quantity, as bars that fall as the quantity grows (bulk-motion.ts grows them in as you scroll).
 * The numbers come from the same formula the shop charges.
 */

const BASE = { range: "labels", shape: "rectangle", w: 3, h: 2, material: "white-bopp" } as const;

export function BulkBand({ title = "Bulk labels, straight from the shop.", headingLevel = 2 }: { title?: string; headingLevel?: 1 | 2 }) {
  const cur = useCurrency();
  const rows = priceBreaks(BASE, QTY_TIERS.bulk, cur);
  const top = rows[0]?.each ?? 1;
  const H = headingLevel === 1 ? "h1" : "h2";
  return (
    <section className="bulk" aria-labelledby="bulk-title" data-motion-root>
      <Motion name="bulk" />
      <div className="bulk-copy">
        <H id="bulk-title" className="display bulk-title" data-reveal>
          {title}
        </H>
        <p className="bulk-lede">
          Ordering {BULK_FROM.toLocaleString("en-CA")}, 5,000 or 50,000? Every label in the shop has bulk prices built in: pick the quantity, pay, and we print. No setup fees, no plate charges.
        </p>
        <ul className="bulk-perks">
          <li>
            <b>Buy direct.</b> No quote to wait for: the price is on the page.
          </li>
          <li>
            <b>Pay by card or invoice.</b> Business orders over ${INVOICE_MIN} can pay by invoice.
          </li>
          <li>
            <b>Checked by hand.</b> Every file is checked and proofed before it prints.
          </li>
          <li>
            <b>Over 100,000?</b> Custom materials or many versions? We quote it.
          </li>
        </ul>
        <div className="bulk-btns">
          <Link href="/business" className="btn btn-primary">
            Shop bulk labels
            <Arrow />
          </Link>
          <Link href="/business#quote" className="btn btn-light">
            Get a quote
          </Link>
        </div>
      </div>

      <figure className="bulk-chart" aria-labelledby="bulk-cap">
        <figcaption id="bulk-cap" className="bulk-cap">
          <b>Price per label</b> · 3 × 2 in, white BOPP, gloss, on a roll
        </figcaption>
        <ol className="bulk-bars">
          {rows.map((r) => (
            <li key={r.qty} className="bulk-row" style={{ ["--v" as string]: (r.each / top).toFixed(3) }}>
              <span className="bulk-qty">{r.qty.toLocaleString("en-CA")}</span>
              <span className="bulk-bar" aria-hidden="true">
                <span />
              </span>
              <span className="bulk-each">
                <b>{eachText(r.each, cur)}</b>
                <small>{money(r.total, cur)}</small>
              </span>
            </li>
          ))}
        </ol>
        <p className="bulk-foot">
          {cur.toUpperCase()}. Any size: type yours on the product page and the price follows.
        </p>
      </figure>
    </section>
  );
}
