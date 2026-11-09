import type { CSSProperties } from "react";
import Link from "next/link";
import { Art } from "@/components/sheet/Art";
import { quoteHref } from "@/components/sheet/quote";
import { DESERT_BLOOM, PENCIL } from "./desert-bloom";
import { ART } from "@/components/stickers-page/art";
import { Arrow } from "@/components/site/Arrow";
import { Motion } from "@/components/site/Motion";
import { SecondAsk } from "@/components/site/SecondAsk";

/*
 * "Follow one sticker": the order, start to finish, as one pinned scene. The table is a cutting
 * mat in perspective with the five things the job becomes lying on it; as the page scrolls the
 * camera glides from one to the next and each stands up off the mat to show its moment
 * (how-motion.ts). Beside it, a job ticket ticks off the steps; all the step text is in it, and
 * its tear-off stub carries both asks.
 * Without scripts or with reduced motion: the ticket, fully open, and the five things in a row,
 * each captioned with its step.
 */

const STEPS = [
  {
    key: "send",
    short: "Your artwork, or an idea",
    title: "Send your artwork, or just an idea.",
    body: "Upload a print-ready file, or a sketch and a few words. Our designers turn it into artwork.",
    note: "PDF, AI, EPS, SVG, PNG, JPG, TIF or PSD. Vector or 300 dpi prints sharpest.",
  },
  {
    key: "setup",
    short: "Set up for print",
    title: "We set it up for print.",
    body: "We trace the exact shape your sticker will be cut to, and set the file up for print.",
  },
  {
    key: "proof",
    short: "Your free proof",
    title: "You approve a free proof.",
    body: "Check it, ask for changes or approve it. Nothing prints until you say so.",
    note: "Your free proof arrives in 12–24 hours.",
  },
  {
    key: "print",
    short: "Printed and cut",
    title: "We print and cut.",
    body: "Your stickers are printed and cut right round your shape.",
  },
  {
    key: "ship",
    short: "On its way",
    title: "Packed and on its way.",
    body: "Sent straight to your door.",
    note: "Ships 2–4 business days after you approve. Free shipping in Canada on orders over $100.",
  },
];

// where each thing lies on the mat (centre, in mat units), its size and how it was dropped
const STATIONS = [
  { x: 0, y: 0, w: 360, h: 460, r: -5 },
  { x: 600, y: 300, w: 380, h: 460, r: 4 },
  { x: 1200, y: 20, w: 380, h: 460, r: -3 },
  { x: 1820, y: 330, w: 480, h: 330, r: 5 },
  { x: 2420, y: 60, w: 480, h: 330, r: -4 },
];

const SHEET = 6; // printed copies on the kiss-cut sheet

const place = (s: (typeof STATIONS)[number]) =>
  ({ "--x": s.x, "--y": s.y, "--w": s.w, "--h": s.h, "--r": `${s.r}deg` }) as CSSProperties;

/** One of the five things on the mat. The face is what stands up; the caption shows without the scene. */
function Station({ i, children }: { i: number; children: React.ReactNode }) {
  return (
    <div className="station" data-station={i} data-caption={STEPS[i].short} style={place(STATIONS[i])}>
      <div className="station-face" data-face>
        {children}
      </div>
    </div>
  );
}

const STICKER = DESERT_BLOOM;

export function Journey() {
  const art = { src: STICKER.art, w: STICKER.w, h: STICKER.h };
  const sketch = { src: STICKER.sketch, w: STICKER.w, h: STICKER.h };
  const box = `0 0 ${STICKER.w} ${STICKER.h}`;

  return (
    <section
      id="journey"
      aria-labelledby="journey-title"
      className="how"
      data-motion-root
      style={{ "--art-ratio": STICKER.w / STICKER.h } as CSSProperties}
    >
      <Motion name="how" />
      <div className="how-track">
        <div className="how-stage">
          <div className="how-copy">
            <h2 id="journey-title" className="section-title how-title">
              Follow one sticker.
            </h2>
            <div className="ticket">
              <p className="ticket-head">
                <span>Your order</span>
                {/* progress at a glance (phones show one step at a time) */}
                <span className="ticket-dots" aria-hidden="true">
                  {STEPS.map((s) => (
                    <i key={s.key} data-dot />
                  ))}
                </span>
                <span className="ticket-what">Desert Bloom sticker</span>
              </p>
              <ol className="ticket-steps">
                {STEPS.map((s, i) => (
                  <li
                    key={s.key}
                    data-step={i}
                    data-active={i === 0 ? "true" : undefined}
                    className="ticket-step"
                  >
                    <i className="ticket-tick" aria-hidden="true" />
                    <div className="ticket-text">
                      <h3 className="ticket-title">{s.title}</h3>
                      <div className="ticket-body">
                        <div>
                          <p>{s.body}</p>
                          {s.note ? <p className="ticket-note">{s.note}</p> : null}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              {/* the tear-off stub: both asks, in reach the whole way */}
              <div className="ticket-stub">
                <Link href={quoteHref("stickers", { shape: "die-cut" })} className="btn btn-primary btn-sm">
                  Upload your design
                  <Arrow />
                </Link>
                <SecondAsk className="text-link" />
              </div>
            </div>
          </div>

          <div className="desk-view" aria-hidden="true">
            <div className="desk" data-desk>
              <div className="desk-plane" data-plane>
                <div className="desk-cam" data-cam>
                  <div className="desk-mat" />
                  {STATIONS.map((s, i) => (
                    <div key={`shadow-${i}`} className="station-shadow" data-shadow={i} style={place(s)} />
                  ))}

                  {/* the pencil it was drawn with, left lying on the mat (it fades with the sketch) */}
                  <div className="desk-pencil" data-pencil style={place(STATIONS[0])}>
                    <Art art={PENCIL} />
                  </div>

                  {/* 1. a sketch, or a file; then the sketch is inked into artwork */}
                  <Station i={0}>
                    <div className="st-paper">
                      <div className="st-ink" data-ink>
                        <Art art={sketch} className="st-ink-sketch" />
                        <Art art={art} className="st-ink-final" />
                        <span className="st-ink-edge" />
                      </div>
                    </div>
                    <div className="st-file" data-file>
                      <span className="st-file-icon">AI</span>
                      <span className="st-file-name">desert-bloom.ai</span>
                    </div>
                  </Station>

                  {/* 2. set up: the cut line traced round it */}
                  <Station i={1}>
                    <div className="st-card">
                      <p className="st-bar">
                        <span>desert-bloom.ai</span>
                        <span className="st-cut-tag" data-cut-tag>
                          Cut line
                        </span>
                      </p>
                      <div className="st-check">
                        <div className="st-art">
                          <Art art={art} />
                          {/* the dashed cut line, drawn on through a mask (a dash pattern cannot draw itself) */}
                          <svg viewBox={box} className="st-cut">
                            <defs>
                              <mask id="how-cut" maskUnits="userSpaceOnUse" x="-40" y="-40" width={STICKER.w + 80} height={STICKER.h + 80}>
                                <path data-cut d={STICKER.cut} fill="none" stroke="#fff" strokeWidth="16" />
                              </mask>
                            </defs>
                            <path d={STICKER.cut} fill="none" stroke="#e6007e" strokeWidth="5" strokeDasharray="16 11" mask="url(#how-cut)" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Station>

                  {/* 3. the proof, approved */}
                  <Station i={2}>
                    <div className="st-card st-proof">
                      <p className="st-proof-title">Your proof is ready</p>
                      <div className="st-check st-check-sm">
                        <div className="st-art">
                          <Art art={art} />
                        </div>
                      </div>
                      <p className="st-actions">
                        <span className="st-btn">Ask for changes</span>
                        <span className="st-btn st-btn-ink" data-approve>
                          Approve
                        </span>
                      </p>
                      <svg className="st-cursor" data-cursor viewBox="0 0 24 24" width="28" height="28">
                        <path d="M4 2l15 10-6.5 1.5L16 21l-3 1.5-3.4-7.6L4 19z" fill="#0d0d0c" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
                      </svg>
                      <Art art={ART.approved} className="st-seal" data-seal />
                    </div>
                  </Station>

                  {/* 4. printed on a kiss-cut sheet: the cut lines stay on the liner when one peels */}
                  <Station i={3}>
                    <div className="st-sheet">
                      {Array.from({ length: SHEET }, (_, i) => (
                        <span key={i} className="st-copy">
                          <span className="st-copy-box">
                            <svg viewBox={box} className="st-copy-cut">
                              <path d={STICKER.cut} />
                            </svg>
                            <span className="st-copy-art" data-copy={i}>
                              <Art art={art} />
                            </span>
                          </span>
                        </span>
                      ))}
                    </div>
                  </Station>

                  {/* 5. the kraft mailer (a photograph), labelled and sealed */}
                  <Station i={4}>
                    <div className="st-mailer">
                      <span className="st-ship" data-ship>
                        <b>To: you</b>
                        <span>Your name</span>
                        <span>Your street, your town</span>
                        <span className="st-barcode" />
                      </span>
                      <span className="st-mailer-seal logo" data-mseal>
                        <span>Label</span> <span>Bros</span>
                      </span>
                    </div>
                  </Station>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
