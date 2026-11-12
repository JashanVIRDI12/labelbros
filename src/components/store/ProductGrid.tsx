import type { ReactNode } from "react";
import type { Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

/** A titled grid of product photographs. */
export function ProductGrid({ id, title, lede, products, cols = 3, children }: { id: string; title: string; lede?: string; products: Product[]; cols?: 3 | 4; children?: ReactNode }) {
  if (!products.length) return null;
  return (
    <section className="shelf-sec" aria-labelledby={id}>
      <div className="sec-head">
        <h2 id={id} className="display sec-title" data-reveal>
          {title}
        </h2>
        {lede && <p className="sec-lede">{lede}</p>}
        {children}
      </div>
      <ul className={`grid-cards grid-cards-${cols}`}>
        {products.map((p) => (
          <li key={p.slug}>
            <ProductCard p={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
