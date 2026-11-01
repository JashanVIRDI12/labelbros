"use client";

import { gsap, ScrollTrigger, reducedMotion } from "@/lib/scroll";
import { COPIES } from "./ProofArt";

/*
 * One scrubbed timeline, one unit per step, tied to the steps column: each step's text sits in
 * view while its part of the proof plays. Discrete moments inside a step (the seal, the
 * printed copies) use their own eases; the scroll mapping itself stays linear.
 */

export function init(root: HTMLElement) {
  if (reducedMotion()) return () => {};

  const q = gsap.utils.selector(root);
  const steps = q<HTMLElement>("[data-step]");
  const status = q<HTMLElement>("[data-status]");
  const mm = gsap.matchMedia();

  const ctx = gsap.context(() => {
    const sketchGroup = q("[data-sketch]");
    const sketch = q("[data-sketch] path");
    const art = q("[data-art]");
    const border = q("[data-border]");
    const cutDraw = q("[data-cut-draw]");
    const cut = q("[data-cut]");
    const note = q("[data-note]");
    const seal = q(".proof-seal");
    const copies = q("[data-copy]");
    const shadow = q("[data-shadow]");
    const sticker = q("[data-sticker]");

    // the empty proof
    gsap.set(q("[data-drop]"), { opacity: 1 });
    gsap.set(sketchGroup, { opacity: 1 });
    gsap.set(sketch, { drawSVG: "0%", opacity: 0 }); // hidden until drawn: round caps leave dots
    gsap.set(art, { opacity: 0 });
    gsap.set(border, { opacity: 0, scale: 0.9, svgOrigin: "130 140" });
    gsap.set(cutDraw, { drawSVG: "0%" });
    gsap.set(seal, { opacity: 0, scale: 1.8, rotation: -38 });
    copies.forEach((c, i) => gsap.set(c, { x: COPIES[i].x, y: COPIES[i].y - 60, rotation: COPIES[i].r, svgOrigin: "130 140", opacity: 0 }));
    gsap.set(status, { opacity: (i: number) => (i === 0 ? 1 : 0), y: 0 });

    const tl = gsap.timeline({ defaults: { ease: "none" } });
    const say = (i: number, at: number) => {
      tl.to(status[i - 1], { opacity: 0, y: -6, duration: 0.08 }, at);
      tl.fromTo(status[i], { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.1 }, at + 0.06);
    };

    // 1. sketch, then the finished art
    tl.to(q("[data-drop]"), { opacity: 0, duration: 0.12 }, 0);
    tl.to(sketch, { opacity: 1, duration: 0.01, stagger: 0.035 }, 0.02);
    tl.to(sketch, { drawSVG: "100%", duration: 0.4, stagger: 0.035, ease: "power1.inOut" }, 0.02);
    tl.to(art, { opacity: 1, duration: 0.22 }, 0.55);
    tl.to(sketchGroup, { opacity: 0, duration: 0.18 }, 0.62);
    say(1, 0.5);

    // 2. die-cut border and cut line
    tl.to(border, { opacity: 1, scale: 1, duration: 0.3, ease: "expo.out" }, 1.0);
    tl.to(cutDraw, { drawSVG: "100%", duration: 0.5 }, 1.12);
    tl.to(note, { opacity: 1, duration: 0.12 }, 1.5);
    say(2, 1.1);

    // 3. approved: the seal slaps on
    tl.to(note, { opacity: 0, duration: 0.12 }, 2.0);
    tl.to(seal, { opacity: 1, duration: 0.05 }, 2.18);
    tl.to(seal, { scale: 1, rotation: -12, duration: 0.2, ease: "slap" }, 2.18);
    say(3, 2.18);

    // 4. cut, printed, stacked
    tl.to(cut, { opacity: 0, duration: 0.18 }, 3.0);
    tl.to(sticker, { y: -10, duration: 0.3, ease: "power2.inOut" }, 3.02);
    tl.to(shadow, { opacity: 0.35, duration: 0.3 }, 3.02);
    tl.to(copies, { opacity: 1, duration: 0.04, stagger: 0.12 }, 3.12);
    tl.to(copies, { y: (i: number) => COPIES[i].y, duration: 0.18, ease: "slap", stagger: 0.12 }, 3.12);
    say(4, 3.05);
    tl.to({}, { duration: 0.3 }, 3.7);

    let active = -1;
    const mark = () => {
      const i = Math.min(steps.length - 1, Math.max(0, Math.floor(tl.time())));
      const on = tl.time() > 0.02 ? i : -1;
      if (on === active) return;
      active = on;
      steps.forEach((s, k) => s.setAttribute("data-active", String(k === on)));
    };

    // where a step's text sits while it plays differs: beside the proof on wide screens,
    // under it on phones
    mm.add(
      { wide: "(min-width: 1024px)", narrow: "(max-width: 1023px)" },
      (c) => {
        const wide = c.conditions?.wide;
        ScrollTrigger.create({
          trigger: q(".process-steps")[0],
          start: wide ? "top 62%" : "top 85%",
          end: wide ? "bottom 62%" : "bottom 85%",
          scrub: 0.6,
          animation: tl,
          onUpdate: mark,
          onRefresh: mark,
        });
      },
    );
  }, root);

  return () => {
    mm.revert();
    ctx.revert();
  };
}
