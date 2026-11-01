import type { CSSProperties } from "react";
import { Arrow } from "@/components/site/Arrow";
import { Motion } from "@/components/site/Motion";
import { StickerArt } from "@/components/stickers/StickerArt";
import { stickerRatio } from "@/components/stickers/ratio";

/*
 * "Hold them before you order": the sample kit as a real envelope. Scrolling in peels the seal,
 * opens the flap and fans the samples out like a hand of cards.
 * Without scripts (or with reduced motion) the samples are already out.
 */

// where each sample lands, in fractions of the scene width from the envelope mouth
export const KIT = [
  { id: "thank-you", x: -0.36, y: -0.26, r: -20, w: 0.24 },
  { id: "fire-escape", x: -0.25, y: -0.48, r: -12, w: 0.26 },
  { id: "night-shift", x: -0.08, y: -0.58, r: -5, w: 0.22 },
  { id: "label-bros", x: 0.12, y: -0.56, r: 4, w: 0.33 },
  { id: "beeline", x: 0.3, y: -0.43, r: 12, w: 0.22 },
  { id: "new-burst", x: 0.38, y: -0.22, r: 20, w: 0.19 },
];

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
          <li>
            <span className="ph">[[What is in the kit]]</span>
          </li>
          <li>
            <span className="ph">[[Kit price]]</span>
          </li>
          <li>
            <span className="ph">[[Delivery time]]</span>
          </li>
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
          {/* [[SAMPLE_KIT_URL]] */}
          <a href="#[[SAMPLE_KIT_URL]]" className="btn btn-primary">
            Order a sample kit
            <Arrow />
          </a>
          <a href="#pricing" className="text-link">
            Or get instant pricing
          </a>
        </div>
      </div>

      <div className="kit-scene" aria-hidden="true">
        <div className="kit-envelope">
          <div className="kit-back" />
          <div className="kit-samples">
            {KIT.map((k, i) => (
              <div
                key={k.id}
                data-sample={i}
                className="kit-sample"
                style={
                  {
                    "--x": k.x,
                    "--y": k.y,
                    "--r": `${k.r}deg`,
                    "--w": k.w,
                    "--ratio": stickerRatio(k.id),
                  } as CSSProperties
                }
              >
                <StickerArt id={k.id} ratio={stickerRatio(k.id)} />
              </div>
            ))}
          </div>
          <div className="kit-front">
            <div className="kit-label">
              <span className="kit-label-title">Sample kit</span>
              <span className="kit-label-line">Stickers and labels</span>
              <span className="kit-label-line">To: you</span>
            </div>
          </div>
          <div className="kit-flap" />
          <span className="kit-seal logo">
            <span>Label</span> <span>Bros</span>
          </span>
        </div>
      </div>
    </section>
  );
}
