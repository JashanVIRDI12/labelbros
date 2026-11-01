"use client";

import { gsap, reducedMotion } from "@/lib/scroll";

/* The wordmark sticker swings down onto the bottom of the page as you reach it. */

export function init(root: HTMLElement) {
  if (reducedMotion()) return () => {};
  const logo = root.querySelector<HTMLElement>(".footer-logo");
  const mark = root.querySelector<HTMLElement>(".footer-mark");
  if (!logo || !mark) return () => {};

  const ctx = gsap.context(() => {
    gsap.fromTo(
      logo,
      { rotation: -11, yPercent: 70, xPercent: -4 },
      {
        rotation: -3,
        yPercent: 0,
        xPercent: 0,
        ease: "none",
        scrollTrigger: { trigger: mark, start: "top bottom", end: "bottom bottom", scrub: 0.6 },
      },
    );
  }, root);
  return () => ctx.revert();
}
