"use client";

import { gsap, reduced } from "@/lib/scroll";

/*
 * Magnetic buttons ([data-magnetic]): with a mouse, a button leans towards the cursor when it
 * comes near and springs back when it leaves (after React Bits' Magnet). Mice only.
 */
export function init(root: HTMLElement) {
  if (reduced() || !window.matchMedia("(pointer: fine)").matches) return () => {};
  const offs: (() => void)[] = [];
  for (const el of root.querySelectorAll<HTMLElement>("[data-magnetic]")) {
    const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.28);
      y((e.clientY - (r.top + r.height / 2)) * 0.35);
    };
    const leave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "power3.out" });
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    offs.push(() => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    });
  }
  return () => offs.forEach((f) => f());
}
