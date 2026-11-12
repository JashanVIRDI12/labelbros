import Link from "next/link";
import { Arrow } from "@/components/site/Arrow";
import { MATERIALS, MIN_QTY, minQty } from "@/lib/options";
import type { Product } from "@/lib/products";
import { CardPrice } from "./Price";
import { ProductPhoto } from "./ProductMedia";

/*
 * A product in a grid: its picture on a tinted panel, name, one line, the price (each at 1,000
 * for labels) and where it goes. The whole card is one link.
 */

function spec(p: Product) {
  if (p.kind !== "custom") return null;
  if (p.range === "labels") return `Any size · ${p.defaults.format === "sheet" ? "On sheets" : "Rolls or sheets"} · From ${MIN_QTY.labels}`;
  const m = p.materials?.[0];
  const fin = m && MATERIALS[m].finishes.length > 1 ? "Gloss or matte · " : "";
  return `${fin}Any shape and size · From ${m ? minQty("stickers", m) : MIN_QTY.stickers}`;
}

function Body({ p }: { p: Product }) {
  const line = spec(p);
  return (
    <span className="pcard-body">
      <span className="pcard-name">{p.name}</span>
      <span className="pcard-line">{p.tagline}</span>
      {line && <span className="pcard-spec">{line}</span>}
      <span className="pcard-foot">
        <CardPrice p={p} />
        <span className="pcard-go" aria-hidden="true">
          <Arrow />
        </span>
      </span>
    </span>
  );
}

export function ProductCard({ p, priority = false }: { p: Product; priority?: boolean }) {
  const href = `/shop/${p.slug}`;
  return (
    <article className="pcard" data-tone={p.tone}>
      <Link href={href} className="pcard-link">
        <span className="pcard-media">
          <ProductPhoto p={p} priority={priority} />
          {p.badge && <span className="pcard-badge">{p.badge}</span>}
        </span>
        <Body p={p} />
      </Link>
    </article>
  );
}
