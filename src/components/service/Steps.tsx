import Link from "next/link";
import { Arrow } from "@/components/site/Arrow";

/*
 * How ordering works, in three: the same promise on every page, linked to the full story. A strip
 * of yellow tape runs along under the steps as you scroll past (page-motion.ts).
 */
const STEPS = [
  {
    title: "Send your artwork, or an idea",
    body: "Upload a print-ready file, or a sketch and a few words for our designers.",
    icon: "M10 14V4M5.5 8.5 10 4l4.5 4.5M4 14v3h12v-3",
  },
  {
    title: "Approve your free proof",
    body: "Check the size, the colours and the cut line. If your design needs changes, we call you. Nothing prints until you say yes.",
    icon: "M5 10.5 8.5 14 15 6.5",
  },
  {
    title: "We print, cut and send it",
    body: "Printed on the stock you chose and shipped in 2–4 business days. Free shipping in Canada on orders over $100.",
    icon: "M3 7.5 10 4l7 3.5v6L10 17l-7-3.5ZM3 7.5l7 3.5 7-3.5M10 11v6",
  },
];

export function Steps() {
  return (
    <section className="steps" aria-labelledby="steps-title">
      <div className="steps-head">
        <h2 id="steps-title" className="section-title">
          How ordering works.
        </h2>
        <Link href="/how-it-works" className="text-link">
          See every step
          <Arrow />
        </Link>
      </div>
      <div className="steps-track">
        <i className="steps-tape" data-tape aria-hidden="true" />
        <ol className="steps-list">
          {STEPS.map((s) => (
            <li key={s.title} className="step" data-slap>
              <span className="step-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 20 20">
                  <path d={s.icon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                </svg>
              </span>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-body">
                {s.body.split(/(\[\[[^\]]+\]\])/).map((part, i) =>
                  part.startsWith("[[") ? (
                    <span key={i} className="ph">
                      {part}
                    </span>
                  ) : (
                    part
                  ),
                )}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
