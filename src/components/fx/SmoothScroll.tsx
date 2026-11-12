"use client";

import { useEffect } from "react";

/*
 * Smooth, weighted scrolling (Lenis) driven by GSAP's ticker and kept in step with ScrollTrigger,
 * so pinned and scrubbed sections move as one. Loaded after the page is idle; off for reduced
 * motion and on touch screens (their own scrolling is already smooth). It pauses whenever the
 * page is locked (the cart drawer or the menu sets overflow: hidden on <html>).
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(pointer: fine)").matches) return;
    let off = () => {};
    let cancelled = false;
    const start = async () => {
      const [{ default: Lenis }, { gsap, ScrollTrigger }] = await Promise.all([import("lenis"), import("@/lib/scroll")]);
      if (cancelled) return;
      const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, anchors: { offset: -84 } });
      (window as unknown as { __lenis?: unknown }).__lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      const html = document.documentElement;
      const mo = new MutationObserver(() => (html.style.overflow === "hidden" ? lenis.stop() : lenis.start()));
      mo.observe(html, { attributes: true, attributeFilter: ["style"] });
      off = () => {
        mo.disconnect();
        gsap.ticker.remove(raf);
        lenis.destroy();
        delete (window as unknown as { __lenis?: unknown }).__lenis;
      };
    };
    const idle = typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(() => void start(), { timeout: 1200 }) : window.setTimeout(() => void start(), 300);
    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle as number);
      else window.clearTimeout(idle as number);
      off();
    };
  }, []);
  return null;
}
