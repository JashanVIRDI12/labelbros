"use client";

import { gsap, reducedMotion } from "@/lib/scroll";

/*
 * What every sticker cell does, on the stickers sheet and the labels roll: helpers for the
 * per-cell demos and the shared pointer behaviour.
 *
 * Tilt: the cell tilts so the edge nearest the pointer lifts, its artwork drifts the other way
 * (it sits above the surface) and the corner peels (CSS). Touch: press and hold to tilt it towards
 * your finger (the short wait means a scroll that starts on a cell never wobbles it).
 *
 * GSAP only animates elements without CSS `translate` / `rotate` / `scale` (it folds those into
 * `transform` and then sets them to `none`), so artwork moves through CSS variables or wrappers.
 */

const FINE = "(hover: hover) and (pointer: fine)";
const HOLD = 180; // ms of holding still before a touch tilts a cell

export type CellRef = {
  el: HTMLElement;
  name: string;
  lift: HTMLElement;
  body: HTMLElement;
  shadow: HTMLElement;
  art: HTMLElement | null;
};

export type Follow = (v: number) => unknown;

export function cellKit(root: HTMLElement) {
  const reduce = reducedMotion();
  const fine = window.matchMedia(FINE).matches;

  const offs: (() => void)[] = [];
  const on = <K extends keyof HTMLElementEventMap>(el: Element, type: K, fn: (e: HTMLElementEventMap[K]) => void) => {
    el.addEventListener(type, fn as EventListener);
    offs.push(() => el.removeEventListener(type, fn as EventListener));
  };

  const cells: CellRef[] = [...root.querySelectorAll<HTMLElement>("[data-cell]")].map((el) => ({
    el,
    name: el.dataset.cell ?? "",
    lift: el.querySelector<HTMLElement>("[data-lift]")!,
    body: el.querySelector<HTMLElement>("[data-body]")!,
    shadow: el.querySelector<HTMLElement>(".cell-shadow")!,
    art: el.querySelector<HTMLElement>("[data-art]"),
  }));
  const cellOf = (name: string) => cells.find((c) => c.name === name);

  /** Pointer position over an element, -1..1 each way. */
  const local = (el: Element, e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1 };
  };

  /** A value that eases towards each new target (jumps with reduced motion) and applies itself. */
  const follower = (start: number, apply: (v: number) => void, duration = 0.45): Follow => {
    const o = { v: start };
    if (reduce)
      return (v: number) => {
        o.v = v;
        apply(v);
      };
    return gsap.quickTo(o, "v", { duration, ease: "power3.out", onUpdate: () => apply(o.v) });
  };

  // CSS variables we write, so cleanup can take them off again
  const written = new Map<HTMLElement, Set<string>>();
  const setVar = (el: HTMLElement, name: string, value: string) => {
    if (!written.has(el)) written.set(el, new Set());
    written.get(el)!.add(name);
    el.style.setProperty(name, value);
  };

  /** A light at f (0 = left edge, 1 = right edge), as the background position of a 300% glare. */
  const lightAt = (f: number) => `${(((1.5 - f) / 2) * 100).toFixed(2)}%`;

  /** Tilt, lift and parallax for every cell. Call inside the page's gsap.context (motion only). */
  const tilt = () => {
    cells.forEach((c) => {
      gsap.set(c.body, { transformPerspective: 1100 });
      let rx: Follow | null = null;
      let ry: Follow | null = null;
      let ax: Follow | null = null;
      let ay: Follow | null = null;

      const grab = () => {
        rx = gsap.quickTo(c.body, "rotationX", { duration: 0.6, ease: "power3.out" });
        ry = gsap.quickTo(c.body, "rotationY", { duration: 0.6, ease: "power3.out" });
        if (c.art) {
          ax = gsap.quickTo(c.art, "x", { duration: 0.7, ease: "power3.out" });
          ay = gsap.quickTo(c.art, "y", { duration: 0.7, ease: "power3.out" });
        }
        gsap.to(c.body, { scale: 1.012, duration: 0.45, ease: "expo.out", overwrite: "auto" });
      };
      const follow = (e: PointerEvent) => {
        if (!rx || !ry) return;
        const w = c.el.offsetWidth;
        const h = c.el.offsetHeight;
        // big cells tilt less; the edge nearest the pointer comes up
        const max = gsap.utils.clamp(2.5, 8, 2000 / Math.max(w, h));
        const p = local(c.el, e);
        rx(p.y * max);
        ry(-p.x * max);
        // artwork sits above the surface, so it drifts away from the raised edge
        const depth = Math.min(w, h) * 0.024;
        ax?.(-p.x * depth);
        ay?.(-p.y * depth);
      };
      const release = () => {
        rx = ry = ax = ay = null;
        gsap.to(c.body, { rotationX: 0, rotationY: 0, scale: 1, duration: 0.6, ease: "slap", overwrite: true });
        if (c.art) gsap.to(c.art, { x: 0, y: 0, duration: 0.6, ease: "slap", overwrite: true });
      };

      if (fine) {
        on(c.el, "pointerenter", (e) => {
          if (e.pointerType === "touch") return;
          grab();
          follow(e);
        });
        on(c.el, "pointermove", (e) => {
          if (e.pointerType === "touch") return;
          // using a control (a slider, a text field): hold the cell still
          if (e.buttons && (e.target as HTMLElement).closest("input")) return;
          if (!rx) grab(); // the pointer was already here when this loaded
          follow(e);
        });
        on(c.el, "pointerleave", release);
      } else {
        let hold = 0;
        let sx = 0;
        let sy = 0;
        on(c.el, "pointerdown", (e) => {
          if ((e.target as HTMLElement).closest("a, input, label")) return;
          sx = e.clientX;
          sy = e.clientY;
          window.clearTimeout(hold);
          hold = window.setTimeout(() => {
            grab();
            follow(e);
          }, HOLD);
        });
        on(c.el, "pointermove", (e) => {
          if (rx) follow(e);
          else if (Math.hypot(e.clientX - sx, e.clientY - sy) > 8) window.clearTimeout(hold);
        });
        const end = () => {
          window.clearTimeout(hold);
          if (rx) release();
        };
        on(c.el, "pointerup", end);
        on(c.el, "pointercancel", end);
        offs.push(() => window.clearTimeout(hold));
      }
    });
  };

  /** Listeners off, tilt tweens killed, CSS variables removed. Run before the context reverts. */
  const cleanup = () => {
    offs.forEach((off) => off());
    gsap.killTweensOf(cells.flatMap((c) => (c.art ? [c.body, c.art] : [c.body])));
    written.forEach((names, el) => names.forEach((n) => el.style.removeProperty(n)));
  };

  return { reduce, fine, on, offs, cells, cellOf, local, follower, setVar, lightAt, tilt, cleanup };
}
