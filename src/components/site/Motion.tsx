"use client";

import { useEffect, useRef } from "react";

type Module = { init: (root: HTMLElement) => () => void };

// Each section's scroll choreography lives in its own chunk and loads when the section gets
// within a couple of screens, so GSAP and ScrollTrigger never cost the first paint anything.
const LOADERS = {
  deck: () => import("@/components/sections/deck-motion") as Promise<Module>,
  process: () => import("@/components/sections/process-motion") as Promise<Module>,
  kit: () => import("@/components/sections/kit-motion") as Promise<Module>,
  footer: () => import("@/components/sections/footer-motion") as Promise<Module>,
};

export type MotionName = keyof typeof LOADERS;

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
