import type { CSSProperties } from "react";
import { Arrow } from "@/components/site/Arrow";
import { SAMPLE_KIT, money } from "@/lib/facts";
import { Motion } from "@/components/site/Motion";
import { StickerArt } from "@/components/stickers/StickerArt";
import { stickerRatio } from "@/components/stickers/ratio";

/*
 * "Hold them before you order": the sample kit as a kraft mailer on the table. Scrolling in
 * pulls its tear strip across, the top tears off, and the samples burst out of the opening and
 * land around it (kit-motion.ts). Without scripts (or with reduced motion) it is already open.
 *
 * Geometry is in scene units (cqi: 1/100 of the scene's width). The mailer is 74 × 52, its top
 * left at (13, 50); everything inside it is placed in the mailer's own units.
 */

export const MAILER = { x: 13, y: 50, w: 74, h: 52, r: -4 };

// where each sample lands, in scene units: centre, width, turn, and how far it floats (parallax)
export const KIT = [
  { id: "thank-you", x: 15, y: 47, w: 21, r: -14, d: 8 },
  { id: "fire-escape", x: 30, y: 25, w: 26, r: -8, d: 14 },
  { id: "night-shift", x: 49, y: 17, w: 18, r: 4, d: 18 },
  { id: "label-bros", x: 70, y: 27, w: 33, r: 8, d: 12 },
  { id: "beeline", x: 87, y: 46, w: 19, r: 14, d: 10 },
  { id: "new-burst", x: 60, y: 45, w: 16, r: -10, d: 16 },
  { id: "fresh", x: 34, y: 51, w: 27, r: -6, d: 6 },
];

/** A torn edge: a ragged line across, as a clip-path. `top`: the tear is on the top edge. */
function torn(top: boolean, depth: number) {
  let seed = top ? 7 : 13;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pts: string[] = [];
  for (let x = 0; x <= 100; x += 1.6) {
    const y = (0.25 + rnd() * 0.75) * depth;
    pts.push(`${Math.min(100, x).toFixed(1)}% ${top ? `${y.toFixed(2)}%` : `${(100 - y).toFixed(2)}%`}`);
  }
  return top ? `polygon(${pts.join(",")},100% 100%,0 100%)` : `polygon(0 0,100% 0,${pts.reverse().join(",")})`;
}

const FRONT_EDGE = torn(true, 1.8);
const BAND_EDGE = torn(false, 12);

export function SampleKit() {
  return (
    <section id="samples" aria-labelledby="samples-title" className="kit" data-motion-root>
      <Motion name="kit" />
      <div className="kit-intro">
        <h2 id="samples-title" className="section-title">
          Hold them before you order.
        </h2>
        <p className="mt-5 max-w-[40ch] text-16 leading-[1.45] md:mt-7 md:text-18">
          A pack of real stickers and labels, sent to your door, so you can see the colours in daylight and feel
          the finishes before you choose.
        </p>
      </div>

      <div className="kit-action">
        <ul className="kit-facts">
          <li>15 sample stickers, in 2, 3 or 4 inches</li>
          <li>{money(SAMPLE_KIT.price)} for the kit</li>
          <li>Ships in 2–4 business days</li>
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
          {/* no checkout yet: the kit is ordered through the pricing builder */}
          <a href="#pricing" className="btn btn-primary">
            Order a sample kit
            <Arrow />
          </a>
          <a href="#pricing" className="text-link">
            Or get instant pricing
          </a>
        </div>
      </div>

      <div className="kit-scene" aria-hidden="true" data-kit-scene>
        <div
          className="mailer"
          data-mailer
          data-open
          style={
            {
              "--mx": MAILER.x,
              "--my": MAILER.y,
              "--mw": MAILER.w,
              "--mh": MAILER.h,
              "--mr": `${MAILER.r}deg`,
              "--front-edge": FRONT_EDGE,
              "--band-edge": BAND_EDGE,
            } as CSSProperties
          }
        >
          <div className="mailer-drop" data-drop>
            <span className="mailer-shadow" />
            {/* the inside of the mailer, printed: you only see it once it is torn open */}
            <span className="mailer-inside" />

            <div className="kit-samples">
              {KIT.map((k, i) => (
                <div
                  key={k.id}
                  className="kit-sample"
                  data-sample={i}
                  style={
                    {
                      "--x": k.x - MAILER.x,
                      "--y": k.y - MAILER.y,
                      "--w": k.w,
                      "--r": `${k.r - MAILER.r}deg`,
                      "--d": k.d,
                    } as CSSProperties
                  }
                >
                  <div className="kit-sample-move" data-move>
                    <div className="kit-sample-lift">
                      <StickerArt id={k.id} ratio={stickerRatio(k.id)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* the front: kraft, printed with the wordmark, a shipping label and our sticker on it */}
            <div className="mailer-front">
              <div className="mailer-paper mailer-front-paper">
                <span className="mailer-print">
                  <b>Label Bros</b>
                  <span>Stickers and labels. Handle with care.</span>
                </span>
                <span className="mailer-label">
                  <b>Sample kit</b>
                  <span>Stickers and labels</span>
                  <i />
                  <small>To</small>
                  <strong>You</strong>
                  <span className="mailer-barcode" />
                </span>
                <span className="mailer-sticker logo">
                  <span>Label</span> <span>Bros</span>
                </span>
              </div>
            </div>

            {/* above the tear strip: torn off and tossed when the strip comes away */}
            <div className="mailer-band" data-band>
              <div className="mailer-paper mailer-band-paper" />
            </div>

            {/* the tear strip and its tab */}
            <div className="mailer-strip">
              <span>Pull to open › › ›</span>
              <span>Pull to open › › ›</span>
              <span>Pull to open › › ›</span>
            </div>
            <div className="mailer-tab">
              <div className="mailer-tab-in" data-tab>
                <i className="mailer-tab-tail" />
                <span>Pull</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
