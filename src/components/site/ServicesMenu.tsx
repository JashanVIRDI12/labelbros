"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Art, type ArtFile } from "@/components/sheet/Art";
import { Arrow } from "./Arrow";

/*
 * "Services" in the header opens a sheet of the services, each a sticker with its name and a line
 * about it. The stickers slap down one after another as it opens and lift and turn under the
 * pointer. Opens on hover (after a moment, so passing over it does nothing), on click or tap, and
 * from the keyboard (Enter / Space / Down); Escape, a click outside or tabbing away closes it.
 */

export type MenuService = { slug: string; name: string; short: string; href: string; art: ArtFile };

const TILT = [-6, 4, -3, 5, -5, 3];

export function ServicesMenu({ items, current }: { items: MenuService[]; current?: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const id = useId();
  const path = usePathname();
  const here = current === "/services" || path.startsWith("/services");

  // a new page closes it (adjusting state while rendering, as React recommends over an effect)
  const [shownFor, setShownFor] = useState(path);
  if (shownFor !== path) {
    setShownFor(path);
    setOpen(false);
  }

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

  const later = (v: boolean, ms: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(v), ms);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // arrows move between the tiles once it is open
  const onPanelKey = (e: React.KeyboardEvent) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(e.key)) return;
    const links = [...(root.current?.querySelectorAll<HTMLAnchorElement>("[data-menu-link]") ?? [])];
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    links[(i + step + links.length) % links.length]?.focus();
    e.preventDefault();
  };

  return (
    <div
      ref={root}
      className="svcmenu"
      data-open={open || undefined}
      onPointerEnter={(e) => e.pointerType === "mouse" && later(true, 120)}
      onPointerLeave={(e) => e.pointerType === "mouse" && later(false, 220)}
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={button}
        type="button"
        className="nav-link svcmenu-trigger"
        aria-expanded={open}
        aria-controls={id}
        aria-current={here ? "page" : undefined}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => root.current?.querySelector<HTMLAnchorElement>("[data-menu-link]")?.focus());
          }
        }}
      >
        Services
        <svg viewBox="0 0 12 12" aria-hidden="true" className="svcmenu-chev">
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div id={id} className="svcmenu-panel" hidden={!open} onKeyDown={onPanelKey}>
        <ul className="svcmenu-grid">
          {items.map((s, i) => (
            <li key={s.slug} style={{ "--i": i, "--tilt": `${TILT[i % TILT.length]}deg` } as CSSProperties}>
              <Link href={s.href} className="svcmenu-tile" data-menu-link aria-current={path === s.href ? "page" : undefined}>
                <span className="svcmenu-art" aria-hidden="true">
                  <Art art={s.art} sizes="64px" />
                </span>
                <span className="svcmenu-text">
                  <b>{s.name}</b>
                  <span>{s.short}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="svcmenu-side">
          <Link href="/business" className="svcmenu-biz" data-menu-link>
            <b>Business labels</b>
            <span>Shipping labels, asset tags, warning and safety, shelf codes.</span>
          </Link>
          <Link href="/quote#pricing" className="btn btn-primary btn-sm svcmenu-cta" data-menu-link>
            Upload your design
            <Arrow />
          </Link>
          <Link href="/services" className="text-link svcmenu-all" data-menu-link>
            All services
            <Arrow />
          </Link>
        </div>
      </div>
    </div>
  );
}
