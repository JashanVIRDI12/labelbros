"use client";

/*
 * Scroll motion for the sections below the hero. Imported only by the lazy section modules,
 * so ScrollTrigger and DrawSVG never weigh on the first screen.
 */
import { gsap } from "./gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

// Late web fonts change line heights, and with them every trigger position.
let fontsHooked = false;
if (typeof document !== "undefined" && !fontsHooked) {
  fontsHooked = true;
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger };
