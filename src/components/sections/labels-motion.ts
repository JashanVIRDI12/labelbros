"use client";

import { gsap, ScrollTrigger } from "@/lib/scroll";

/*
 * The shelf, labelled one product at a time (scrubbed by the page's scroll, under a pinned stage).
 * For each product: its flat label comes down from above, in hand (power3.out), and slaps onto the
 * spot where it goes (slap), the container giving a little; a wrap-around label then wraps round
 * the bottle. Under cover of the label the bare photo turns into the labelled one, and the flat
 * label is smoothed away left to right, a shine riding the squeegee's edge. The shelf tag swings
 * in under the product with what it is printed on. Last, the empty spot at the end of the shelf
 * firms up and its button slaps down: "Your product next".
 */

// phones get the still layout (a swipeable row / a grid): pinned scrolling is too long there
const MODE = "(min-width: 768px) and (scripting: enabled) and (prefers-reduced-motion: no-preference)";
const WIDE = "(min-width: 1024px)";
const STEP = 0.5; // screens of scroll per product
const END = 0.7; // and for the finale, in steps
const DONE = 0.55; // how far into its step a product counts as labelled

export function init(root: HTMLElement) {
  if (!window.matchMedia(MODE).matches) return () => {};
  const track = root.querySelector<HTMLElement>(".shelf-track");
  const area = root.querySelector<HTMLElement>("[data-shelf-area]");
  const row = root.querySelector<HTMLElement>(".shelf-row");
  const now = root.querySelector<HTMLElement>("[data-now]");
  const nowWhat = root.querySelector<HTMLElement>("[data-now-what]");
  const nowSpec = root.querySelector<HTMLElement>("[data-now-spec]");
  const youSolid = root.querySelector<HTMLElement>("[data-you-solid]");
  const youMove = root.querySelector<HTMLElement>("[data-you-move]");
  const bays = gsap.utils.toArray<HTMLElement>("[data-bay]", root);
  if (!track || !area || !row || !now || !nowWhat || !nowSpec || !youSolid || !youMove || !bays.length) return () => {};

  const wide = window.matchMedia(WIDE);
  let shown = -1;

  const ctx = gsap.context(() => {
    const total = bays.length + END;
    // the pinned stage needs exactly as much scroll as the labelling takes
    const fit = () => {
      track.style.height = `${Math.round(window.innerHeight * (1 + total * STEP))}px`;
    };
    fit();
    ScrollTrigger.addEventListener("refreshInit", fit);

    // the tag: swings in under the product just labelled (on phones it stays put, under both shelves)
    const tag = (i: number) => {
      if (i === shown) return;
      shown = i;
      gsap.killTweensOf(now);
      if (i < 0) {
        gsap.to(now, { autoAlpha: 0, rotation: -4, duration: 0.2, ease: "power2.in" });
        return;
      }
      const bay = bays[i];
      gsap
        .timeline()
        .to(now, { autoAlpha: 0, rotation: -4, duration: 0.14, ease: "power2.in" })
        .call(() => {
          nowWhat.textContent = bay.dataset.what ?? "";
          nowSpec.textContent = bay.dataset.spec ?? "";
          let x = 0;
          if (wide.matches) {
            // under the product, but never past the shelf's right-hand end
            const from = row.getBoundingClientRect().left;
            const left = bay.getBoundingClientRect().left - from;
            const max = area.getBoundingClientRect().right - parseFloat(getComputedStyle(area).paddingRight) - from - now.offsetWidth;
            x = Math.max(0, Math.min(left, max));
          }
          gsap.set(now, { x });
        })
        .fromTo(now, { autoAlpha: 0, rotation: -7 }, { autoAlpha: 1, rotation: -1.5, duration: 0.5, ease: "slap" });
    };

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      // the playhead (not the scroll, which the scrub trails): which product was labelled last
      onUpdate: () => {
        const t = tl.time();
        let active = -1;
        bays.forEach((_, i) => {
          if (t >= i + DONE) active = i;
        });
        tag(t >= bays.length ? -1 : active);
      },
      scrollTrigger: {
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });

    bays.forEach((bay, i) => {
      const fly = bay.querySelector<HTMLElement>("[data-fly]");
      const flat = bay.querySelector<HTMLElement>("[data-flat]");
      const shine = bay.querySelector<HTMLElement>("[data-shine]");
      const bar = bay.querySelector<HTMLElement>("[data-shine-bar]");
      const full = bay.querySelector<HTMLElement>("[data-full]");
      const photos = bay.querySelector<HTMLElement>("[data-photos]");
      const spot = fly?.parentElement;
      if (!fly || !flat || !shine || !bar || !full || !photos || !spot) return;
      const at = i;
      const turn = i % 2 ? -1 : 1;

      tl
        // the bare container is all you see at first
        .fromTo(full, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.16 }, at + 0.44)
        // the label, in hand: from above the product, big and turned, to just over its spot...
        .fromTo(fly, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, at)
        .fromTo(
          fly,
          {
            x: () => area.clientWidth * 0.05 * turn,
            y: () => -(spot.offsetTop + spot.offsetHeight + area.clientHeight * 0.16),
            rotation: 11 * turn,
            scale: 1.35,
          },
          { x: 0, y: () => -spot.offsetHeight * 0.32, rotation: 4 * turn, scale: 1.1, duration: 0.3, ease: "power3.out" },
          at,
        )
        // ...then down onto it
        .to(fly, { y: 0, rotation: 0, scale: 1, duration: 0.12, ease: "slap" }, at + 0.3)
        .to(photos, { scaleY: 0.975, duration: 0.03, ease: "power1.in" }, at + 0.39)
        .to(photos, { scaleY: 1, duration: 0.1, ease: "slap" }, at + 0.42);

      // a wrap-around label wraps round the bottle
      if (fly.hasAttribute("data-wrap")) {
        tl.to(fly, { scaleX: () => spot.offsetWidth / fly.offsetWidth, duration: 0.12, ease: "power2.inOut" }, at + 0.44);
      }

      tl
        // smoothed on: the flat label gives way, left to right, to the printed one; the shine rides the edge
        .fromTo(flat, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 100%)", duration: 0.26 }, at + 0.54)
        .fromTo(bar, { xPercent: -100 }, { xPercent: 560, duration: 0.26 }, at + 0.54)
        .fromTo(shine, { opacity: 0 }, { opacity: 1, duration: 0.04 }, at + 0.54)
        .to(shine, { opacity: 0, duration: 0.05 }, at + 0.75)
        .to(fly, { autoAlpha: 0, duration: 0.02 }, at + 0.8);
    });

    // the finale: the empty spot firms up and its button slaps down
    const end = bays.length;
    tl.fromTo(youSolid, { opacity: 0 }, { opacity: 1, duration: 0.15 }, end)
      .to(youMove, { scale: 1.14, rotation: -5, duration: 0.14, ease: "power2.out" }, end + 0.05)
      .to(youMove, { scale: 1, rotation: -2, duration: 0.16, ease: "slap" }, end + 0.19)
      .to({}, { duration: END - 0.35 }, end + 0.35);

    ScrollTrigger.refresh();

    return () => ScrollTrigger.removeEventListener("refreshInit", fit);
  }, root);

  return () => {
    ctx.revert();
    track.style.height = "";
  };
}
