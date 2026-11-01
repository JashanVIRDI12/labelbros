"use client";

import { useEffect, useRef } from "react";
import type { StickerStage } from "./engine/stage";
import { STICKER_EVENT, STICKER_RESET } from "./StickerControls";

/**
 * The interactive layer of the hero: a WebGL table of real-feeling stickers you can peel,
 * drag and throw. Loads after the headline has painted, so it never holds up the first screen.
 */
export function StickerTable() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    let cancelled = false;
    let st: StickerStage | null = null;
    const status = { ready: false, moved: false };
    const emit = () => document.dispatchEvent(new CustomEvent(STICKER_EVENT, { detail: { ...status } }));
    const onReset = () => st?.reset();
    document.addEventListener(STICKER_RESET, onReset);

    const start = async () => {
      const { StickerStage } = await import("./engine/stage");
      if (cancelled) return;
      st = new StickerStage({
        host,
        mount: el.querySelector<HTMLElement>("[data-mount]")!,
        proxies: el.querySelector<HTMLElement>("[data-proxies]")!,
        chip: el.querySelector<HTMLElement>("[data-chip]")!,
        reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        onMovedChange: (moved) => {
          status.moved = moved;
          emit();
        },
        onReady: () => {
          status.ready = true;
          emit();
        },
      });
      const ok = await st.init();
      if (!ok && !cancelled) st.destroy();
    };

    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(() => void start(), { timeout: 700 })
      : window.setTimeout(() => void start(), 250);

    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      document.removeEventListener(STICKER_RESET, onReset);
      st?.destroy();
    };
  }, []);

  return (
    <div ref={root} className="contents">
      <div data-mount className="pointer-events-none absolute inset-0 z-10" />
      <div
        data-proxies
        role="group"
        aria-label="Stickers on the table"
        className="pointer-events-none absolute inset-0 z-20"
      />
      <div data-chip data-show="false" aria-hidden="true" className="sticker-chip">
        <span data-name className="block font-semibold" />
        <span data-spec className="block text-[#bdb8ad]" />
      </div>
    </div>
  );
}
