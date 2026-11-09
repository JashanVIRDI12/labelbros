import Link from "next/link";
import { Arrow } from "@/components/site/Arrow";
import { Price } from "@/components/site/Price";
import { fromPriceUsd, type Product } from "@/lib/products";
import { ProductArt } from "./ProductArt";

/** A product in the shop grid: its picture, name, line and price; the whole card opens it. */
export function ProductCard({ p }: { p: Product }) {
  return (
    <article className="pcard">
      <Link href={`/shop/${p.slug}`} className="pcard-link">
        <span className="pcard-art">
          <ProductArt p={p} />
        </span>
        <span className="pcard-body">
          {p.badge && <span className="pcard-badge">{p.badge}</span>}
          <b className="pcard-name">{p.name}</b>
          <span className="pcard-line">{p.tagline}</span>
          <span className="pcard-foot">
            <span className="pcard-price">
              {p.kind === "custom" && <small>From </small>}
              <b>
                <Price usd={fromPriceUsd(p)} />
              </b>
              {p.kind === "deal" && p.valueUsd ? (
                <s>
                  <Price usd={p.valueUsd} code={false} />
                </s>
              ) : null}
            </span>
            <span className="pcard-go">
              {p.kind === "deal" ? "Buy now" : "Choose size"}
              <Arrow />
            </span>
          </span>
        </span>
      </Link>
    </article>
  );
}
