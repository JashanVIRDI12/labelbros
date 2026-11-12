"use client";

import { useEffect, useRef } from "react";

type Module = { init: (root: HTMLElement) => () => void };

// Each section's motion lives in its own chunk and loads when the section gets within a couple
// of screens, so GSAP and ScrollTrigger never cost the first paint anything.
const LOADERS = {
  reveal: () => import("@/components/motion/reveal-motion") as Promise<Module>,
  tape: () => import("@/components/motion/tape-motion") as Promise<Module>,
  process: () => import("@/components/motion/process-motion") as Promise<Module>,
  stickers: () => import("@/components/motion/sticker-motion") as Promise<Module>,
  magnet: () => import("@/components/motion/magnet-motion") as Promise<Module>,
  bulk: () => import("@/components/motion/bulk-motion") as Promise<Module>,
  steps: () => import("@/components/motion/steps-motion") as Promise<Module>,
  footer: () => import("@/components/motion/footer-motion") as Promise<Module>,
};

export type MotionName = keyof typeof LOADERS;

/** Runs a motion module on the nearest [data-motion-root] once it is within two screens. */
export function Motion({ name }: { name: MotionName }) {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = marker.current?.closest<HTMLElement>("[data-motion-root]");
    if (!root) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        LOADERS[name]().then((m) => {
          if (!cancelled) cleanup = m.init(root);
        });
      },
      { rootMargin: "200% 0px" },
    );
    io.observe(root);
    return () => {
      cancelled = true;
      io.disconnect();
      cleanup?.();
    };
  }, [name]);

  return <span ref={marker} hidden />;
}
