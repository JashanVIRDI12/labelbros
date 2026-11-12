import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/site/Arrow";
import { CardPrice } from "@/components/store/Price";
import type { Product } from "@/lib/products";

/*
 * "Or shop by format." Four cards, one per format: the photograph, the name, the line, the price,
 * and a yellow bar to shop it. The whole card is one link.
 * Cards rise in with the page's reveal; hovering lifts one and leans its photo in.
 */

const SHOP: Record<string, string> = {
  "roll-labels": "Shop rolls",
  "sheet-labels": "Shop sheets",
  "circle-labels": "Shop seals",
  "custom-labels": "Shop any shape",
};
const ORDER = ["roll-labels", "sheet-labels", "circle-labels", "custom-labels"];

export function FormatCards({ products }: { products: Product[] }) {
  const items = ORDER.map((s) => products.find((p) => p.slug === s)).filter((p): p is Product => Boolean(p));
  return (
    <section className="shelf-sec fc-sec" aria-labelledby="by-format-title">
      <div className="sec-head">
        <h2 id="by-format-title" className="display sec-title" data-reveal>
          Or shop by format.
        </h2>
        <p className="sec-lede">Rolls for your packing line, sheets for small batches, seals for every box. Any shape, any size.</p>
      </div>
      <ul className="grid-cards grid-cards-4 fc-grid">
        {items.map((p) => (
          <li key={p.slug}>
            <Link href={`/shop/${p.slug}`} className="fc-card">
              <span className="fc-photo pcard-media" data-tone={p.tone}>
                <Image src={p.image.src} alt="" fill sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 92vw" />
              </span>
              <span className="fc-body">
                <span className="fc-name">{p.name}</span>
                <span className="fc-line">{p.tagline}</span>
                <CardPrice p={p} />
              </span>
              <span className="fc-go">
                {SHOP[p.slug]}
                <Arrow />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
