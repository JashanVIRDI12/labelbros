"use client";

import { gsap, ScrollTrigger } from "@/lib/scroll";
import { cellKit, type CellRef } from "@/components/sheet/cells";

/*
 * The sticker sheet's motion. Loaded by <Motion name="sheet"> when the sheet is near.
 *
 * - Scroll (wide screens): the sheet starts lying back on the table (CSS) and stands up flat.
 * - Entry: every cell still below the fold waits lifted off the sheet, tilted, with its shadow,
 *   and slaps down as it comes in (fast in, firm stop, no bounce), corner still curling.
 * - Pointer and touch: tilt, lift and peel (shared with the labels roll: sheet/cells.ts).
 * - Demos: foil hue and glare follow the pointer (and the scroll), glitter sparkles, a light
 *   sweeps over gloss and matte, the sketch inks under the pointer, seals slap on.
 * Reduced motion: no tilt, entries or sparkles; the hands-on demos still follow the pointer.
 */

const ENTER_AT = 0.92; // a cell slaps down when its top reaches this far down the screen

export function init(root: HTMLElement) {
  const sheet = root.querySelector<HTMLElement>("[data-sheet]");
  if (!sheet) return () => {};
  const kit = cellKit(root);
  const { reduce, fine, on, cells, cellOf, local, follower, setVar, lightAt } = kit;

  // per-cell moments that play right after the cell lands
  const extras: Record<string, () => gsap.core.Animation | void> = {};
  // per-cell starting states for cells that will land later
  const setups: Record<string, () => void> = {};
  // touch screens have no hover: these demos follow the scroll instead (motion only)
  const scrubs: (() => void)[] = [];

  /* ---------------------------------------------------------------- your art, or ours */
  const ink = root.querySelector<HTMLElement>("[data-ink]");
  const ours = cellOf("ours");
  if (ink && ours) {
    const REST = 55; // half sketch, half finished art: the story at a glance (as in the CSS)
    const state = { v: REST };
    const apply = (v: number) => {
      state.v = v;
      setVar(ink, "--ink", `${v.toFixed(2)}%`);
    };
    // the visible edge sits at ink * 1.2 - 10% (see .ink-final), so put it under the pointer
    const inkFor = (f: number) => gsap.utils.clamp(0, 100, ((f + 0.1) / 1.2) * 100);
    const inkTo = follower(REST, apply, 0.3);
    on(ours.el, "pointermove", (e) => {
      if (e.pointerType === "touch") return;
      inkTo(inkFor((local(ink, e).x + 1) / 2));
      ink.dataset.inking = "";
    });
    on(ours.el, "pointerleave", () => {
      inkTo(REST);
      delete ink.dataset.inking;
    });
    if (fine) {
      setups.ours = () => apply(0);
      extras.ours = () =>
        gsap.fromTo(
          state,
          { v: 0 },
          {
            v: REST,
            duration: 1.2,
            ease: "power2.inOut",
            onStart: () => (ink.dataset.inking = ""),
            onUpdate: () => apply(state.v),
            onComplete: () => delete ink.dataset.inking,
          },
        );
    } else {
      scrubs.push(() =>
        ScrollTrigger.create({
          trigger: ours.el,
          start: "top 80%",
          end: "bottom 30%",
          onUpdate: (self) => apply(6 + self.progress * 94),
          onToggle: (self) => (self.isActive ? (ink.dataset.inking = "") : delete ink.dataset.inking),
        }),
      );
    }
  }

  /* ---------------------------------------------------------------- gloss or matte */
  const finish = root.querySelector<HTMLElement>("[data-finish]");
  const fin = cellOf("fin");
  if (finish && fin) {
    const REST = 0.62; // the gloss half catches the light at rest
    const state = { f: REST };
    const apply = (f: number) => {
      state.f = f;
      setVar(finish, "--gx", lightAt(f));
    };
    const lightTo = follower(REST, apply, 0.5);
    on(fin.el, "pointermove", (e) => {
      if (e.pointerType === "touch") return;
      lightTo(gsap.utils.clamp(-0.3, 1.3, (local(finish, e).x + 1) / 2));
    });
    on(fin.el, "pointerleave", () => lightTo(REST));
    if (fine) {
      setups.fin = () => apply(-0.4);
      extras.fin = () =>
        gsap.fromTo(state, { f: -0.4 }, { f: REST, duration: 1.5, ease: "power2.inOut", onUpdate: () => apply(state.f) });
    } else {
      scrubs.push(() =>
        ScrollTrigger.create({
          trigger: fin.el,
          start: "top 85%",
          end: "bottom 25%",
          onUpdate: (self) => apply(-0.3 + self.progress * 1.6),
        }),
      );
    }
  }

  /* ---------------------------------------------------------------- holo and glitter */
  const holo = root.querySelector<HTMLElement>("[data-holo]");
  const holoCell = cellOf("holo");
  let scrollHue = 0;
  let pointerHue = 0;
  const applyHue = () => holo && setVar(holo, "--holo", `${(scrollHue + pointerHue).toFixed(1)}deg`);
  if (holo && holoCell) {
    const hueTo = follower(0, (v) => {
      pointerHue = v;
      applyHue();
    });
    const glareTo = follower(0.3, (f) => setVar(holo, "--gx", lightAt(f)));
    on(holoCell.el, "pointermove", (e) => {
      if (e.pointerType === "touch") return;
      const p = local(holo, e);
      hueTo(p.x * 130 + p.y * 50);
      glareTo(gsap.utils.clamp(-0.3, 1.3, (p.x + 1) / 2));
    });
    on(holoCell.el, "pointerleave", () => {
      hueTo(0);
      glareTo(0.3);
    });
  }

  const sparkBox = root.querySelector<HTMLElement>("[data-sparkles]");
  const sparks: HTMLElement[] = [];
  const sparkle = () => {
    if (!sparkBox || !sparks.length) return;
    const el = sparks.shift()!;
    sparks.push(el);
    const w = sparkBox.offsetWidth;
    const h = sparkBox.offsetHeight;
    // somewhere on the burst (roughly a disc)
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * 0.4;
    gsap.killTweensOf(el);
    gsap.fromTo(
      el,
      { x: (0.5 + Math.cos(a) * r) * w, y: (0.5 + Math.sin(a) * r) * h, scale: 0, rotation: 0 },
      {
        scale: gsap.utils.random(0.45, 1.15),
        rotation: 90,
        duration: 0.26,
        ease: "power2.out",
        yoyo: true,
        repeat: 1,
        repeatDelay: 0.05,
      },
    );
  };

  // a trigger that is already past fires while the context is still being built: run it inline
  let ctx: gsap.Context | null = null;
  const later = (play: () => void) => (ctx ? ctx.add(play) : play());

  ctx = gsap.context(() => {
    if (reduce) return;

    /* -------------------------------------------------------------- the sheet stands up */
    const cs = () => getComputedStyle(sheet);
    const num = (name: string, fallback: number) => parseFloat(cs().getPropertyValue(name)) || fallback;
    // scroll it takes for the sheet's top to rise to 14% down the screen: the stand-up distance
    const room = () => root.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.14;
    // it can only stand up if the page can scroll that far (not in a window taller than the page)
    const canStand = () => room() > 40 && room() <= ScrollTrigger.maxScroll(window);
    if (num("--tilt", 0)) {
      gsap.fromTo(
        sheet,
        {
          // no scroll room to stand it up (a window taller than the page): it starts flat
          rotationX: () => (canStand() ? num("--tilt", 0) : 0),
          scale: () => (canStand() ? num("--tilt-s", 1) : 1),
          transformPerspective: () => num("--tilt-p", 1800),
          transformOrigin: "50% 0%",
        },
        {
          rotationX: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: root, start: 0, end: () => Math.max(room(), 1), scrub: 0.6, invalidateOnRefresh: true },
        },
      );
    }

    scrubs.forEach((make) => make());

    /* -------------------------------------------------------------- foil turns with the scroll */
    if (holo && holoCell) {
      ScrollTrigger.create({
        trigger: holoCell.el,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          scrollHue = self.progress * 260;
          applyHue();
        },
      });
    }

    /* -------------------------------------------------------------- glitter */
    if (sparkBox && holoCell) {
      for (let i = 0; i < 14; i++) {
        const s = document.createElement("i");
        s.className = "spark";
        sparkBox.appendChild(s);
        sparks.push(s);
      }
      let last = 0;
      on(holoCell.el, "pointermove", () => {
        const t = performance.now();
        if (t - last < 60) return;
        last = t;
        sparkle();
      });
      on(holoCell.el, "pointerdown", () => {
        for (let i = 0; i < 5; i++) gsap.delayedCall(i * 0.06, sparkle);
      });
      extras.holo = () => {
        for (let i = 0; i < 7; i++) gsap.delayedCall(i * 0.07, sparkle);
      };
    }

    /* -------------------------------------------------------------- seals */
    for (const name of ["seal", "proof"]) {
      const c = cellOf(name);
      const stamp = c?.el.querySelector<HTMLElement>("[data-slap]");
      if (!c || !stamp) continue;
      setups[name] = () => gsap.set(stamp, { "--slap": 1 });
      extras[name] = () => gsap.to(stamp, { "--slap": 0, duration: 0.5, ease: "slap", delay: 0.1 });
    }

    /* -------------------------------------------------------------- cells slap onto the sheet */
    const stageTop = () => root.getBoundingClientRect().top + window.scrollY;
    // layout position (offsets ignore the sheet's tilt; bounding boxes would not)
    const cellTop = (c: CellRef) => stageTop() + sheet.offsetTop + c.el.offsetTop;
    const sheetW = sheet.offsetWidth || 1;
    const fold = window.scrollY + window.innerHeight;

    cells.forEach((c, i) => {
      if (cellTop(c) < fold) return; // on screen (or above it) already: it has landed
      const rest = parseFloat(getComputedStyle(c.lift).getPropertyValue("--corner")) || 0;
      const side = i % 2 ? 1 : -1;
      gsap.set(c.el, { zIndex: 3 });
      gsap.set(c.lift, {
        transformPerspective: 900,
        z: 90,
        rotationX: 12,
        rotationY: side * 7,
        rotation: side * -1.6,
        "--corner": 1,
      });
      gsap.set(c.shadow, { opacity: 0.85, x: 20, y: 36, scale: 1.04 });
      setups[c.name]?.();

      ScrollTrigger.create({
        start: () => cellTop(c) - window.innerHeight * ENTER_AT,
        end: () => cellTop(c) - window.innerHeight * ENTER_AT + 1,
        once: true,
        // added to the context, so a later cleanup also catches what this starts
        onEnter: () => later(() => {
          // cells side by side land left to right
          const delay = (c.el.offsetLeft / sheetW) * 0.22;
          const tl = gsap.timeline({
            delay,
            onComplete: () => {
              gsap.set([c.lift, c.shadow], { clearProps: "transform,opacity,--corner" });
              gsap.set(c.el, { clearProps: "zIndex" });
            },
          });
          tl.to(c.lift, { z: 0, rotationX: 0, rotationY: 0, rotation: 0, duration: 0.62, ease: "slap" }, 0)
            .to(c.shadow, { opacity: 0, x: 0, y: 0, scale: 1, duration: 0.62, ease: "slap" }, 0)
            // the corner is still curling as it settles
            .to(c.lift, { "--corner": rest, duration: 1, ease: "expo.out" }, 0.28);
          const extra = extras[c.name]?.();
          if (extra) tl.add(extra, 0.34);
        }),
      });
    });

    /* -------------------------------------------------------------- tilt, lift and parallax */
    kit.tilt();
  }, root);

  return () => {
    kit.cleanup();
    ctx?.revert();
    sparks.forEach((s) => s.remove());
    if (ink) delete ink.dataset.inking;
  };
}
