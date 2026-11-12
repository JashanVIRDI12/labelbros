"use client";

import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { gsap, reduced, ScrollTrigger } from "@/lib/scroll";

gsap.registerPlugin(DrawSVGPlugin);

/*
 * The order steps (ProcessSteps.tsx). The track between two steps fills as you scroll from one
 * to the next (scrubbed, no easing).
 * Each step, as it comes up the screen: its icon slaps on as a sticker (fast in, firm stop) and
 * then draws itself, and its facts' ticks draw one after another while the words slide up out of
 * a clip (never faded, so they stay at full contrast). The step crossing the middle of the screen
 * is marked current. Titles rise through the shared reveal (reveal-motion.ts).
 */
export function init(root: HTMLElement) {
  if (reduced()) return () => {};
  const steps = Array.from(root.querySelectorAll<HTMLElement>("[data-ps-step]"));
  if (!steps.length) return () => {};

  const ctx = gsap.context(() => {
    steps.forEach((step, i) => {
      const seg = step.querySelector<HTMLElement>("[data-ps-seg]");
      const next = steps[i + 1];
      if (seg && next)
        gsap.fromTo(seg, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: step, start: "top 62%", endTrigger: next, end: "top 62%", scrub: 0.4 } });
    });

    for (const step of steps) {
      const icon = step.querySelector<HTMLElement>("[data-ps-icon]");
      const draw = step.querySelectorAll<SVGPathElement>("[data-ps-draw]");
      const ticks = step.querySelectorAll<SVGPathElement>("[data-ps-tick]");
      const words = step.querySelectorAll<HTMLElement>(".ps-body, .ps-facts li");

      gsap.set(icon, { scale: 0.35, rotation: -40 });
      gsap.set(draw, { drawSVG: "0%" });
      gsap.set(ticks, { drawSVG: "0%" });
      gsap.set(words, { y: 18, clipPath: "inset(0 0 100% 0)" });

      gsap
        .timeline({ scrollTrigger: { trigger: step, start: "top 78%", once: true } })
        .to(icon, { scale: 1, rotation: -6, duration: 0.45, ease: "slap" })
        .to(draw, { drawSVG: "100%", duration: 0.7, ease: "power2.inOut" }, "-=0.1")
        .to(words, { y: 0, clipPath: "inset(0 0 -20% 0)", duration: 0.7, ease: "expo.out", stagger: 0.07, clearProps: "clipPath" }, 0.15)
        .to(ticks, { drawSVG: "100%", duration: 0.35, ease: "power2.out", stagger: 0.09 }, 0.45);

      ScrollTrigger.create({
        trigger: step,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => step.toggleAttribute("data-current", self.isActive),
      });
    }
  }, root);

  return () => {
    ctx.revert();
    for (const s of steps) s.removeAttribute("data-current");
  };
}
