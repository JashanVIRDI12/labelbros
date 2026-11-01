/* eslint-disable @next/next/no-img-element -- pre-sized WebP artwork layers that GSAP animates; next/image would add wrappers and nothing to optimise */
import type { CSSProperties } from "react";
import { Arrow } from "@/components/site/Arrow";
import { Motion } from "@/components/site/Motion";

/*
 * "Labels that sell the product": a shelf of labelled products (sample brands). Scrolling the
 * page moves along the shelf; as each product comes into the middle, its label peels out beside
 * it, flat, with what it is printed on. Without scripts or with reduced motion it is a plain
 * sideways-scrolling row.
 */

type Bay = {
  id: string;
  product: string;
  what: string;
  spec: string;
  /** height on the shelf, as a share of the tallest product: a jar is shorter than a bottle */
  size: number;
  photo: { w: number; h: number };
  label: { w: number; h: number; rot: number };
};

// photo / label sizes are the exported artwork in px (aspect only)
const BAYS: Bay[] = [
  { id: "olive", product: "Old Harbor olive oil", what: "Bottle label", spec: "Cream laid paper, arched cut, gold foil", size: 1, photo: { w: 218, h: 900 }, label: { w: 301, h: 560, rot: -5 } },
  { id: "jam", product: "Sunday Jam Co.", what: "Jar label", spec: "Gloss paper, scalloped circle", size: 0.62, photo: { w: 705, h: 900 }, label: { w: 551, h: 560, rot: 5 } },
  { id: "kombucha", product: "Tidewater kombucha", what: "Wrap-around label", spec: "White vinyl, rounded rectangle", size: 0.94, photo: { w: 249, h: 900 }, label: { w: 560, h: 372, rot: -5 } },
  { id: "fern", product: "Wild Fern face oil", what: "Cosmetics label", spec: "Uncoated sage paper", size: 0.62, photo: { w: 278, h: 900 }, label: { w: 271, h: 560, rot: 5 } },
  { id: "candle", product: "Ember & Oak candle", what: "Candle label", spec: "Matte paper, oval", size: 0.58, photo: { w: 883, h: 810 }, label: { w: 560, h: 379, rot: -5 } },
  { id: "coffee", product: "Night Shift coffee", what: "Bag label", spec: "Matte paper, arch die-cut", size: 0.84, photo: { w: 547, h: 900 }, label: { w: 331, h: 560, rot: 5 } },
];

// Every flat label gets the same area (a share of the shelf height squared), whatever its shape,
// so a tall label and a wide one carry the same weight.
const LABEL_AREA = 0.09;
const labelBox = (l: Bay["label"]) => {
  const aspect = l.w / l.h;
  return { w: Math.sqrt(LABEL_AREA * aspect), h: Math.sqrt(LABEL_AREA / aspect) };
};

export function Labels() {
  return (
    <section id="labels" aria-labelledby="labels-title" className="shelf" data-motion-root>
      <Motion name="labels" />
      <div className="shelf-track">
        <div className="shelf-stage">
          <div className="shelf-head">
            <h2 id="labels-title" className="section-title">
              Labels that sell the product.
            </h2>
            <p className="shelf-lede">
              Product labels for bottles, jars, cans, tins and bags, on paper or vinyl, cut to fit your packaging.
              Every one starts with a free proof.
            </p>
          </div>

          <ul className="shelf-row" aria-label="Sample labels">
            {BAYS.map((b, i) => (
              <li
                key={b.id}
                className="shelf-bay"
                data-bay={i}
                style={
                  {
                    "--s": b.size,
                    "--lw": labelBox(b.label).w.toFixed(4),
                    "--lh": labelBox(b.label).h.toFixed(4),
                  } as CSSProperties
                }
              >
                <figure className="shelf-figure">
                  <div className="shelf-stand">
                    <div className="shelf-unit">
                      <img
                        className="shelf-label"
                        data-label
                        src={`/labels/${b.id}-label.webp`}
                        alt=""
                        width={b.label.w}
                        height={b.label.h}
                        loading="lazy"
                        decoding="async"
                        style={{ ["--r" as string]: `${b.label.rot}deg` } as CSSProperties}
                      />
                      <img
                        className="shelf-photo"
                        data-photo
                        src={`/labels/${b.id}.webp`}
                        alt={`${b.product}: ${b.what.toLowerCase()} (sample artwork)`}
                        width={b.photo.w}
                        height={b.photo.h}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                  <figcaption className="shelf-caption">
                    <span className="shelf-what">{b.what}</span>
                    <span className="shelf-spec">{b.spec}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
            <li className="shelf-bay shelf-end">
              <p className="shelf-end-title">Your product next.</p>
              <a href="#pricing" className="btn btn-primary" data-quote-product="labels" data-quote-shape="rectangle">
                Price your labels
                <Arrow />
              </a>
            </li>
          </ul>
          <div className="shelf-rule" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
