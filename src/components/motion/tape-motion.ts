"use client";

import { gsap, reduced, ScrollTrigger } from "@/lib/scroll";

/*
 * The tape strips run on their own, faster the faster you scroll, leaning into the movement, and
 * turning round when you scroll back up (after React Bits' Scroll Velocity). Each strip holds
 * its words three times over and wraps by one set, so it never ends.
 */
export function init(root: HTMLElement) {
  if (reduced()) return () => {};
  const rows = [...root.querySelectorAll<HTMLElement>("[data-tape-row]")].map((row) => {
    const track = row.querySelector<HTMLElement>(".tape-track")!;
    return { track, dir: Number(row.dataset.dir) || 1, x: 0, set: track.scrollWidth / 3, skew: gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3.out" }) };
  });
  let vel = 0;
  let boost = 0;
  let way = 1;
  let visible = false;
  const st = ScrollTrigger.create({
    trigger: root,
    start: "top bottom",
    end: "bottom top",
    onUpdate: (s) => {
      vel = s.getVelocity();
      if (Math.abs(vel) > 40) way = vel > 0 ? 1 : -1;
    },
  });
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(root);
  const ro = new ResizeObserver(() => rows.forEach((r) => (r.set = r.track.scrollWidth / 3)));
  ro.observe(root);
  let last = performance.now();
  const tick = () => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!visible) return;
    boost += (Math.min(Math.abs(vel) / 350, 9) - boost) * 0.08;
    vel *= 0.9;
    for (const r of rows) {
      r.x += r.dir * way * (1 + boost) * 70 * dt;
      if (r.x <= -r.set) r.x += r.set;
      if (r.x > 0) r.x -= r.set;
      gsap.set(r.track, { x: r.x });
      r.skew(gsap.utils.clamp(-10, 10, (-vel / 260) * r.dir));
    }
  };
  gsap.ticker.add(tick);
  return () => {
    gsap.ticker.remove(tick);
    st.kill();
    io.disconnect();
    ro.disconnect();
  };
}
