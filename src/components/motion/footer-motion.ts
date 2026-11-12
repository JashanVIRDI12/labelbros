"use client";

import { gsap, reduced } from "@/lib/scroll";

/*
 * The footer's wordmark tape is slapped across the bottom of the page as it comes into view:
 * in from below and turned, then down flat at its angle (slap).
 */
export function init(root: HTMLElement) {
  if (reduced()) return () => {};
  const tape = root.querySelector<HTMLElement>("[data-tape] > span");
  if (!tape) return () => {};
  const ctx = gsap.context(() => {
    gsap.fromTo(
      tape,
      { yPercent: 70, rotation: -9, scale: 1.08 },
      { yPercent: 0, rotation: 0, scale: 1, duration: 0.7, ease: "slap", scrollTrigger: { trigger: tape, start: "top bottom", once: true } },
    );
  }, root);
  return () => ctx.revert();
}
