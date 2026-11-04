/* eslint-disable @next/next/no-img-element -- pre-sized WebP artwork layers that GSAP animates; next/image would add wrappers and nothing to optimise */
import type { CSSProperties } from "react";
import Link from "next/link";
import { Arrow } from "@/components/site/Arrow";
import { Motion } from "@/components/site/Motion";
import { StickerArt } from "@/components/stickers/StickerArt";
import { stickerRatio } from "@/components/stickers/ratio";
import { LIFTOFF } from "./liftoff";

/*
 * "How it works" as one pinned screen: the steps on the left, a real-looking proof on the
 * right that changes as you scroll. A pencil sketch is inked into finished artwork, the cut
 * line is traced round it, a cursor approves the proof and the seal slaps on, then the printed
 * stickers stack up. All step text is in the page; the active one is opened up.
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
    note: "Free proof in 12–24 hours. Ask for changes until you are happy.",
  },
  {
    key: "print",
    title: "We print, cut and ship.",
    body: "Your stickers are printed, cut to shape and sent to you.",
    note: "Ships 2–4 business days after you approve your proof. Free shipping in Canada on orders over $100.",
  },
];

const STATUS = ["Waiting for artwork", "Artwork in", "Cut line added", "Approved by you", "Printed and on its way"];
const COPIES = [
  { x: -7, y: 5, r: -8 },
  { x: 6, y: 4, r: 7 },
  { x: -1, y: 8, r: -3 },
];

export function Process() {
  const art = { "--ratio": LIFTOFF.w / LIFTOFF.h } as CSSProperties;
  return (
    <section id="process" aria-labelledby="process-title" className="proc" data-motion-root>
      <Motion name="process" />
      <div className="proc-track">
        <div className="proc-stage">
          <div className="proc-copy">
            <h2 id="process-title" className="section-title proc-title">
              See it before we print it.
            </h2>
            <p className="proc-lede">
              Send your own artwork or have our designers make it. Either way, you approve a free proof before
              anything is printed.
            </p>
            <ol className="proc-rail">
              {STEPS.map((s, i) => (
                <li key={s.key} data-step={i} data-active={i === 0 ? "true" : undefined} className="proc-step">
                  <h3 className="proc-step-title">{s.title}</h3>
                  <div className="proc-step-body">
                    <div>
                      <p>{s.body}</p>
                      {s.note ? <p className="proc-note">{s.note}</p> : null}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <figure className="proof" aria-hidden="true">
            <div className="proof-bar">
              <span>Proof: Liftoff sticker</span>
              <span>3 × 3 in, gloss vinyl</span>
            </div>
            <div className="proof-board">
              <div className="proof-art" style={art}>
                {COPIES.map((c, i) => (
                  <img
                    key={i}
                    data-copy
                    src={LIFTOFF.art}
                    alt=""
                    width={LIFTOFF.w}
                    height={LIFTOFF.h}
                    loading="lazy"
                    decoding="async"
                    className="proof-img proof-copy"
                    style={{ ["--x" as string]: `${c.x}%`, ["--y" as string]: `${c.y}%`, ["--r" as string]: `${c.r}deg` }}
                  />
                ))}
                <img data-sketch src={LIFTOFF.sketch} alt="" width={LIFTOFF.w} height={LIFTOFF.h} loading="lazy" decoding="async" className="proof-img proof-sketch" />
                <img data-art src={LIFTOFF.art} alt="" width={LIFTOFF.w} height={LIFTOFF.h} loading="lazy" decoding="async" className="proof-img proof-final" />
                <span data-ink className="proof-ink" />
                <svg className="proof-cut" viewBox={`0 0 ${LIFTOFF.w} ${LIFTOFF.h}`}>
                  <defs>
                    <mask id="lift-cut" maskUnits="userSpaceOnUse" x="-40" y="-40" width={LIFTOFF.w + 80} height={LIFTOFF.h + 80}>
                      <path data-cut-draw d={LIFTOFF.cut} fill="none" stroke="#fff" strokeWidth="14" />
                    </mask>
                  </defs>
                  <path data-cut d={LIFTOFF.cut} fill="none" stroke="#e6007e" strokeWidth="4.5" strokeDasharray="16 11" mask="url(#lift-cut)" />
                </svg>
                <span data-cut-label className="proof-cut-label">Cut line</span>
              </div>
              <StickerArt id="approved" ratio={stickerRatio("approved")} className="proof-seal" />
            </div>
            <div className="proof-foot">
              <span className="proof-status">
                {STATUS.map((s, i) => (
                  <span key={s} data-status={i}>
                    {s}
                  </span>
                ))}
              </span>
              <span className="proof-actions">
                <span className="proof-btn">Request changes</span>
                <span data-approve className="proof-btn proof-btn-approve">
                  <span data-approve-idle>Approve proof</span>
                  <span data-approve-done>
                    <svg width="14" height="14" viewBox="0 0 14 14">
                      <path d="M2.5 7.5 5.6 10.5 11.5 3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Approved
                  </span>
                </span>
              </span>
            </div>
            <svg data-cursor className="proof-cursor" width="26" height="30" viewBox="0 0 26 30">
              <path d="M3 2 L3 24 L9 18.5 L13.2 27.5 L17.4 25.6 L13.3 16.8 L21.5 16.8 Z" fill="#0d0d0c" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </figure>
        </div>
      </div>

      <div className="proc-after">
        <a href="#pricing" className="btn btn-primary">
          Get instant pricing
          <Arrow />
        </a>
        <Link href="/services/custom-design" className="text-link">
          Ask a designer
          <Arrow />
        </Link>
        <Link href="/how-it-works" className="text-link">
          See every step
          <Arrow />
        </Link>
      </div>
    </section>
  );
}
