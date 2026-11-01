"use client";

import { gsap, ScrollTrigger, reducedMotion } from "@/lib/scroll";
import { KIT } from "./SampleKit";

/*
 * The envelope, scrubbed as it scrolls in: the seal peels off, the flap swings open, and the
 * samples come out and fan into a hand (throws: power3.out). Positions scale with the scene.
 */

export function init(root: HTMLElement) {
  if (reducedMotion()) return () => {};
  const q = gsap.utils.selector(root);
  const scene = q<HTMLElement>(".kit-scene")[0];
  if (!scene) return () => {};

  const ctx = gsap.context(() => {
    const W = () => scene.offsetWidth;
    const samples = q<HTMLElement>("[data-sample]");
    const flap = q(".kit-flap");
    const seal = q(".kit-seal");

    // the sealed envelope
    gsap.set(flap, { rotationX: 0, zIndex: 3 });
    gsap.set(seal, { xPercent: -50, yPercent: -50, x: 0, y: 0, rotation: -8, opacity: 1 });
    gsap.set(samples, {
      xPercent: -50,
      yPercent: -50,
      x: (i: number) => KIT[i].x * W() * 0.18,
      y: () => W() * 0.12,
      rotation: (i: number) => KIT[i].r * 0.25,
      scale: 0.86,
    });

    const tl = gsap.timeline({ defaults: { ease: "none" } });
    tl.to(seal, { x: () => W() * 0.1, y: () => -W() * 0.12, rotation: 26, opacity: 0, duration: 0.2, ease: "peel" }, 0);
    tl.to(flap, { rotationX: 180, duration: 0.32, ease: "power2.inOut" }, 0.1);
    tl.set(flap, { zIndex: 0 }, 0.26);
    tl.to(
      samples,
      {
        x: (i: number) => KIT[i].x * W(),
        y: (i: number) => KIT[i].y * W(),
        rotation: (i: number) => KIT[i].r,
        scale: 1,
        duration: 0.5,
        stagger: 0.05,
        ease: "power3.out",
      },
      0.3,
    );

    ScrollTrigger.create({
      trigger: scene,
      start: "top 82%",
      end: "center 56%",
      scrub: 0.6,
      animation: tl,
      invalidateOnRefresh: true,
    });
  }, root);

  return () => ctx.revert();
}
