"use client";

import { useEffect, useState } from "react";

export const STICKER_EVENT = "lb:stickers";
export const STICKER_RESET = "lb:stickers-reset";

/** The hint under the call to action, and a way to put the stickers back once moved. */
export function StickerControls() {
  const [state, setState] = useState({ ready: false, moved: false });

  useEffect(() => {
    const on = (e: Event) => setState((e as CustomEvent<{ ready: boolean; moved: boolean }>).detail);
    document.addEventListener(STICKER_EVENT, on);
    return () => document.removeEventListener(STICKER_EVENT, on);
  }, []);

  return (
    <div
      data-keepout
      data-ready={state.ready}
      className="table-controls flex min-h-[44px] items-center justify-between gap-4 sm:justify-start lg:self-end"
    >
      <p className="text-14 text-liner-soft" aria-live="polite">
        {state.moved ? (
          <>
            <span className="md:hidden">Stuck where you left them.</span>
            <span className="hidden md:inline">They stick wherever you drop them.</span>
          </>
        ) : (
          <>
            <span className="md:hidden">Drag the labels around.</span>
            <span className="hidden md:inline">Peel, drag and throw the labels and stickers.</span>
          </>
        )}
      </p>
      <button
        type="button"
        className="reset-btn"
        data-visible={state.moved}
        aria-hidden={!state.moved}
        tabIndex={state.moved ? 0 : -1}
        onClick={() => document.dispatchEvent(new Event(STICKER_RESET))}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M3.2 6.4A5 5 0 1 1 3 9.6M3 2.8v3.6h3.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Put them back
      </button>
    </div>
  );
}
