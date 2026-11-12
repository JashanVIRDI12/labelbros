"use client";

import { gsap, reduced } from "@/lib/scroll";

/*
 * How it works: a strip of yellow label tape runs along the steps as you scroll, and each step's
 * icon is pressed down as the tape reaches it.
 */
export function init(root: HTMLElement) {
  if (reduced()) return () => {};
  const tape = root.querySelector<HTMLElement>("[data-tape]");
  const icons = gsap.utils.toArray<HTMLElement>(".step-icon", root);
  const list = root.querySelector<HTMLElement>(".steps-list");
  if (!tape || !list) return () => {};

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: list, start: "top 78%", end: "bottom 62%", scrub: 0.5 } });
    // --p drives scaleX across wide screens and scaleY down phones (store.css)
    tl.fromTo(tape, { "--p": 0 }, { "--p": 1, ease: "none", duration: 1 }, 0);
    icons.forEach((icon, i) => {
      const at = (i / Math.max(1, icons.length - 1)) * 0.9;
      tl.fromTo(icon, { scale: 0.7, rotation: -10, backgroundColor: "#fffdf8" }, { scale: 1, rotation: 0, backgroundColor: "#ffd21f", duration: 0.12, ease: "slap" }, at);
    });
  }, root);

  return () => ctx.revert();
}
