"use client";

/*
 * Heavy effects (WebGL scenes) start only once the visitor has done something (scrolled, moved
 * the pointer, touched, pressed a key), the page has loaded and the browser is idle, and the
 * element is within `margin` of the screen. Until then the page shows its plain version, so the
 * first paint and the first seconds never pay for them. Returns a function that cancels.
 */
const EVENTS = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;

let interacted = false;
const waiting = new Set<() => void>();
function arm() {
  if (typeof window === "undefined" || interacted) return;
  const go = () => {
    if (interacted) return;
    interacted = true;
    for (const e of EVENTS) window.removeEventListener(e, go);
    for (const fn of waiting) fn();
    waiting.clear();
  };
  for (const e of EVENTS) window.addEventListener(e, go, { passive: true });
}

export function whenReady(el: HTMLElement, start: () => void, margin = "80% 0px") {
  let cancelled = false;
  let io: IntersectionObserver | null = null;
  const watch = () => {
    if (cancelled) return;
    io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io?.disconnect();
        if (!cancelled) start();
      },
      { rootMargin: margin },
    );
    io.observe(el);
  };
  const idle = () => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(watch, { timeout: 2000 }) : setTimeout(watch, 300));
  const afterLoad = () => (document.readyState === "complete" ? idle() : window.addEventListener("load", idle, { once: true }));
  if (interacted) afterLoad();
  else {
    arm();
    waiting.add(afterLoad);
  }
  return () => {
    cancelled = true;
    waiting.delete(afterLoad);
    window.removeEventListener("load", idle);
    io?.disconnect();
  };
}
