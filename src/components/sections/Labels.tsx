/* eslint-disable @next/next/no-img-element -- pre-sized WebP artwork layers that GSAP animates; next/image would add wrappers and nothing to optimise */
import Link from "next/link";
import type { CSSProperties } from "react";
import { Arrow } from "@/components/site/Arrow";
import { Motion } from "@/components/site/Motion";

/*
 * "Labels that sell the product": one shelf of plain containers (sample brands). Scrolling
 * labels them one at a time: the flat label comes down onto its container, is smoothed on
 * (a shine follows the squeegee) and the product is finished; a shelf tag says what the label is
 * printed on. The last spot on the shelf is empty: "Your product next", with the button
 * (labels-motion.ts). Without scripts or with reduced motion every product is already labelled,
 * with its caption under it.
 */

type Bay = {
  id: string;
  product: string;
  what: string;
  spec: string;
  /** height on the shelf, as a share of the tallest product: a jar is shorter than a bottle */
  size: number;
  /** the product photos (labelled and bare are the same size), and the flat label, in px */
  photo: { w: number; h: number };
  label: { w: number; h: number };
  /** where the label sits on the product: left, top, width, height, in % of the photo */
  spot: [number, number, number, number];
  /** a wrap-around label: it lands flat, wider than the bottle, and wraps round it */
  wrap?: boolean;
};

const BAYS: Bay[] = [
  { id: "olive", product: "Old Harbor olive oil", what: "Bottle label", spec: "Cream laid paper, arched cut, gold foil", size: 1, photo: { w: 218, h: 900 }, label: { w: 301, h: 560 }, spot: [9.2, 38.3, 81.7, 43.6] },
  { id: "jam", product: "Sunday Jam Co.", what: "Jar label", spec: "Gloss paper, scalloped circle", size: 0.62, photo: { w: 705, h: 900 }, label: { w: 551, h: 560 }, spot: [22.7, 36, 56, 50.6] },
  { id: "kombucha", product: "Tidewater kombucha", what: "Wrap-around label", spec: "White vinyl, rounded rectangle", size: 0.94, photo: { w: 249, h: 900 }, label: { w: 560, h: 372 }, spot: [4.4, 52, 91.6, 34.1], wrap: true },
  { id: "fern", product: "Wild Fern face oil", what: "Cosmetics label", spec: "Uncoated sage paper", size: 0.62, photo: { w: 278, h: 900 }, label: { w: 271, h: 560 }, spot: [5.8, 48.3, 87.8, 42.4] },
  { id: "candle", product: "Ember & Oak candle", what: "Candle label", spec: "Matte paper, oval", size: 0.58, photo: { w: 883, h: 810 }, label: { w: 560, h: 379 }, spot: [12.2, 27.4, 47, 48.8] },
  { id: "coffee", product: "Night Shift coffee", what: "Bag label", spec: "Matte paper, arch die-cut", size: 0.84, photo: { w: 547, h: 900 }, label: { w: 331, h: 560 }, spot: [22.5, 31.1, 54.3, 46.8] },
];

// widths on the shelf, in shelf heights: the whole row (one shelf), and the wider half (two)
const width = (b: Bay) => (b.size * b.photo.w) / b.photo.h;
const sum = (bays: Bay[]) => bays.reduce((n, b) => n + width(b), 0);
const HALF = Math.ceil(BAYS.length / 2);
const ROW = sum(BAYS);
const HALF_ROW = Math.max(sum(BAYS.slice(0, HALF)), sum(BAYS.slice(HALF)));

export function Labels() {
  return (
    <section
      id="labels"
      aria-labelledby="labels-title"
      className="shelf"
      data-motion-root
      style={{ "--sum": ROW.toFixed(3), "--half": HALF_ROW.toFixed(3) } as CSSProperties}
    >
      <Motion name="labels" />
      <div className="shelf-track">
        <div className="shelf-stage">
          <div className="shelf-head">
            <h2 id="labels-title" className="section-title">
              Labels that sell the product.
            </h2>
            <div>
              <p className="shelf-lede">
                Product labels for bottles, jars, cans, tins and bags, on paper or vinyl, cut to fit your packaging.
                Every one starts with a free proof.
              </p>
              <Link href="/labels" className="text-link shelf-more">
                See every label
                <Arrow />
              </Link>
            </div>
          </div>

          <div className="shelf-area" data-shelf-area>
            <ul className="shelf-row" aria-label="Sample labels">
              {BAYS.map((b, i) => (
                <Bay key={b.id} bay={b} i={i} />
              )).flatMap((el, i) =>
                // on phones the shelf is two shelves of three
                i === HALF - 1 ? [el, <li key="break" className="shelf-break" aria-hidden="true" />] : [el],
              )}
            </ul>

            {/* the shelf tag for the product just labelled (scripts move it along; captions stay for screen readers) */}
            <p className="shelf-now" data-now aria-hidden="true">
              <b data-now-what>{BAYS[0].what}</b>
              <span data-now-spec>{BAYS[0].spec}</span>
            </p>

            <div className="shelf-you" data-you>
              <span className="shelf-you-solid" data-you-solid aria-hidden="true" />
              <p className="shelf-you-title">Your product next.</p>
              <span className="shelf-you-move" data-you-move>
                <a href="#pricing" className="btn btn-primary" data-quote-product="labels" data-quote-shape="rectangle">
                  Price your labels
                  <Arrow />
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bay({ bay: b, i }: { bay: Bay; i: number }) {
  const [x, y, w, h] = b.spot;
  return (
    <li
      className="shelf-bay"
      data-bay={i}
      data-what={b.what}
      data-spec={b.spec}
      data-edge={i === 0 || i === HALF ? "start" : i === HALF - 1 || i === BAYS.length - 1 ? "end" : undefined}
      style={{ "--s": b.size, "--pa": `${b.photo.w} / ${b.photo.h}` } as CSSProperties}
    >
      <figure className="shelf-figure">
        <div className="shelf-stand">
          <div className="shelf-unit">
            <div className="shelf-photos" data-photos>
              <img
                className="shelf-bare"
                src={`/labels/${b.id}-bare.webp`}
                alt=""
                width={b.photo.w}
                height={b.photo.h}
                loading="lazy"
                decoding="async"
              />
              <img
                className="shelf-full"
                data-full
                src={`/labels/${b.id}.webp`}
                alt={`${b.product}: ${b.what.toLowerCase()} (sample artwork)`}
                width={b.photo.w}
                height={b.photo.h}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div
              className="shelf-spot"
              aria-hidden="true"
              style={{ "--x": `${x}%`, "--y": `${y}%`, "--w": `${w}%`, "--h": `${h}%` } as CSSProperties}
            >
              <div
                className="shelf-fly"
                data-fly
                data-wrap={b.wrap || undefined}
                style={{ "--la": `${b.label.w} / ${b.label.h}` } as CSSProperties}
              >
                <img
                  src={`/labels/${b.id}-label.webp`}
                  alt=""
                  width={b.label.w}
                  height={b.label.h}
                  loading="lazy"
                  decoding="async"
                  data-flat
                />
                <span className="shelf-shine" data-shine style={{ "--mask": `url(/labels/${b.id}-label.webp)` } as CSSProperties}>
                  <i data-shine-bar />
                </span>
              </div>
            </div>
          </div>
        </div>
        <figcaption className="shelf-caption">
          <span className="shelf-what">{b.what}</span>
          <span className="shelf-spec">{b.spec}</span>
        </figcaption>
      </figure>
    </li>
  );
}
