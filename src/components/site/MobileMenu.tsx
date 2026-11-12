"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/*
 * Phones and small tablets: the header's menus in a full-screen panel (drawn on the server and
 * passed in as `children`). Escape or the close button closes it, and so does following a link.
 */
export function MobileMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("summary, a, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="mob">
      <button ref={button} type="button" className="mob-btn" aria-expanded={open} aria-controls="mob-panel" onClick={() => setOpen(true)}>
        <span className="sr-only">Menu</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <div
        ref={panel}
        id="mob-panel"
        className="mob-panel"
        data-lenis-prevent
        data-open={open || undefined}
        inert={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        <div className="mob-head">
          <span className="mob-title">Menu</span>
          <button
            type="button"
            className="mob-close"
            onClick={() => {
              setOpen(false);
              button.current?.focus();
            }}
          >
            <span className="sr-only">Close menu</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
