import Link from "next/link";
import { Arrow } from "@/components/site/Arrow";
import type { Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

/** Each label on the packaging it is made for, photographed as one series. */
export function ProductShowcase({ id, title, lede, products, more }: { id: string; title: string; lede?: string; products: Product[]; more?: { label: string; href: string } }) {
  return (
    <section className="show" aria-labelledby={id}>
      <div className="show-head">
        <div className="show-titles">
          <h2 id={id} className="display show-title" data-reveal>
            {title}
          </h2>
          {lede && <p className="sec-lede show-lede">{lede}</p>}
          {more && (
            <Link href={more.href} className="text-link">
              {more.label}
              <Arrow />
            </Link>
          )}
        </div>
      </div>
      <ul className="grid-cards grid-cards-3 show-grid">
        {products.map((p) => (
          <li key={p.slug}>
            <ProductCard p={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
