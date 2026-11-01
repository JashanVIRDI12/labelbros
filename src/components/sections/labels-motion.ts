"use client";

import { gsap, ScrollTrigger } from "@/lib/scroll";

/*
 * The shelf: vertical scroll drives the row sideways (pinned stage, scrub). Each product's
 * flat label peels out from behind it as the product reaches the middle of the screen and
 * tucks back as it leaves; the labels travel a little faster than the products, for depth.
 */

const MODE = "(scripting: enabled) and (prefers-reduced-motion: no-preference)";

export function init(root: HTMLElement) {
  if (!window.matchMedia(MODE).matches) return () => {};
  const track = root.querySelector<HTMLElement>(".shelf-track");
  const row = root.querySelector<HTMLElement>(".shelf-row");
  if (!track || !row) return () => {};

  const ctx = gsap.context(() => {
    const distance = () => Math.max(0, row.offsetWidth - window.innerWidth);
    // the pinned stage needs exactly as much scroll as the row has to travel
    const fit = () => {
      track.style.height = `${window.innerHeight + distance()}px`;
    };
    fit();
    ScrollTrigger.addEventListener("refreshInit", fit);

    const move = gsap.to(row, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });

    root.querySelectorAll<HTMLElement>("[data-bay]").forEach((bay) => {
      const label = bay.querySelector<HTMLElement>("[data-label]");
      const photo = bay.querySelector<HTMLElement>("[data-photo]");
      if (!label || !photo) return;
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: bay,
            containerAnimation: move,
            start: "left 85%",
            end: "right 15%",
            scrub: true,
          },
        })
        // out from behind the product...
        .fromTo(label, { xPercent: -55, rotation: 0, scale: 0.86, opacity: 0 }, { xPercent: 0, rotation: () => Number(label.style.getPropertyValue("--r").replace("deg", "")) || 0, scale: 1, opacity: 1, duration: 0.35, ease: "power3.out" })
        .fromTo(photo, { scale: 0.94 }, { scale: 1, duration: 0.35, ease: "power2.out" }, 0)
        // ...hold in the middle...
        .to({}, { duration: 0.3 })
        // ...and on past
        .to(label, { xPercent: 18, y: -14, duration: 0.35 });
    });
    ScrollTrigger.refresh();

    return () => ScrollTrigger.removeEventListener("refreshInit", fit);
  }, root);

  return () => {
    ctx.revert();
    track.style.height = "";
  };
}
