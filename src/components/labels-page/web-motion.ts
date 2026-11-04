"use client";

import { gsap, ScrollTrigger } from "@/lib/scroll";
import { cellKit, type CellRef } from "@/components/sheet/cells";

/*
 * The label web's motion. Loaded by <Motion name="web"> when the web is near.
 *
 * - Smoothed on: every label still below the fold waits held by its top edge, its bottom lifted
 *   towards you with its shadow and a curled corner. As it comes in it is pressed down from the
 *   top, a band of light running down it like a hand smoothing it on, and settles into its cut
 *   line on the liner. (Stickers slap down; labels are smoothed on.)
 * - The wrap-around label: 28 strips of the flat label, bent round the bottle in 3D as the cell
 *   scrolls through (flat, then wrapped, then turning); the pointer turns the bottle.
 * - As each label goes on: the proof's lines tick off and the approval seal slaps on, the swatch
 *   book fans open, the shapes fan out, a jar is picked off the shelf, a light runs over the foil.
 * - Pointer and touch: tilt, lift and peel (sheet/cells.ts).
 * Reduced motion: every label is on; the bottle is shown wrapped and still turns under the
 * pointer, the light still follows it.
 */

const COVER = 0.67; // how far round the bottle the label goes (wrapped, it is as wide as the glass)
const ENTER_AT = 0.9; // a label is smoothed on when its top reaches this far down the screen

export function init(root: HTMLElement) {
  const web = root.querySelector<HTMLElement>("[data-web]");
  if (!web) return () => {};

  const kit = cellKit(root);
  const { reduce, fine, on, cells, cellOf, local, follower, setVar, lightAt } = kit;

  /* ---------------------------------------------------------------- the wrap-around label */
  const wrapCell = cellOf("wrap");
  const label = root.querySelector<HTMLElement>(".wrap-label");
  const slices = label ? [...label.querySelectorAll<HTMLElement>(".wrap-slice")] : [];
  const bent = { bend: reduce ? 1 : 0, turn: reduce ? 0.35 : 0, hand: 0 };

  const drawWrap = () => {
    if (!label || !slices.length) return;
    const W = label.offsetWidth;
    const n = slices.length;
    const sw = W / n;
    const A = bent.bend * Math.PI * 2 * COVER; // the angle the whole label goes round
    const r = A > 1e-4 ? W / A : 0;
    const phi = (bent.turn + bent.hand) * bent.bend; // only a bent label can turn
    slices.forEach((el, i) => {
      const s = (i + 0.5 - n / 2) * sw; // where this strip sits along the flat label
      let x = s;
      let z = 0;
      let a = 0;
      if (r) {
        a = (s / W) * A + phi;
        x = r * Math.sin(a);
        z = -(r - r * Math.cos(a));
      }
      el.style.transform = `translate3d(${x.toFixed(2)}px,0,${z.toFixed(2)}px) rotateY(${a.toFixed(4)}rad)`;
      el.style.setProperty("--shade", Math.min(0.55, (1 - Math.cos(a)) * 0.4).toFixed(3));
      // the far side is behind the bottle
      el.style.visibility = Math.cos(a) < -0.1 && bent.bend > 0.3 ? "hidden" : "";
    });
  };

  if (label && wrapCell) {
    drawWrap();
    label.dataset.ready = "";
    const handTo = follower(0, (v) => {
      bent.hand = v;
      drawWrap();
    }, 0.6);
    on(wrapCell.el, "pointermove", (e) => {
      if (e.pointerType === "touch") return;
      handTo(local(wrapCell.el, e).x * 1.1);
    });
    on(wrapCell.el, "pointerleave", () => handTo(0));
  }

  /* ---------------------------------------------------------------- foil catches the light */
  const foil = root.querySelector<HTMLElement>("[data-foil]");
  const foilCell = cellOf("foil");
  const REST = 0.62;
  const foilState = { f: REST };
  const applyFoil = (f: number) => {
    foilState.f = f;
    if (foil) setVar(foil, "--gx", lightAt(f));
  };
  if (foil && foilCell) {
    const lightTo = follower(REST, applyFoil, 0.5);
    on(foilCell.el, "pointermove", (e) => {
      if (e.pointerType === "touch") return;
      lightTo(gsap.utils.clamp(-0.3, 1.3, (local(foil, e).x + 1) / 2));
    });
    on(foilCell.el, "pointerleave", () => lightTo(REST));
  }

  // a trigger that is already past fires while the context is still being built: run it inline
  let ctx: gsap.Context | null = null;
  const later = (play: () => void) => (ctx ? ctx.add(play) : play());
  const presses: HTMLElement[] = [];

  ctx = gsap.context(() => {
    if (reduce) return;

    // per-label moments, played as the label goes on (or at once if it is already on)
    const moments: Record<string, { setup: () => void; play: () => gsap.core.Animation | void }> = {};

    /* -------------------------------------------------------------- the proof ticks off */
    const proof = cellOf("proof");
    if (proof) {
      const ticks = [...proof.el.querySelectorAll<HTMLElement>("[data-tick]")];
      const seal = proof.el.querySelector<HTMLElement>("[data-slap]");
      moments.proof = {
        setup: () => {
          gsap.set(ticks, { "--t": 0 });
          if (seal) gsap.set(seal, { "--slap": 1 });
        },
        play: () => {
          const tl = gsap.timeline();
          tl.to(ticks, { "--t": 1, duration: 0.42, ease: "slap", stagger: 0.3 }, 0.1);
          if (seal) tl.to(seal, { "--slap": 0, duration: 0.5, ease: "slap" }, 0.1 + ticks.length * 0.3);
          return tl;
        },
      };
    }

    /* -------------------------------------------------------------- swatches, shapes, shelf */
    const swatches = cellOf("stock")?.el.querySelector<HTMLElement>("[data-swatches]");
    if (swatches)
      moments.stock = {
        setup: () => (swatches.dataset.closed = ""),
        play: () => {
          gsap.delayedCall(0.15, () => delete swatches.dataset.closed);
        },
      };
    const fan = cellOf("shapes")?.el.querySelector<HTMLElement>("[data-fan]");
    if (fan && fine)
      moments.shapes = {
        setup: () => {},
        play: () => {
          fan.dataset.open = "";
          gsap.delayedCall(1.6, () => delete fan.dataset.open);
        },
      };
    const shelf = cellOf("shelf")?.el.querySelector<HTMLElement>("[data-shelf]");
    if (shelf)
      moments.shelf = {
        setup: () => {},
        play: () => {
          shelf.dataset.picked = "";
          gsap.delayedCall(1.5, () => delete shelf.dataset.picked);
        },
      };

    /* -------------------------------------------------------------- a light over the foil */
    if (foil && foilCell) {
      if (fine) {
        moments.foil = {
          setup: () => applyFoil(-0.4),
          play: () =>
            gsap.fromTo(foilState, { f: -0.4 }, { f: REST, duration: 1.5, ease: "power2.inOut", onUpdate: () => applyFoil(foilState.f) }),
        };
      } else {
        ScrollTrigger.create({
          trigger: foilCell.el,
          start: "top 80%",
          end: "bottom 25%",
          onUpdate: (self) => applyFoil(-0.3 + self.progress * 1.6),
        });
      }
    }

    /* -------------------------------------------------------------- the label bends round the bottle */
    if (label && wrapCell) {
      ScrollTrigger.create({
        trigger: wrapCell.el,
        start: "top 42%",
        end: "bottom 8%",
        onUpdate: (self) => {
          const t = self.progress;
          bent.bend = gsap.parseEase("power2.inOut")(gsap.utils.clamp(0, 1, t / 0.5));
          bent.turn = Math.max(0, t - 0.5) * 1.6; // and keeps turning as you scroll on
          drawWrap();
        },
        onRefresh: drawWrap,
      });
    }

    /* -------------------------------------------------------------- smoothed on */
    const fold = window.innerHeight;
    const webW = web.offsetWidth || 1;
    cells.forEach((c: CellRef) => {
      const moment = moments[c.name];
      if (c.el.getBoundingClientRect().top < fold) {
        // already on screen (or above it): it is on; its moment plays when it is well in view
        if (moment)
          ScrollTrigger.create({ trigger: c.el, start: "center 80%", once: true, onEnter: () => later(() => moment.play()) });
        return;
      }

      // the band of light that runs down the label as it is pressed on
      const press = document.createElement("i");
      press.className = "cell-press";
      press.setAttribute("aria-hidden", "true");
      c.el.querySelector(".cell-face")?.appendChild(press);
      presses.push(press);

      const rest = parseFloat(getComputedStyle(c.lift).getPropertyValue("--corner")) || 0;
      gsap.set(c.el, { zIndex: 3 });
      gsap.set(c.lift, { transformPerspective: 1100, transformOrigin: "50% 0%", rotationX: 26, z: 26, "--corner": 1 });
      gsap.set(c.shadow, { opacity: 0.75, y: 34, scaleY: 0.92, transformOrigin: "50% 0%" });
      gsap.set(press, { yPercent: -100, opacity: 0 });
      moment?.setup();

      ScrollTrigger.create({
        trigger: c.el,
        start: `top ${ENTER_AT * 100}%`,
        once: true,
        onEnter: () =>
          later(() => {
            // labels side by side go on left to right
            const delay = (c.el.offsetLeft / webW) * 0.2;
            const h = c.el.offsetHeight;
            const tl = gsap.timeline({
              delay,
              onComplete: () => {
                gsap.set([c.lift, c.shadow], { clearProps: "transform,opacity,--corner" });
                gsap.set(c.el, { clearProps: "zIndex" });
                press.remove();
              },
            });
            // pressed down from the top edge; the last of it settles firmly
            tl.to(c.lift, { rotationX: 0, z: 0, duration: 0.85, ease: "power3.inOut" }, 0)
              .to(c.shadow, { opacity: 0, y: 0, scaleY: 1, duration: 0.85, ease: "power3.inOut" }, 0)
              .fromTo(press, { y: 0, yPercent: -100, opacity: 0.9 }, { y: h, yPercent: 0, opacity: 0.35, duration: 0.85, ease: "power3.inOut" }, 0)
              .to(press, { opacity: 0, duration: 0.25 }, 0.7)
              .to(c.lift, { "--corner": rest, duration: 0.6, ease: "slap" }, 0.55);
            if (moment) tl.add(() => void moment.play(), 0.6);
          }),
      });
    });

    kit.tilt();
  }, root);

  return () => {
    kit.cleanup();
    ctx?.revert();
    presses.forEach((p) => p.remove());
    slices.forEach((el) => {
      el.style.transform = "";
      el.style.visibility = "";
      el.style.removeProperty("--shade");
    });
    if (label) delete label.dataset.ready;
  };
}
