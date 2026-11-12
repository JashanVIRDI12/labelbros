"use client";

import { gsap } from "@/lib/gsap";

/*
 * A label landing on a product photo (ProductMedia's <Applied apply>): the bare product shows,
 * the flat label comes in from above in hand (power3.out), slaps onto its spot (slap) and the
 * product gives a little; a wrap-around label wraps round the bottle. Under cover of the flat
 * label the labelled photo takes over, and the flat one is smoothed away left to right.
 */

export const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Parts = { el: HTMLElement; full: HTMLElement; flat: HTMLElement; wrap: boolean };

export function parts(el: HTMLElement): Parts | null {
  const full = el.querySelector<HTMLElement>(".applied-full");
  const flat = el.querySelector<HTMLElement>(".applied-flat");
  if (!full || !flat) return null;
  return { el, full, flat, wrap: el.hasAttribute("data-wrap") };
}

/** The bare product, ready for its label. */
export function ready(p: Parts) {
  gsap.set(p.full, { autoAlpha: 0 });
  gsap.set(p.flat, { autoAlpha: 0, clipPath: "inset(0% 0% 0% 0%)" });
}

/** The label going on, as a timeline (added to `tl` at `at` when given). */
export function applyLabel(p: Parts, turn = 1, tl = gsap.timeline(), at = 0) {
  const h = p.el.clientHeight || 200;
  tl.fromTo(
    p.flat,
    { autoAlpha: 0, y: -h * 0.42, x: 18 * turn, rotation: 11 * turn, scale: 1.32, scaleX: p.wrap ? 1.5 : 1.32 },
    { autoAlpha: 1, y: -h * 0.04, x: 0, rotation: 3 * turn, scale: 1.06, scaleX: p.wrap ? 1.25 : 1.06, duration: 0.34, ease: "power3.out" },
    at,
  )
    .to(p.flat, { y: 0, rotation: 0, scale: 1, scaleX: p.wrap ? 1.18 : 1, duration: 0.14, ease: "slap" }, at + 0.34)
    .to(p.el, { scaleY: 0.982, duration: 0.05, ease: "power1.in", transformOrigin: "50% 100%" }, at + 0.44)
    .to(p.el, { scaleY: 1, duration: 0.16, ease: "slap" }, at + 0.49);
  if (p.wrap) tl.to(p.flat, { scaleX: 1, duration: 0.18, ease: "power2.inOut" }, at + 0.5);
  tl.set(p.full, { autoAlpha: 1 }, at + 0.6)
    .to(p.flat, { clipPath: "inset(0% 0% 0% 100%)", duration: 0.36, ease: "power2.inOut" }, at + 0.64)
    .set(p.flat, { autoAlpha: 0 }, at + 1.02);
  return tl;
}

/** Wait (a little) for images to be ready to paint, so nothing pops in mid-move. */
export function decoded(root: HTMLElement, ms = 2500) {
  const imgs = [...root.querySelectorAll("img")];
  return Promise.race([
    Promise.all(imgs.map((i) => (i.complete && i.naturalWidth ? Promise.resolve() : i.decode().catch(() => undefined)))),
    new Promise((r) => setTimeout(r, ms)),
  ]);
}
