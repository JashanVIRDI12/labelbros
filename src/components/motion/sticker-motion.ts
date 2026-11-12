"use client";

import { gsap, reduced, ScrollTrigger } from "@/lib/scroll";

/*
 * The material cards (StickerCards.tsx). Once the cards are in view a light passes across each
 * material tag in turn (--mx from beyond the left edge to the middle); with a mouse, the light
 * then follows the pointer over a card and drifts back to the middle when it leaves.
 */
export function init(root: HTMLElement) {
  if (reduced()) return () => {};
  const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-sm-card]"));
  if (!cards.length) return () => {};
  const off: (() => void)[] = [];

  const ctx = gsap.context(() => {
    gsap.set(cards, { "--mx": -0.3 });
    ScrollTrigger.batch(cards, {
      start: "top 85%",
      once: true,
      onEnter: (batch) => gsap.to(batch, { "--mx": 0.5, duration: 1.5, ease: "power2.out", stagger: 0.14, delay: 0.35 }),
    });

    if (window.matchMedia("(pointer: fine)").matches)
      for (const card of cards) {
        const move = (e: PointerEvent) => {
          const r = card.getBoundingClientRect();
          gsap.to(card, { "--mx": (e.clientX - r.left) / r.width, "--my": (e.clientY - r.top) / r.height, duration: 0.6, ease: "power3.out", overwrite: "auto" });
        };
        const leave = () => gsap.to(card, { "--mx": 0.5, "--my": 0.5, duration: 1, ease: "power3.out", overwrite: "auto" });
        card.addEventListener("pointermove", move);
        card.addEventListener("pointerleave", leave);
        off.push(() => {
          card.removeEventListener("pointermove", move);
          card.removeEventListener("pointerleave", leave);
        });
      }
  }, root);

  return () => {
    for (const f of off) f();
    ctx.revert();
  };
}
