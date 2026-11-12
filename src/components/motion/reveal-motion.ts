"use client";

import { gsap, reduced, ScrollTrigger, SplitText } from "@/lib/scroll";

/*
 * How things arrive as you scroll (everything below the first screen):
 *   headings ([data-reveal])  each line rises out of its own slot, a touch turned, and settles
 *                             flat (expo.out), line after line, like type being set
 *   cards and panels          uncovered from the bottom up, the way a label comes off its liner,
 *                             while the picture inside settles from a little larger (expo.out)
 * Both hide by clipping, never by fading, so text is always at full contrast. Reduced motion
 * shows everything as it is.
 */

const CARDS = ".grid-cards > li, .packs > li, .mats-list > li, .checks-list > li, .invoice-steps > li, .step";
const INNER = ".pcard-media img, .pack-thumb, .mat-swatch";

export function init(root: HTMLElement) {
  if (reduced()) return () => {};
  const vh = window.innerHeight;
  const below = (el: Element) => el.getBoundingClientRect().top > vh * 0.92;
  const splits: SplitText[] = [];

  const ctx = gsap.context(() => {
    for (const el of gsap.utils.toArray<HTMLElement>("[data-reveal]", root).filter(below)) {
      splits.push(
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "rv-line",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 112,
              rotate: 4,
              transformOrigin: "0% 100%",
              duration: 1.2,
              ease: "expo.out",
              stagger: 0.09,
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            }),
        }),
      );
    }

    const cards = gsap.utils.toArray<HTMLElement>(CARDS, root).filter(below);
    if (cards.length) {
      gsap.set(cards, { clipPath: "inset(100% 0% 0% 0% round 18px)" });
      const inner = cards.map((c) => c.querySelector<HTMLElement>(INNER)).filter((x): x is HTMLElement => Boolean(x));
      if (inner.length) gsap.set(inner, { scale: 1.16, yPercent: 10 });
      ScrollTrigger.batch(cards, {
        start: "top 92%",
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, { clipPath: "inset(0% 0% 0% 0% round 18px)", duration: 1.1, ease: "expo.out", stagger: 0.09, clearProps: "clipPath" });
          const m = (batch as HTMLElement[]).map((c) => c.querySelector<HTMLElement>(INNER)).filter(Boolean);
          if (m.length) gsap.to(m, { scale: 1, yPercent: 0, duration: 1.5, ease: "expo.out", stagger: 0.09, clearProps: "transform" });
        },
      });
    }
  }, root);

  return () => {
    ctx.revert();
    for (const s of splits) s.revert();
  };
}
