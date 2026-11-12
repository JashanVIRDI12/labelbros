"use client";

import { useEffect } from "react";

/*
 * The header stays in reach: it tucks away while you scroll down a page and comes back the
 * moment you scroll up (data-hidden on the header; the slide is CSS). It never hides while one
 * of its menus is open or near the top of the page.
 */
export function HeaderScroll() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-header]");
    if (!header) return;
    let last = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const open = header.querySelector("[data-open]");
      const down = y > last + 4;
      const up = y < last - 4;
      if (y < 160 || up || open) header.removeAttribute("data-hidden");
      else if (down) header.setAttribute("data-hidden", "");
      header.toggleAttribute("data-scrolled", y > 8);
      if (down || up) last = y;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return null;
}
