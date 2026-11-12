import Link from "next/link";
import { Arrow } from "@/components/site/Arrow";
import { Motion } from "@/components/site/Motion";
import { CALL, PROOF, SHIPS_LONG } from "@/lib/facts";

/*
 * How ordering works, in four moves, joined by a strip of label tape that runs across as you
 * scroll (steps-motion.ts). Same promise everywhere: we check every file and proof it.
 */

export const ICONS = {
  size: "M4 8h16v8H4zM7 8v3M10 8v2M13 8v3M16 8v2",
  upload: "M12 16V4m0 0-4.5 4.5M12 4l4.5 4.5M4 15v4h16v-4",
  proof: "M5 3.5h9l4 4V20.5H5zM14 3.5v4h4M8.5 13.5l2.2 2.2 4.6-4.7",
  ship: "M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5zM3.5 7.5 12 12l8.5-4.5M12 12v9",
} as const;

export const STEPS = [
  { icon: "size", title: "Pick your label and size", body: "Choose the shape and material, type the width and height in inches and how many. The price is on the page." },
  { icon: "upload", title: "Send your artwork, or an idea", body: "Upload your file, or choose “Design it for me” and tell us what you want. No file yet? Send it after ordering." },
  { icon: "proof", title: "Approve your free proof", body: `We check your file by hand. ${PROOF}. ${CALL}.` },
  { icon: "ship", title: "We print and ship", body: `${SHIPS_LONG}. Free shipping in Canada over $100.` },
] as const;

export function Steps({ title = "Ordering is four steps.", more = true }: { title?: string; more?: boolean }) {
  return (
    <section className="steps" aria-labelledby="steps-title" data-motion-root>
      <Motion name="steps" />
      <div className="sec-head">
        <h2 id="steps-title" className="display sec-title" data-reveal>
          {title}
        </h2>
        {more && (
          <Link href="/how-it-works" className="text-link">
            How it works
            <Arrow />
          </Link>
        )}
      </div>
      <ol className="steps-list">
        <span className="steps-tape" aria-hidden="true" data-tape />
        {STEPS.map((s) => (
          <li key={s.title} className="step">
            <span className="step-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d={ICONS[s.icon]} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h3 className="step-title">{s.title}</h3>
            <p className="step-body">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
