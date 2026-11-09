"use client";

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

  const close = () => {
    setOpen(false);
    setSvcOpen(false);
  };
  const big = "block py-2 text-[2.6rem] font-black uppercase leading-none tracking-[-0.03em] [font-stretch:112%]";

  return (
    <div className="md:hidden">
      <button
        ref={button}
        type="button"
        className="menu-btn"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <span aria-hidden="true" className="menu-icon" data-open={open} />
      </button>
      <div
        ref={panel}
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[clamp(64px,9svh,84px)] z-50 overflow-y-auto bg-field-deep px-[var(--gutter)] pb-10 pt-8"
      >
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
      </div>
    </div>
  );
}
