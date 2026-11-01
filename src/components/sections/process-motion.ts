"use client";

import { gsap, ScrollTrigger } from "@/lib/scroll";

/*
 * The proof, pinned for four steps (one timeline unit each), scrubbed by the scroll:
 *   1. the pencil sketch draws down the sheet, then the finished artwork is inked across it
 *   2. the cut line is traced round the artwork's real outline (dashed, drawn through a mask)
 *   3. a cursor clicks "Approve proof" and the approval seal slaps on
 *   4. the cut line goes, the sticker lifts and printed copies slap down under it
 * Discrete moments carry their own eases; the scroll mapping itself is linear. Every tween states
 * where it starts (fromTo), so a refresh from another section can never shift a starting value.
 */

const MODE = "(scripting: enabled) and (prefers-reduced-motion: no-preference)";

export function init(root: HTMLElement) {
  if (!window.matchMedia(MODE).matches) return () => {};

  const q = gsap.utils.selector(root);
  const track = q<HTMLElement>(".proc-track")[0];
  const proof = q<HTMLElement>(".proof")[0];
  const steps = q<HTMLElement>("[data-step]");
  const status = q<HTMLElement>("[data-status]");
  const rail = q<HTMLElement>(".proc-rail")[0];
  if (!track || !proof) return () => {};

  const ctx = gsap.context(() => {
    const artBox = q<HTMLElement>(".proof-art")[0];
    const sketch = q("[data-sketch]");
    const art = q("[data-art]");
    const ink = q("[data-ink]");
    const cutDraw = q("[data-cut-draw]");
    const cut = q("[data-cut]");
    const cutLabel = q("[data-cut-label]");
    const seal = q(".proof-seal");
    const copies = q("[data-copy]");
    const cursor = q<SVGSVGElement>("[data-cursor]")[0];
    const approve = q<HTMLElement>("[data-approve]")[0];
    const idle = q("[data-approve-idle]");
    const done = q("[data-approve-done]");

    // where the cursor rests and where it clicks, in the proof's own coordinates
    const target = () => {
      const a = approve.getBoundingClientRect();
      const b = proof.getBoundingClientRect();
      return { x: a.left - b.left + a.width * 0.55, y: a.top - b.top + a.height * 0.45 };
    };
    const start = () => ({ x: proof.offsetWidth * 0.62, y: proof.offsetHeight * 0.55 });

    // the empty proof
    gsap.set(artBox, { "--ink": "0%", "--sk": "0%" });
    gsap.set(sketch, { opacity: 1 });
    gsap.set(cutDraw, { drawSVG: "0%" });
    gsap.set(seal, { opacity: 0, scale: 1.8, rotation: -38 });
    gsap.set(copies, { opacity: 0, yPercent: -12 });
    gsap.set(idle, { opacity: 1 });
    gsap.set(done, { opacity: 0 });
    gsap.set(cursor, { opacity: 0, x: () => start().x, y: () => start().y });
    gsap.set(status, { opacity: (i: number) => (i === 0 ? 1 : 0) });

    const tl = gsap.timeline({ defaults: { ease: "none" } });
    const say = (i: number, at: number) => {
      tl.to(status[i - 1], { opacity: 0, y: -5, duration: 0.06 }, at);
      tl.fromTo(status[i], { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.08 }, at + 0.05);
    };

    // 1. sketch, then ink
    tl.fromTo(artBox, { "--sk": "0%" }, { "--sk": "100%", duration: 0.38 }, 0.02);
    tl.fromTo(ink, { opacity: 0 }, { opacity: 1, duration: 0.03 }, 0.44);
    tl.fromTo(artBox, { "--ink": "0%" }, { "--ink": "100%", duration: 0.4, ease: "power1.inOut" }, 0.45);
    tl.fromTo(ink, { opacity: 1 }, { opacity: 0, duration: 0.05, immediateRender: false }, 0.84);
    tl.fromTo(sketch, { opacity: 1 }, { opacity: 0, duration: 0.08, immediateRender: false }, 0.86);
    say(1, 0.5);

    // 2. the cut line
    tl.fromTo(cutDraw, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.55, immediateRender: false }, 1.04);
    tl.fromTo(cutLabel, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.1, ease: "expo.out" }, 1.4);
    say(2, 1.08);

    // 3. approve: the cursor travels, clicks, and the seal slaps on
    tl.fromTo(cutLabel, { opacity: 1 }, { opacity: 0, duration: 0.08, immediateRender: false }, 2.0);
    tl.fromTo(cursor, { opacity: 0 }, { opacity: 1, duration: 0.05, immediateRender: false }, 2.02);
    tl.to(cursor, { x: () => target().x, y: () => target().y, duration: 0.3, ease: "power2.inOut" }, 2.04);
    tl.to(cursor, { scale: 0.82, duration: 0.03, transformOrigin: "20% 10%" }, 2.36);
    tl.to(cursor, { scale: 1, duration: 0.04 }, 2.39);
    tl.fromTo(idle, { opacity: 1 }, { opacity: 0, duration: 0.03, immediateRender: false }, 2.38);
    tl.fromTo(done, { opacity: 0 }, { opacity: 1, duration: 0.04, immediateRender: false }, 2.4);
    tl.fromTo(seal, { opacity: 0 }, { opacity: 1, duration: 0.03, immediateRender: false }, 2.44);
    tl.fromTo(seal, { scale: 1.8, rotation: -38 }, { scale: 1, rotation: -12, duration: 0.18, ease: "slap", immediateRender: false }, 2.44);
    tl.to(cursor, { opacity: 0, x: () => target().x + 40, y: () => target().y + 30, duration: 0.15 }, 2.62);
    say(3, 2.42);

    // 4. printed: the cut is done, copies stack up
    tl.fromTo(cut, { opacity: 1 }, { opacity: 0, duration: 0.12, immediateRender: false }, 3.0);
    tl.fromTo(art, { y: 0, scale: 1 }, { y: -8, scale: 1.02, duration: 0.25, ease: "power2.inOut", immediateRender: false }, 3.02);
    tl.fromTo(copies, { opacity: 0 }, { opacity: 1, duration: 0.03, stagger: 0.1, immediateRender: false }, 3.1);
    tl.fromTo(copies, { yPercent: -12 }, { yPercent: 0, duration: 0.16, ease: "slap", stagger: 0.1, immediateRender: false }, 3.1);
    say(4, 3.08);
    tl.to({}, { duration: 0.3 }, 3.7);

    let active = -1;
    tl.eventCallback("onUpdate", () => {
      const t = tl.time();
      const i = Math.min(steps.length - 1, Math.max(0, Math.floor(t)));
      rail?.style.setProperty("--rail", Math.min(1, (t + 0.15) / 4).toFixed(3));
      if (i === active) return;
      active = i;
      steps.forEach((s, k) => s.setAttribute("data-active", String(k === i)));
    });

    ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      animation: tl,
    });
  }, root);

  return () => ctx.revert();
}
