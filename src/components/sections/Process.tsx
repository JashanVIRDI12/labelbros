import { Arrow } from "@/components/site/Arrow";
import { Motion } from "@/components/site/Motion";
import { StickerArt } from "@/components/stickers/StickerArt";
import { stickerRatio } from "@/components/stickers/ratio";
import { ProofArt } from "./ProofArt";

/*
 * "How it works" as a proof that builds itself while you read: a sketch becomes artwork, the
 * cut line is drawn round it, the approval seal slaps on, then the stickers come off the press.
 * The steps are ordinary text in the page flow; the proof sticks beside (or above) them.
 */

const STEPS = [
  {
    key: "art",
    title: "Send your artwork, or just an idea.",
    body: "Upload a print-ready file, or send us a sketch and a few words. Our designers turn it into artwork.",
  },
  {
    key: "cut",
    title: "We draw the cut line.",
    body: "We trace the exact shape your sticker will be cut to, and set the file up for print.",
  },
  {
    key: "proof",
    title: "You approve a free proof.",
    body: "We send you a proof to check. Ask for changes or approve it. Nothing prints until you say so.",
    note: "[[Proof turnaround time]]",
  },
  {
    key: "print",
    title: "We print, cut and ship.",
    body: "Your stickers are printed, cut to shape and sent to you.",
    note: "[[Production and delivery time]]",
  },
];

const STATUS = ["Waiting for artwork", "Artwork in", "Cut line added", "Approved by you", "Printed and on its way"];

export function Process() {
  return (
    <section id="process" aria-labelledby="process-title" className="process" data-motion-root>
      <Motion name="process" />

      <div className="process-intro">
        <h2 id="process-title" className="section-title">
          See it before we print it.
        </h2>
        <p className="mt-5 max-w-[38ch] text-16 leading-[1.45] md:mt-7 md:text-18">
          Send your own artwork or have our designers make it. Either way, you approve a free proof before
          anything is printed.
        </p>
      </div>

      <div className="process-visual" aria-hidden="true">
        <figure className="proof">
          <div className="proof-bar">
            <span>Proof: Peach Club</span>
            <span>3 × 3 in, gloss vinyl</span>
          </div>
          <div className="proof-board">
            <ProofArt />
            <StickerArt id="approved" ratio={stickerRatio("approved")} className="proof-seal" />
          </div>
          <div className="proof-status">
            {STATUS.map((s, i) => (
              <span key={s} data-status={i}>
                {s}
              </span>
            ))}
          </div>
        </figure>
      </div>

      <ol className="process-steps">
        {STEPS.map((s) => (
          <li key={s.key} data-step className="process-step">
            <h3 className="process-step-title">{s.title}</h3>
            <p className="mt-3 max-w-[40ch] text-16 leading-[1.45] text-liner md:text-18">{s.body}</p>
            {s.note ? <p className="ph mt-3 text-14 text-liner-soft">{s.note}</p> : null}
          </li>
        ))}
      </ol>

      <div className="process-cta">
        <a href="#pricing" className="btn btn-primary">
          Get instant pricing
          <Arrow />
        </a>
        <a href="#[[DESIGN_BRIEF_URL]]" className="text-link">
          Ask a designer
          <Arrow />
        </a>
      </div>
    </section>
  );
}
