import type { CSSProperties } from "react";
import { Art } from "@/components/sheet/Art";
import { ART } from "@/components/stickers-page/art";
import type { Product } from "@/lib/products";
import { Price } from "@/components/site/Price";

/*
 * A product's picture, drawn from our own pieces: its pack in big type, sample stickers slapped on
 * a card in one of the house colours, and on deals a yellow burst with what you save. Sample
 * artwork, not customers. `large` is the product page's version.
 */

const PLACES: { x: number; y: number; w: number; r: number }[][] = [
  [{ x: 62, y: 60, w: 50, r: -8 }],
  [
    { x: 60, y: 54, w: 44, r: -9 },
    { x: 80, y: 76, w: 34, r: 8 },
  ],
  [
    { x: 54, y: 58, w: 36, r: -10 },
    { x: 78, y: 50, w: 30, r: 9 },
    { x: 72, y: 80, w: 30, r: -4 },
  ],
];

export function ProductArt({ p, large = false }: { p: Product; large?: boolean }) {
  const place = PLACES[Math.min(p.art.stickers.length, 3) - 1];
  const save = p.kind === "deal" && p.valueUsd && p.priceUsd ? p.valueUsd - p.priceUsd : 0;
  return (
    <div className="pa" data-tone={p.art.tone} data-large={large || undefined} data-emboss={p.art.emboss || undefined} data-effect={p.art.effect} aria-hidden="true">
      <span className="pa-dots" />
      {/* the big word shrinks to fit: about 107 ÷ its letters, in % of the card, at most 15 */}
      <p className="pa-head" style={{ "--fs": `${Math.min(15, 104 / Math.max(...p.art.headline[0].split(" ").map((w) => w.length)))}cqi` } as CSSProperties}>
        <b>{p.art.headline[0]}</b>
        <span>{p.art.headline[1]}</span>
      </p>
      {p.art.stickers.slice(0, 3).map((id, i) => {
        const pos = place[i];
        return (
          <span
            key={id}
            className="pa-sticker"
            style={{ "--x": `${pos.x}%`, "--y": `${pos.y}%`, "--w": `${pos.w}%`, "--r": `${pos.r}deg`, "--i": i } as CSSProperties}
          >
            <Art art={ART[id]} sizes={large ? "(max-width: 900px) 45vw, 320px" : "(max-width: 640px) 40vw, 180px"} />
          </span>
        );
      })}
      {save > 0 && (
        <span className="pa-burst">
          <small>Save</small>
          <Price usd={save} code={false} />
        </span>
      )}
      {p.kind === "deal" && p.priceUsd ? (
        <span className="pa-price">
          <small>Only</small>
          <Price usd={p.priceUsd} code={false} />
        </span>
      ) : null}
    </div>
  );
}
