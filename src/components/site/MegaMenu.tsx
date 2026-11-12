"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/*
 * The category name links to its page; the arrow opens a panel drawn on the server (`children`).
 * Hovering with a mouse also opens it after a short pause. Escape, a click outside, leaving it
 * or following a link closes it.
 */
export function MegaMenu({ label, href, children, current = false }: { label: string; href: string; children: ReactNode; current?: boolean }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const hover = (next: boolean) => (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), next ? 90 : 160);
  };

  return (
    <div
      ref={root}
      className="mm"
      data-open={open || undefined}
      onPointerEnter={hover(true)}
      onPointerLeave={hover(false)}
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <div className="mm-trigger">
        <Link
          href={href}
          className="hdr-link mm-link"
          aria-current={current ? "page" : undefined}
          onNavigate={() => {
            window.clearTimeout(timer.current);
            setOpen(false);
          }}
        >
          {label}
        </Link>
        <button
          ref={button}
          type="button"
          className="hdr-link mm-btn"
          aria-label={`${label} menu`}
          aria-expanded={open}
          aria-controls={id}
          onClick={() => {
            window.clearTimeout(timer.current);
            setOpen((o) => !o);
          }}
        >
          <svg viewBox="0 0 12 12" aria-hidden="true" className="mm-chev">
            <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
      </div>
      <div
        id={id}
        className="mm-panel"
        inert={!open}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        {children}
      </div>
    </div>
  );
}
