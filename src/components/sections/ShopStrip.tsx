import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
import { Arrow } from "@/components/site/Arrow";
import { PROOF, SHIPPING, SHIPS } from "@/lib/facts";
import { PRODUCTS } from "@/lib/products";

/*
 * Right under the hero, shop style: what you can buy and what it costs. A trust line, the packs
 * as cards (the quickest buy), then build-your-own shortcuts and the way into the whole shop.
 */
export function ShopStrip() {
  const deals = PRODUCTS.filter((p) => p.kind === "deal");
  const custom = PRODUCTS.filter((p) => p.kind === "custom");
  return (
    <section id="shop" className="strip" aria-labelledby="strip-title">
      <ul className="strip-trust" aria-label="Every order">
        <li>{PROOF}</li>
        <li>{SHIPS}</li>
        <li>{SHIPPING}</li>
        <li>Upload your design or we design it</li>
      </ul>
      <div className="strip-head">
        <h2 id="strip-title" className="section-title">
          Shop the packs.
        </h2>
        <Link href="/shop" className="text-link strip-all">
          Shop all
          <Arrow />
        </Link>
      </div>
      <ul className="shop-grid strip-grid">
        {deals.map((p) => (
          <li key={p.slug}>
            <ProductCard p={p} />
          </li>
        ))}
      </ul>
      <div className="strip-own">
        <p className="strip-own-title">Or build your own:</p>
        <ul className="strip-own-list">
          {custom.map((p) => (
            <li key={p.slug}>
              <Link href={`/shop/${p.slug}`} className="strip-chip">
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
