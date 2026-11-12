import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/site/Arrow";
import { Motion } from "@/components/site/Motion";
import { CardPrice } from "@/components/store/Price";
import type { Product } from "@/lib/products";

/*
 * "Stickers, by material." Six cards, one per material: the sticker's photograph with a die-cut
 * tag on it made of the material itself (vinyl, clear, holographic, glitter, kraft, metal), the
 * name, the line, the price and a yellow bar to shop it. The cards rise in with the page's
 * reveal; then a light passes across each tag in turn, and on a computer the light follows the
 * pointer over the card (sticker-motion.ts, a CSS variable the tags' sheen reads).
 */

const LOOK: Record<string, { look: string; tag: string; shop: string }> = {
  "vinyl-stickers": { look: "vinyl", tag: "Vinyl", shop: "Shop vinyl" },
  "clear-stickers": { look: "clear", tag: "Clear", shop: "Shop clear" },
  "holographic-stickers": { look: "holo", tag: "Holographic", shop: "Shop holographic" },
  "glitter-stickers": { look: "glitter", tag: "Glitter", shop: "Shop glitter" },
  "kraft-stickers": { look: "kraft", tag: "Kraft", shop: "Shop kraft" },
  "metallic-stickers": { look: "metal", tag: "Silver & gold", shop: "Shop metallic" },
};

export function StickerCards({ products }: { products: Product[] }) {
  const items = products.filter((p) => LOOK[p.slug]);
  return (
    <section className="shelf-sec sm-sec" aria-labelledby="sm-title" data-motion-root>
      <Motion name="stickers" />
      <div className="sec-head">
        <div className="sm-head">
          <h2 id="sm-title" className="display sec-title" data-reveal>
            Stickers, by material.
          </h2>
          <p className="sec-lede">Pick what it&apos;s printed on, then any shape and size.</p>
        </div>
        <Link href="/stickers" className="text-link">
          All stickers
          <Arrow />
        </Link>
      </div>
      <ul className="grid-cards grid-cards-3 sm-grid">
        {items.map((p) => {
          const m = LOOK[p.slug];
          return (
            <li key={p.slug}>
              <Link href={`/shop/${p.slug}`} className="sm-card" data-sm-card>
                <span className="sm-photo pcard-media" data-tone={p.tone}>
                  <Image src={p.image.src} alt={p.image.alt} fill sizes="(min-width: 1024px) 31vw, 46vw" />
                  <span className="sm-tag" data-look={m.look}>
                    {m.tag}
                  </span>
                </span>
                <span className="sm-body">
                  <span className="sm-name">{p.name}</span>
                  <span className="sm-line">{p.tagline}</span>
                  <CardPrice p={p} />
                </span>
                <span className="sm-go">
                  {m.shop}
                  <Arrow />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
