"use client";

/*
 * Scroll motion for the sections below the hero. Imported only by the lazy section modules,
 * so ScrollTrigger and SplitText never weigh on the first screen.
 */
import { gsap } from "./gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

// Late web fonts change line heights, and with them every trigger position.
let fontsHooked = false;
if (typeof document !== "undefined" && !fontsHooked) {
  fontsHooked = true;
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const reduced = reducedMotion;

export { gsap, ScrollTrigger, SplitText };
