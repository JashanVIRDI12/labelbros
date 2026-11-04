"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function MobileMenu({ items, current }: { items: { label: string; href: string }[]; current?: string }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLAnchorElement>("a")?.focus();
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
    <div className="md:hidden">
      <button
        ref={button}
        type="button"
        className="menu-btn"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <span aria-hidden="true" className="menu-icon" data-open={open} />
      </button>
      <div
        ref={panel}
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[clamp(64px,9svh,84px)] z-50 bg-field-deep px-[var(--gutter)] pt-8"
      >
        <nav aria-label="Mobile">
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={item.href === current ? "page" : undefined}
                  className="block py-2 text-[2.6rem] font-black uppercase leading-none tracking-[-0.03em] [font-stretch:112%]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-6">
              <Link href="/quote" onClick={() => setOpen(false)} className="text-18 font-semibold underline underline-offset-4">
                Get a quote
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
