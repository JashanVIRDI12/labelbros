import type { CSSProperties } from "react";
import { Cell } from "@/components/sheet/Cell";
import Link from "next/link";
import { FROM_USD } from "@/lib/facts";
import { Price } from "@/components/site/Price";
import { Arrow } from "@/components/site/Arrow";
import { Motion } from "@/components/site/Motion";
import { maskOf, quoteHref } from "./art";
import { SizeCell } from "./SizeCell";
import { Sticker } from "./Sticker";
import { SAMPLE_KIT_ON } from "@/lib/site";
import { DESIGN_HREF } from "@/components/site/SecondAsk";

/*
 * The stickers page as one kiss-cut sheet: every cell of the grid is a sticker on the sheet's
 * liner, and the order is the case for buying. First the things people want (shape, foil,
 * seals, finish), then why it is easy (your art or ours, any size), then why it is safe (a free
 * proof, a sample kit), and last the yellow sticker that prices it.
 *
 * Motion (sheet-motion.ts, loaded near the sheet): the sheet stands up off the table as it
 * scrolls in, each cell slaps down onto it, and cells tilt, lift and peel under the pointer.
 * Without scripts or with reduced motion it is the same grid, flat and still.
 */

const mask = (id: Parameters<typeof maskOf>[0]) => ({ "--mask": maskOf(id) }) as CSSProperties;

export function StickerSheet() {
  return (
    <section aria-labelledby="sheet-title" className="sheet-stage" data-motion-root>
      <Motion name="sheet" />
      <h2 id="sheet-title" className="sr-only">
        Sticker options
      </h2>

      <div className="sheet" data-sheet>
        <ul className="sheet-grid">
          {/* ---------------------------------------------------------------- want it */}
          <Cell area="die" tone="liner">
            <div className="cell-copy">
              <h3 className="cell-title cell-title-xl">Die-cut to your shape</h3>
              <p className="cell-text">
                Cut right around your design, so the sticker is the shape of your art, not a square around it.
              </p>
            </div>
            <Link href={quoteHref({ shape: "die-cut" })} className="text-link cell-link">
              Order die-cut stickers
              <Arrow />
            </Link>
            <div className="cell-art" data-art aria-hidden="true">
              {/* lift it and the liner shows where it was cut */}
              <span className="lifter die-main" style={mask("fire-escape")}>
                <span className="footprint" />
                <Sticker id="fire-escape" />
              </span>
              <Sticker id="beeline" className="die-hex" />
              <Sticker id="hop-scotch" className="die-tall" />
            </div>
          </Cell>

          <Cell area="holo" tone="deep">
            <div className="cell-copy">
              <h3 className="cell-title">Holo and glitter</h3>
              <p className="cell-text">Foil that changes colour as it moves. Glitter that catches the light.</p>
            </div>
            <Link href={quoteHref({ finish: "holo" })} className="text-link cell-link">
              Order holographic
              <Arrow />
            </Link>
            <div className="cell-art" data-art aria-hidden="true">
              <span className="foil holo-main" data-holo style={mask("label-bros")}>
                <Sticker id="label-bros" />
                <span className="glare" />
              </span>
              <span className="holo-burst" data-burst>
                <Sticker id="new-burst" />
                <span className="sparkles" data-sparkles />
              </span>
            </div>
          </Cell>

          <Cell area="seal" tone="ink">
            <div className="cell-copy">
              <h3 className="cell-title">Packaging seals</h3>
              <p className="cell-text">Kraft or vinyl seals that close boxes, bags and mailers.</p>
            </div>
            <Link href={quoteHref({ shape: "circle" })} className="text-link cell-link">
              Order seals
              <Arrow />
            </Link>
            <div className="cell-art" data-art aria-hidden="true">
              {/* the front of a black mailer box, under its lid */}
              <span className="seam" />
              <Sticker id="thank-you" className="seal-sticker" data-slap />
            </div>
          </Cell>

          <Cell area="fin" tone="liner">
            <div className="cell-copy">
              <h3 className="cell-title">Gloss or matte</h3>
              <p className="cell-text">
                Gloss makes colour jump and catches the light. Matte keeps it soft, with no glare.
              </p>
            </div>
            <Link href={quoteHref({ finish: "matte" })} className="text-link cell-link">
              Order in your finish
              <Arrow />
            </Link>
            <div className="cell-art" data-art aria-hidden="true">
              <div className="finish" data-finish style={mask("fresh")}>
                <span className="finish-copy finish-matte">
                  <Sticker id="fresh" />
                  <span className="grain" />
                  <span className="glare glare-soft" />
                </span>
                <span className="finish-copy finish-gloss">
                  <Sticker id="fresh" />
                  <span className="glare glare-sharp" />
                </span>
                <span className="finish-split" />
                <span className="finish-tag finish-tag-matte">Matte</span>
                <span className="finish-tag finish-tag-gloss">Gloss</span>
              </div>
            </div>
          </Cell>

          {/* ---------------------------------------------------------------- it's easy */}
          <Cell area="ours" tone="liner">
            <div className="cell-copy">
              <h3 className="cell-title">Your art, or ours</h3>
              <ul className="cell-options">
                <li>
                  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M10 13V3M5.5 7.5 10 3l4.5 4.5M3 13v4h14v-4" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>
                    <strong>Send your file.</strong> PDF, AI, EPS, SVG, PNG or JPG.
                  </span>
                </li>
                <li>
                  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="m3 17 1-4.5L13.5 3 17 6.5 7.5 16 3 17ZM11.5 5l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                  <span>
                    <strong>Or let our designers make it,</strong> from a sketch or just an idea.
                  </span>
                </li>
              </ul>
            </div>
            <div className="cell-art" data-art aria-hidden="true">
              <div className="ink" data-ink>
                <Sticker id="liftoff-sketch" className="ink-sketch" />
                <Sticker id="liftoff" className="ink-final" />
                <span className="ink-edge" />
              </div>
            </div>
          </Cell>

          {/* ---------------------------------------------------------------- it's safe */}
          <Cell area="proof" tone="liner">
            <div className="cell-copy">
              <h3 className="cell-title">Free proof first</h3>
              <p className="cell-text">Nothing prints until you approve it.</p>
            </div>
            <div className="cell-art" data-art aria-hidden="true">
              <div className="mini-proof">
                <Sticker id="night-shift" className="mini-proof-art" />
                <Sticker id="approved" className="mini-proof-seal" data-slap />
              </div>
            </div>
          </Cell>

          <Cell area="size" tone="deep">
            <SizeCell />
          </Cell>

          <Cell area="kit" tone="ink">
            {SAMPLE_KIT_ON ? (
              <>
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
                <Sticker id="hop-scotch" className="mini-kit-a" />
                <Sticker id="night-shift" className="mini-kit-b" />
                <Sticker id="fire-escape" className="mini-kit-c" />
                <span className="mini-kit-front" />
              </div>
            </div>
              </>
            ) : (
              <>
                <div className="cell-copy">
                  <h3 className="cell-title">We design it</h3>
                  <p className="cell-text">No artwork? Send an idea and our designers draw it. You approve a proof, and we call if anything needs changing.</p>
                </div>
                <Link href={DESIGN_HREF} className="text-link cell-link">
                  Start your design
                  <Arrow />
                </Link>
              </>
            )}
          </Cell>

          {/* ---------------------------------------------------------------- do it */}
          <Cell area="price" tone="signal">
            <h3 className="cell-title price-title">Order your stickers</h3>
            {/* a price label stuck on the yellow: what the click gives you */}
            <p className="price-ticket">
              <span className="price-ticket-what">Die-cut stickers</span>
              <span className="price-ticket-spec">Your shape, size and finish. Free proof included.</span>
              <span className="price-ticket-price">
                From <span className="price-amount"><Price usd={FROM_USD.dieCut} /></span>
              </span>
            </p>
            <div className="price-foot">
              <p className="cell-text">Upload your design, pick a shape, size and finish, and pay. Free proof before we print.</p>
              {/* the whole yellow sticker is this link (its ::after covers the cell) */}
              <Link href={quoteHref()} className="price-cta">
                Upload and order
                <Arrow />
              </Link>
            </div>
          </Cell>
        </ul>
      </div>
    </section>
  );
}
