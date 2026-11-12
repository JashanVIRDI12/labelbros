import { Motion } from "@/components/site/Motion";

/*
 * Two strips of label tape crossing the page: what we label, and what we print on. They run in
 * opposite directions, speed up and lean with your scrolling, and turn round when you scroll back
 * up (tape-motion.ts). Without scripts or with reduced motion they lie still.
 */
const FOR = ["Jams & preserves", "Kombucha", "Olive oil", "Candles", "Coffee", "Skincare", "Hot sauce", "Bakeries", "Breweries", "Tea"];
const ON = ["Rolls", "Sheets", "White BOPP", "Clear film", "Kraft paper", "Silver", "Gold", "Holographic", "Glitter", "Any size"];

function Cut() {
  return (
    <svg className="tape-cut" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" fill="currentColor" />
    </svg>
  );
}

function Row({ words, dir, className }: { words: string[]; dir: 1 | -1; className: string }) {
  const set = (k: number) =>
    words.map((w) => (
      <span key={`${k}-${w}`} className="tape-word">
        {w}
        <Cut />
      </span>
    ));
  return (
    <div className={`tape ${className}`} data-tape-row data-dir={dir}>
      <div className="tape-track" aria-hidden="true">
        {set(0)}
        {set(1)}
        {set(2)}
      </div>
    </div>
  );
}

/** `a` and `b` replace the two strips' words (a product page: what it's for, what it comes on). */
export function TapeMarquee({ a = FOR, b = ON, label }: { a?: string[]; b?: string[]; label?: string }) {
  return (
    <section className="tape-sec" aria-label={label ?? `Labels for ${a.join(", ")}. Printed on ${b.join(", ")}.`} data-motion-root>
      <Motion name="tape" />
      <Row words={a} dir={-1} className="tape-a" />
      <Row words={b} dir={1} className="tape-b" />
    </section>
  );
}
