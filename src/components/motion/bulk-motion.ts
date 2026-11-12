"use client";

import { gsap, reduced } from "@/lib/scroll";

/*
 * The bulk chart, tied to the scroll: the bars run out one quantity after another as you scroll
 * past, each shorter than the last, so you watch the price of one label fall as the order grows.
 */
export function init(root: HTMLElement) {
  if (reduced()) return () => {};
  const rows = gsap.utils.toArray<HTMLElement>(".bulk-row", root);
  const chart = root.querySelector<HTMLElement>(".bulk-chart");
  if (!rows.length || !chart) return () => {};

  const ctx = gsap.context(() => {
    const bars = rows.map((r) => r.querySelector<HTMLElement>(".bulk-bar > span"));
    const nums = rows.map((r) => r.querySelector<HTMLElement>(".bulk-each"));
    gsap.set(bars, { scaleX: 0 });
    gsap.set(nums, { clipPath: "inset(0% 0% 0% 100%)" });
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: chart, start: "top 80%", end: "bottom 60%", scrub: 0.6 },
    });
    rows.forEach((_, i) => {
      tl.to(bars[i], { scaleX: 1, duration: 1 }, i * 0.55).to(nums[i], { clipPath: "inset(0% 0% 0% 0%)", duration: 0.4 }, i * 0.55 + 0.6);
    });
  }, root);

  return () => ctx.revert();
}
