"use client";

import { gsap, ScrollTrigger, reducedMotion } from "@/lib/scroll";
import { KIT, MAILER } from "./SampleKit";

/*
 * The sample kit, opened. When the scene comes in, the mailer slaps down onto the table and its
 * tab gives a tug. Scrolling on pulls the tear strip across (scrubbed: you are pulling it), the
 * slit showing the printed inside. When the strip is all the way off, the top is torn off and
 * tossed, and the samples burst out of the opening one after another, up and out, and land
 * around the mailer (a played timeline, so the throws keep their timing). It stays open; it only
 * reseals out of sight, when the section is scrolled back below the screen. Then the samples
 * float with the pointer, each at its depth.
 *
 * Samples move only through CSS variables (--ox/--oy/--or/--os, in scene units), so their
 * placement and turn stay in the CSS and nothing here fights a transform.
 * Reduced motion or no scripts: the mailer is already open (data-open) and the samples are out.
 */

const FINE = "(hover: hover) and (pointer: fine)";
const MOUTH = 9; // the top of the front panel, in mailer units: the samples come out here
const INSIDE_Y = 28; // where a sample waits inside, hidden by the front

export function init(root: HTMLElement) {
  if (reducedMotion()) return () => {};
  const scene = root.querySelector<HTMLElement>("[data-kit-scene]");
  const mailer = root.querySelector<HTMLElement>("[data-mailer]");
  const drop = root.querySelector<HTMLElement>("[data-drop]");
  const band = root.querySelector<HTMLElement>("[data-band]");
  const tab = root.querySelector<HTMLElement>("[data-tab]");
  const samples = [...root.querySelectorAll<HTMLElement>("[data-sample]")];
  const moves = samples.map((s) => s.querySelector<HTMLElement>("[data-move]")!);
  if (!scene || !mailer || !drop || !band || !tab || !samples.length) return () => {};

  // in the mailer's units: where each sample lands, and where it waits inside
  const spots = KIT.map((k, i) => {
    const x = k.x - MAILER.x;
    const y = k.y - MAILER.y;
    const insideX = MAILER.w / 2 + (i - (KIT.length - 1) / 2) * 5.5;
    return {
      ox: insideX - x,
      oy: INSIDE_Y - y,
      or: (i % 2 ? 6 : -6) - (k.r - MAILER.r),
      // up and out of the mouth first: above both the mouth and where it lands
      riseX: (insideX - x) * 0.45,
      riseY: Math.min(y, MOUTH - 4) - 9 - y,
    };
  });

  const offs: (() => void)[] = [];
  let open = false;

  const ctx = gsap.context(() => {
    // sealed, with every sample inside
    delete mailer.dataset.open;
    gsap.set(mailer, { "--pull": 0 });
    samples.forEach((s, i) => {
      gsap.set(s, { zIndex: 2 });
      gsap.set(moves[i], { "--ox": spots[i].ox, "--oy": spots[i].oy, "--or": spots[i].or, "--os": 0.92 });
    });

    /* it lands on the table, and the tab asks to be pulled */
    gsap
      .timeline({ scrollTrigger: { trigger: mailer, start: "top 96%", once: true } })
      .fromTo(drop, { y: -60, rotation: -6, scale: 1.08, opacity: 0 }, { y: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.65, ease: "slap" })
      .fromTo(tab, { x: 0 }, { x: 10, duration: 0.16, ease: "power2.out", yoyo: true, repeat: 3 }, "+=0.25");

    /* torn open: the top is tossed, the samples burst out and land */
    const burst = gsap.timeline({ paused: true });
    burst
      .fromTo(band, { yPercent: 0, xPercent: 0, rotation: 0, opacity: 1 }, { yPercent: -260, xPercent: 14, rotation: 9, opacity: 0, duration: 0.6, ease: "power3.out" }, 0)
      .fromTo(tab, { xPercent: 0, yPercent: 0, rotation: 0, opacity: 1 }, { xPercent: 160, yPercent: -140, rotation: 30, opacity: 0, duration: 0.5, ease: "power3.out", immediateRender: false }, 0);
    spots.forEach((s, i) => {
      const at = 0.14 + i * 0.075;
      burst
        .to(
          moves[i],
          {
            keyframes: [
              { "--ox": s.riseX, "--oy": s.riseY, "--or": s.or * 0.4, "--os": 1.04, duration: 0.3, ease: "power2.out" },
              { "--ox": 0, "--oy": 0, "--or": 0, "--os": 1.05, duration: 0.38, ease: "power3.out" },
              { "--os": 1, duration: 0.16, ease: "slap" },
            ],
          },
          at,
        )
        // out of the mouth: from here on it is in front of the mailer
        .set(samples[i], { zIndex: 7 }, at + 0.12);
    });

    /* the pull: scrubbed by the scroll (its update can run while it is still being built).
       Once the strip is off, the kit stays open: a little scroll back must never put the samples
       away and shoot them out again. It only reseals when the whole section is scrolled back
       below the screen, out of sight, so it can open again next time. */
    let pull: gsap.core.Tween | null = null;
    pull = gsap.fromTo(
      mailer,
      { "--pull": 0 },
      {
        "--pull": 1,
        ease: "none",
        // keyed to the mailer: the whole pull happens with it in view
        scrollTrigger: { trigger: mailer, start: "bottom 94%", end: "top 24%", scrub: 0.5 },
        onUpdate: () => {
          if (!pull || open || pull.progress() < 0.98) return;
          open = true;
          burst.play();
        },
      },
    );
    // when the burst is done the strip and tab are gone for good (the scrub can no longer show them)
    burst.eventCallback("onComplete", () => (mailer.dataset.open = ""));
    ScrollTrigger.create({
      trigger: scene,
      start: "top bottom",
      onLeaveBack: () => {
        if (!open) return;
        open = false;
        burst.pause(0);
        delete mailer.dataset.open;
      },
    });

    /* once out, the samples float with the pointer, each at its own depth */
    if (window.matchMedia(FINE).matches) {
      const px = gsap.quickTo(scene, "--px", { duration: 0.8, ease: "power3.out" });
      const py = gsap.quickTo(scene, "--py", { duration: 0.8, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = scene.getBoundingClientRect();
        px(((e.clientX - r.left) / r.width) * 2 - 1);
        py(((e.clientY - r.top) / r.height) * 2 - 1);
      };
      const leave = () => {
        px(0);
        py(0);
      };
      root.addEventListener("pointermove", move);
      root.addEventListener("pointerleave", leave);
      offs.push(() => {
        root.removeEventListener("pointermove", move);
        root.removeEventListener("pointerleave", leave);
      });
    }
  }, root);

  return () => {
    offs.forEach((off) => off());
    ctx.revert();
    mailer.dataset.open = "";
    moves.forEach((m) => ["--ox", "--oy", "--or", "--os"].forEach((v) => m.style.removeProperty(v)));
    samples.forEach((s) => s.style.removeProperty("z-index"));
  };
}
