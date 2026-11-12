"use client";

<<<<<<< Updated upstream
import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Art } from "@/components/sheet/Art";
import type { MenuService } from "./ServicesMenu";

export function MobileMenu({
  items,
  services,
  current,
}: {
  items: { label: string; href: string }[];
  services: MenuService[];
  current?: string;
}) {
  const [open, setOpen] = useState(false);
  const [svcOpen, setSvcOpen] = useState(false);
=======
import { useEffect, useRef, useState, type ReactNode } from "react";

/*
 * Phones and small tablets: the header's menus in a full-screen panel (drawn on the server and
 * passed in as `children`). Escape or the close button closes it, and so does following a link.
 */
export function MobileMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
>>>>>>> Stashed changes
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
<<<<<<< Updated upstream
    panel.current?.querySelector<HTMLAnchorElement>("a")?.focus();
=======
    panel.current?.querySelector<HTMLElement>("summary, a, button")?.focus();
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  const close = () => {
    setOpen(false);
    setSvcOpen(false);
  };
  const big = "block py-2 text-[2.6rem] font-black uppercase leading-none tracking-[-0.03em] [font-stretch:112%]";

=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
        <nav aria-label="Mobile">
          <ul className="flex flex-col gap-1">
            {items.map((item) =>
              item.href === "/services" ? (
                <li key={item.href}>
                  {/* Services: the word opens the list of services, each with its sticker */}
                  <button
                    type="button"
                    className={`${big} mm-svc-btn`}
                    aria-expanded={svcOpen}
                    aria-controls="mobile-services"
                    onClick={() => setSvcOpen((v) => !v)}
                  >
                    {item.label}
                    <svg viewBox="0 0 12 12" aria-hidden="true" className="mm-svc-chev" data-open={svcOpen || undefined}>
                      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <ul id="mobile-services" className="mm-svc" hidden={!svcOpen}>
                    {services.map((s, i) => (
                      <li key={s.slug} style={{ "--i": i } as CSSProperties}>
                        <Link href={s.href} onClick={close} className="mm-svc-link" aria-current={s.href === current ? "page" : undefined}>
                          <span className="mm-svc-art" aria-hidden="true">
                            <Art art={s.art} sizes="48px" />
                          </span>
                          {s.name}
                        </Link>
                      </li>
                    ))}
                    <li style={{ "--i": services.length } as CSSProperties}>
                      <Link href="/services" onClick={close} className="mm-svc-all">
                        All services
                      </Link>
                    </li>
                  </ul>
                </li>
              ) : (
                <li key={item.href}>
                  <Link href={item.href} onClick={close} aria-current={item.href === current ? "page" : undefined} className={big}>
                    {item.label}
                  </Link>
                </li>
              ),
            )}
            <li className="mt-6">
              <Link href="/quote#pricing" onClick={close} className="text-18 font-semibold underline underline-offset-4">
                Order now
              </Link>
            </li>
          </ul>
        </nav>
=======
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
>>>>>>> Stashed changes
      </div>
    </div>
  );
}
