import Link from "next/link";
import { Arrow } from "@/components/site/Arrow";
import { Motion } from "@/components/site/Motion";
import { CHANGES, FILES, PROOF, RUSH, SHIPPING } from "@/lib/facts";
import { MATERIALS_FOR, SIZE_LIMITS } from "@/lib/options";
import { STEPS } from "./Steps";

/*
 * "From your idea to your shelf." The four steps of an order down a track (a dashed cut line that
 * fills in yellow as you scroll), with the heading and the button to start beside them, staying in
 * view on wide screens. As each step arrives its icon slaps on as a yellow sticker and draws
 * itself, its title rises, and the ticks on its facts draw one after another; the step in the
 * middle of the screen is the current one (process-motion.ts). No pinning: the page always
 * scrolls normally. Reduced motion, or no script: everything as it is.
 */

const L = SIZE_LIMITS.labels;
const FACTS = [
  [`Any size from ${L.min} to ${L.max} in`, `${MATERIALS_FOR("labels").length} label materials`, "Price shown as you type"],
  [FILES, "Or “Design it for me”", "Or send it after ordering"],
  [PROOF, CHANGES, "Nothing prints until you approve"],
  ["Printed in Canada", SHIPPING, RUSH],
];

const ICONS: Record<string, string> = {
  size: "M4 8h16v8H4zM7 8v3M10 8v2M13 8v3M16 8v2",
  upload: "M12 16V4m0 0-4.5 4.5M12 4l4.5 4.5M4 15v4h16v-4",
  proof: "M5 3.5h9l4 4V20.5H5zM14 3.5v4h4M8.5 13.5l2.2 2.2 4.6-4.7",
  ship: "M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5zM3.5 7.5 12 12l8.5-4.5M12 12v9",
};

export function ProcessSteps({ title = "From your idea to your shelf.", more = true }: { title?: string; more?: boolean }) {
  return (
    <section className="ps" aria-labelledby="ps-title" data-motion-root>
      <Motion name="process" />
      <div className="ps-side">
        <h2 id="ps-title" className="display sec-title ps-title" data-reveal>
          {title}
        </h2>
        <p className="ps-lede">Four steps, and a person checks your file before anything prints.</p>
        <div className="ps-cta">
          <Link href="/labels" className="btn btn-primary" data-magnetic>
            Start your order
            <Arrow />
          </Link>
          {more && (
            <Link href="/how-it-works" className="text-link">
              How it works
              <Arrow />
            </Link>
          )}
        </div>
      </div>

      <ol className="ps-list">
        {STEPS.map((s, i) => (
          <li key={s.title} className="ps-step" data-ps-step>
            {i < STEPS.length - 1 && (
              <span className="ps-seg" aria-hidden="true">
                <span className="ps-seg-fill" data-ps-seg />
              </span>
            )}
            <span className="ps-icon" aria-hidden="true" data-ps-icon>
              <svg viewBox="0 0 24 24">
                <path d={ICONS[s.icon]} data-ps-draw />
              </svg>
            </span>
            <div className="ps-text">
              <h3 className="ps-name" data-reveal>
                {s.title}
              </h3>
              <p className="ps-body">{s.body}</p>
              <ul className="ps-facts">
                {FACTS[i].map((f) => (
                  <li key={f}>
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M2.5 8.5l3.5 3.5 7.5-8" data-ps-tick />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
