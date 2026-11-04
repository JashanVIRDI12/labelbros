import type { CSSProperties } from "react";
import Link from "next/link";
import { FROM, money } from "@/lib/facts";
import { Cell } from "@/components/sheet/Cell";
import { Arrow } from "@/components/site/Arrow";
import { Motion } from "@/components/site/Motion";
import { Art } from "@/components/sheet/Art";
import { ART } from "@/components/stickers-page/art";
import { LABELS, maskOf, quoteHref } from "./art";
import { LabelArt } from "./LabelArt";
import { LabelSizeCell } from "./LabelSizeCell";

/*
 * The labels page as one web of labels on their liner. Each label is put on the way labels are:
 * held by its top edge, then smoothed down from the top as it scrolls in (web-motion.ts). The
 * order is the case for buying: what a label does for the product (wrap, shelf, shape, finish),
 * what it is made of and how it is checked (material, proof, size), then the kit and the yellow
 * label that prices it. Without scripts or with reduced motion every label is already on.
 */

const SLICES = 28; // strips of the wrap-around label, bent round the bottle in 3D

const SWATCHES = [
  { id: "laid", name: "Laid" },
  { id: "gloss", name: "Gloss" },
  { id: "uncoated", name: "Uncoated" },
  { id: "vinyl", name: "Vinyl" },
  { id: "kraft", name: "Kraft" },
];

export function LabelWeb() {
  return (
    <section aria-labelledby="web-title" className="web-stage" data-motion-root>
      <Motion name="web" />
      <h2 id="web-title" className="sr-only">
        Label options
      </h2>

      <div className="web-wrap">
        <div className="web" data-web>
          <ul className="web-grid">
            {/* ------------------------------------------------------------ what it does */}
            <Cell area="wrap" tone="deep">
              <div className="cell-copy">
                <h3 className="cell-title cell-title-xl">Wraps right round</h3>
                <p className="cell-text">
                  Wrap-around labels for bottles, cans and jars, sized to go right round your container.
                </p>
                <p className="cell-note">
                  <span className="hint-pointer">Move across the bottle to turn it.</span>
                  <span className="hint-touch">Keep scrolling to wrap it round.</span>
                </p>
              </div>
              <Link href={quoteHref({ shape: "rectangle" })} className="text-link cell-link">
                Price wrap-around labels
                <Arrow />
              </Link>
              <div className="cell-art" data-art aria-hidden="true">
                <div className="wrap-stage" data-wrap>
                  <LabelArt id="kombucha" className="wrap-bottle" />
                  {/* plain glass over the photo's own printed label, so only ours is ever seen */}
                  <span className="wrap-glass" />
                  <div
                    className="wrap-label"
                    style={{ "--src": `url(${LABELS["kombucha-label"].src})`, "--n": SLICES } as CSSProperties}
                  >
                    <LabelArt id="kombucha-label" className="wrap-flat" />
                    <div className="wrap-spin" data-wrap-spin>
                      {Array.from({ length: SLICES }, (_, i) => (
                        <i key={i} className="wrap-slice" style={{ "--i": i } as CSSProperties} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Cell>

            <Cell area="shelf" tone="liner">
              <div className="cell-copy">
                <h3 className="cell-title">Picked up first</h3>
                <p className="cell-text">The label people notice is the one they reach for.</p>
              </div>
              <div className="cell-art" data-art aria-hidden="true">
                <div className="mini-shelf" data-shelf>
                  <LabelArt id="olive" className="shelf-a" />
                  <LabelArt id="jam" className="shelf-b" />
                  <LabelArt id="coffee" className="shelf-c" />
                  <span className="mini-shelf-board" />
                </div>
              </div>
            </Cell>

            <Cell area="shapes" tone="liner">
              <div className="cell-copy">
                <h3 className="cell-title">Any shape</h3>
                <p className="cell-text">Circles, ovals, arches, scallops, or cut to your outline.</p>
              </div>
              <div className="cell-art" data-art aria-hidden="true">
                <div className="fan" data-fan>
                  <LabelArt id="fern-label" className="fan-1" />
                  <LabelArt id="coffee-label" className="fan-2" />
                  <LabelArt id="candle-label" className="fan-3" />
                  <LabelArt id="jam-label" className="fan-4" />
                </div>
              </div>
            </Cell>

            <Cell area="foil" tone="ink">
              <div className="cell-copy">
                <h3 className="cell-title">Foil and finish</h3>
                <p className="cell-text">Gold foil on textured laid paper, or a soft uncoated stock.</p>
              </div>
              <Link href={quoteHref({ shape: "rectangle" })} className="text-link cell-link">
                Price these labels
                <Arrow />
              </Link>
              <div className="cell-art" data-art aria-hidden="true">
                <div className="foil-pair">
                  <span className="foil-olive" data-foil style={{ "--mask": maskOf("olive-label") } as CSSProperties}>
                    <LabelArt id="olive-label" />
                    <span className="glare glare-sharp" />
                  </span>
                  <LabelArt id="fern-label" className="foil-fern" />
                  <span className="finish-tag foil-tag-a">Gold foil</span>
                  <span className="finish-tag foil-tag-b">Uncoated</span>
                </div>
              </div>
            </Cell>

            {/* ------------------------------------------------------------ what it's made of, checked */}
            <Cell area="stock" tone="liner">
              <div className="cell-copy">
                <h3 className="cell-title">Paper or vinyl</h3>
                <p className="cell-text">Laid, gloss and uncoated papers, white vinyl and kraft.</p>
              </div>
              <div className="cell-art" data-art aria-hidden="true">
                <div className="swatches" data-swatches>
                  {SWATCHES.map((s, i) => (
                    <span key={s.id} className={`swatch swatch-${s.id}`} style={{ "--i": i } as CSSProperties}>
                      <b>{s.name}</b>
                    </span>
                  ))}
                  <span className="swatch-pin" />
                </div>
              </div>
            </Cell>

            <Cell area="proof" tone="liner">
              <div className="cell-copy">
                <h3 className="cell-title">Check every word</h3>
                <p className="cell-text">
                  Read the ingredients, weights and barcode on a free proof. Nothing prints until you approve it.
                </p>
              </div>
              <div className="cell-art" data-art aria-hidden="true">
                <div className="back-label" data-checks>
                  <p className="bl-title">Strawberry &amp; vanilla jam</p>
                  <ul className="bl-lines">
                    <li>
                      <i className="tick" data-tick />
                      <span>Ingredients: strawberries, cane sugar, lemon juice, vanilla, fruit pectin.</span>
                    </li>
                    <li>
                      <i className="tick" data-tick />
                      <span>Keep in the fridge once opened.</span>
                    </li>
                    <li>
                      <i className="tick" data-tick />
                      <span className="barcode" />
                    </li>
                  </ul>
                  <Art art={ART.approved} className="bl-seal" data-slap />
                </div>
              </div>
            </Cell>

            <Cell area="size" tone="deep">
              <LabelSizeCell />
            </Cell>

            <Cell area="kit" tone="ink">
              <div className="cell-copy">
                <h3 className="cell-title">Feel them first</h3>
                <p className="cell-text">A pack of real stickers and labels, sent to your door.</p>
              </div>
              <Link href="/#samples" className="text-link cell-link">
                Order a sample kit
                <Arrow />
              </Link>
              <div className="cell-art" aria-hidden="true">
                <div className="mini-kit">
                  <span className="mini-kit-back" />
                  <LabelArt id="coffee-label" className="mini-kit-a" />
                  <LabelArt id="jam-label" className="mini-kit-b" />
                  <LabelArt id="candle-label" className="mini-kit-c" />
                  <span className="mini-kit-front" />
                </div>
              </div>
            </Cell>

            {/* ------------------------------------------------------------ do it */}
            <Cell area="price" tone="signal">
              <h3 className="cell-title price-title">Price your labels</h3>
              <p className="price-ticket">
                <span className="price-ticket-what">Product labels</span>
                <span className="price-ticket-spec">Your shape, size and material. Free proof included.</span>
                <span className="price-ticket-price">
                  From <span className="price-amount">{money(FROM.labels)}</span>
                </span>
              </p>
              <div className="price-foot">
                <p className="cell-text">Pick a shape, size, quantity and finish and see your price straight away.</p>
                <Link href={quoteHref({ shape: "rectangle" })} className="price-cta">
                  Get instant pricing
                  <Arrow />
                </Link>
              </div>
            </Cell>
          </ul>
        </div>
      </div>
    </section>
  );
}
