import type { CSSProperties } from "react";
import { Arrow } from "@/components/site/Arrow";
import { FROM, money } from "@/lib/facts";
import { Motion } from "@/components/site/Motion";
import { StickerArt } from "@/components/stickers/StickerArt";
import { stickerRatio } from "@/components/stickers/ratio";

/*
 * "Peel through what we print": the product range as a pad of labels. Scrolling peels the top
 * label off (fold, paper back, shadow) and throws it away, and the next one straightens up.
 * Without scripts, or with reduced motion, the same cards sit in a plain list.
 */

type Art = { id: string; x: number; y: number; w: number; rot: number };

type Product = {
  key: string;
  name: string;
  line: string;
  options: string;
  quote: { product: "stickers" | "labels"; shape: string };
  from: number; // 50 at 3 inches (src/lib/facts.ts)
  art: Art[];
};

// x/y: centre of the sticker in % of the art area; w: % of the card width
const PRODUCTS: Product[] = [
  {
    key: "die-cut",
    from: FROM.dieCut,
    name: "Die-cut stickers",
    line: "Cut right around your design, so the sticker is the shape of your art.",
    options: "Gloss, matte, holographic or glitter vinyl",
    quote: { product: "stickers", shape: "die-cut" },
    art: [
      { id: "fire-escape", x: 40, y: 46, w: 54, rot: -8 },
      { id: "fresh", x: 68, y: 74, w: 44, rot: 6 },
    ],
  },
  {
    key: "holo",
    from: FROM.holo,
    name: "Holographic and glitter",
    line: "Foil that shifts colour as it moves, and glitter that catches the light.",
    options: "Any shape, cut to your design",
    quote: { product: "stickers", shape: "die-cut" },
    art: [
      { id: "label-bros", x: 44, y: 42, w: 64, rot: -5 },
      { id: "new-burst", x: 76, y: 72, w: 30, rot: 12 },
    ],
  },
  {
    key: "seals",
    from: FROM.seals,
    name: "Packaging seals",
    line: "Seals and stickers for boxes, bags, mailers and coffee bags.",
    options: "Kraft, matte or gloss paper",
    quote: { product: "stickers", shape: "circle" },
    art: [
      { id: "thank-you", x: 34, y: 50, w: 48, rot: -6 },
      { id: "night-shift", x: 72, y: 48, w: 36, rot: 7 },
    ],
  },
  {
    key: "product-labels",
    from: FROM.labels,
    name: "Product labels",
    line: "Labels for jars, bottles, cans, tins and candles, in the size your packaging needs.",
    options: "Paper or vinyl, any shape",
    quote: { product: "labels", shape: "rectangle" },
    art: [
      { id: "hop-scotch", x: 28, y: 48, w: 36, rot: -5 },
      { id: "beeline", x: 64, y: 32, w: 34, rot: 6 },
      { id: "ember-oak", x: 64, y: 74, w: 42, rot: -3 },
    ],
  },
  {
    key: "business-labels",
    from: FROM.labels,
    name: "Business and safety labels",
    line: "Warning, ID, address and approval labels for the work behind the brand.",
    options: "Gloss vinyl or paper, any size",
    quote: { product: "labels", shape: "rectangle" },
    art: [
      { id: "caution", x: 46, y: 40, w: 64, rot: -4 },
      { id: "approved", x: 76, y: 72, w: 28, rot: 10 },
    ],
  },
];

// The pile: each card under the top one sits slightly off square.
const PILE = [
  { rot: 0, x: 0, y: 0 },
  { rot: -2.6, x: -10, y: 6 },
  { rot: 2.1, x: 12, y: 10 },
  { rot: -1.4, x: -4, y: 16 },
  { rot: 3, x: 8, y: 20 },
];

// Scroll distances, in svh: before the first peel, per card, after the last.
const LEAD = 14;
const STEP = 80;
const TAIL = 40;
const LABELS_AT = PRODUCTS.findIndex((p) => p.key === "product-labels");

export function Products() {
  const vars = {
    "--n": PRODUCTS.length,
    "--lead": `${LEAD}svh`,
    "--step": `${STEP}svh`,
    "--tail": `${TAIL}svh`,
  } as CSSProperties;

  return (
    <section
      id="stickers"
      aria-labelledby="products-title"
      className="deck"
      data-motion-root
      data-lead={LEAD}
      data-step={STEP}
      data-tail={TAIL}
      style={vars}
    >
      <Motion name="deck" />
      <div className="deck-track">
        <span id="product-labels" className="deck-anchor" style={{ ["--at" as string]: LABELS_AT }} />
        <div className="deck-stage">
          <div className="deck-intro">
            <h2 id="products-title" className="section-title">
              Peel through what we print.
            </h2>
            <p className="mt-5 max-w-[36ch] text-16 leading-[1.45] md:mt-7 md:text-18">
              Stickers for your brand, labels for your products. Every one cut to the shape you need.
            </p>
            <ul className="deck-index" aria-label="Products">
              {PRODUCTS.map((p, i) => (
                <li key={p.key}>
                  <button type="button" data-goto={i} aria-current={i === 0 ? "true" : undefined}>
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="deck-progress" aria-hidden="true">
              {PRODUCTS.map((p) => (
                <span key={p.key}>
                  <i />
                </span>
              ))}
            </div>
            <p className="deck-hint text-14 text-liner-soft">Scroll to peel the next one.</p>
          </div>

          <ul className="deck-pile">
            {PRODUCTS.map((p, i) => (
              <li
                key={p.key}
                data-card={i}
                className="deck-card"
                style={
                  {
                    "--i": i,
                    "--rot": `${PILE[i % PILE.length].rot}deg`,
                    "--x": `${PILE[i % PILE.length].x}px`,
                    "--y": `${PILE[i % PILE.length].y}px`,
                  } as CSSProperties
                }
              >
                <article data-face className="deck-face" aria-labelledby={`product-${p.key}`}>
                  <h3 id={`product-${p.key}`} className="deck-name">
                    {p.name}
                  </h3>
                  <div className="deck-art">
                    {p.art.map((a) => (
                      <StickerArt
                        key={a.id}
                        id={a.id}
                        ratio={stickerRatio(a.id)}
                        className="deck-sticker"
                        style={
                          {
                            left: `${a.x}%`,
                            top: `${a.y}%`,
                            "--w": `${a.w}%`,
                            "--ratio": stickerRatio(a.id),
                            "--r": `${a.rot}deg`,
                          } as CSSProperties
                        }
                      />
                    ))}
                  </div>
                  <div className="deck-body">
                    <p className="deck-line">{p.line}</p>
                    <p className="deck-options">{p.options}</p>
                    {/* the link sits left: the bottom-right corner is where the label peels */}
                    <div className="deck-foot">
                      <a
                        href="#pricing"
                        className="text-link"
                        data-quote-product={p.quote.product}
                        data-quote-shape={p.quote.shape}
                      >
                        Price these
                        <Arrow />
                      </a>
                      <p>
                        From <b>{money(p.from)}</b>
                      </p>
                    </div>
                  </div>
                </article>
                <div className="deck-flap-wrap" aria-hidden="true">
                  <div data-flap className="deck-flap">
                    <div data-shade className="deck-shade" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
