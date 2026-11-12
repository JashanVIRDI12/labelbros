"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Arrow } from "@/components/site/Arrow";
import { CardPrice } from "@/components/store/Price";
import type { Product } from "@/lib/products";
import type { CurvedGallery } from "./curved-gallery";
import { whenReady } from "./when-ready";

/*
 * "Labels for your product": the products on a curved WebGL strip (curved-gallery.ts) you can
 * drag and fling; the one in the middle is named below with its price and a button to shop it.
 * Chips and arrows move it too (and are the keyboard way in). Before the strip loads, and
 * without WebGL, the same photos sit in a row you can swipe.
 */

const texture = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=640&q=75`;

export function LabelGallery({ products }: { products: Product[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const gallery = useRef<CurvedGallery | null>(null);
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [live, setLive] = useState(false);
  const p = products[active];

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let destroyed = false;
    const cancel = whenReady(el, async () => {
      const { CurvedGallery } = await import("./curved-gallery");
      if (destroyed) return;
      try {
        const g = new CurvedGallery(
          el,
          products.map((x) => ({ src: texture(x.image.src) })),
          {
            onActive: setActive,
            onTap: (i) => router.push(`/shop/${products[i].slug}`),
            onReady: () => setLive(true),
          },
        );
        gallery.current = g;
        await g.init();
        if (destroyed) g.destroy();
      } catch {
        /* no WebGL: the swipeable row stays */
      }
    });
    return () => {
      destroyed = true;
      cancel();
      gallery.current?.destroy();
      gallery.current = null;
    };
  }, [products, router]);

  // the yellow "Drag" cursor follows the pointer over the strip (mice only)
  useEffect(() => {
    const el = stage.current;
    const cur = el?.querySelector<HTMLElement>(".lg-cursor");
    if (!el || !cur || !live) return;
    const mouse = window.matchMedia("(hover: hover) and (pointer: fine)");
    let pointer: { x: number; y: number } | null = null;
    const hide = () => {
      pointer = null;
      delete el.dataset.pointer;
    };
    const position = () => {
      if (!pointer) return;
      const r = el.getBoundingClientRect();
      const x = pointer.x - r.left;
      const y = pointer.y - r.top;
      const inside = x >= 0 && x <= r.width && y >= 0 && y <= r.height;
      if (!mouse.matches || !inside) {
        delete el.dataset.pointer;
        return;
      }
      // Position has no easing. The inner badge owns its separate show/grab animation.
      cur.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      el.dataset.pointer = "";
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") {
        hide();
        return;
      }
      pointer = { x: e.clientX, y: e.clientY };
      position();
    };
    el.addEventListener("pointerenter", move);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", hide);
    el.addEventListener("pointercancel", hide);
    window.addEventListener("scroll", position, { passive: true });
    window.addEventListener("resize", position);
    window.addEventListener("blur", hide);
    mouse.addEventListener("change", hide);
    return () => {
      el.removeEventListener("pointerenter", move);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", hide);
      el.removeEventListener("pointercancel", hide);
      window.removeEventListener("scroll", position);
      window.removeEventListener("resize", position);
      window.removeEventListener("blur", hide);
      mouse.removeEventListener("change", hide);
      hide();
    };
  }, [live]);

  const go = (i: number) => {
    setActive(i);
    gallery.current?.goTo(i);
  };
  const step = (d: 1 | -1) => {
    if (gallery.current) gallery.current.next(d);
    else setActive((i) => (i + d + products.length) % products.length);
  };

  return (
    <div className="lg">
      <div ref={stage} className="lg-stage" data-live={live || undefined}>
        <ul className="lg-row" aria-label="Labels by product">
          {products.map((x, i) => (
            <li key={x.slug} data-active={i === active || undefined}>
              <Link href={`/shop/${x.slug}`} className="lg-card" tabIndex={live ? -1 : undefined}>
                <Image src={x.image.src} alt={x.image.alt} width={x.image.w} height={x.image.h} sizes="(min-width: 1024px) 26vw, 70vw" />
                <span className="sr-only">{x.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        {live && (
          <span className="lg-cursor" aria-hidden="true">
            <span className="lg-cursor-badge">
              <svg viewBox="0 0 48 16" fill="none">
                <path d="m7 2-6 6 6 6M1 8h46M41 2l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Drag
            </span>
          </span>
        )}
      </div>

      <div className="lg-bar">
        <div className="lg-caption" aria-live="polite" key={p.slug}>
          <p className="lg-name">{p.name}</p>
          <p className="lg-line">{p.tagline}</p>
        </div>
        <div className="lg-buy">
          <CardPrice p={p} />
          <Link href={`/shop/${p.slug}`} className="btn btn-primary" data-magnetic>
            Shop {p.plural}
            <Arrow />
          </Link>
        </div>
      </div>

      <div className="lg-nav">
        <div className="lg-chips" role="group" aria-label="Choose a product">
          {products.map((x, i) => (
            <button key={x.slug} type="button" className="lg-chip" aria-pressed={i === active} onClick={() => go(i)}>
              {x.name.replace(" labels", "").replace(" & tea", " & tea")}
            </button>
          ))}
        </div>
        <div className="lg-arrows">
          <button type="button" className="lg-arrow" aria-label="Previous product" onClick={() => step(-1)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" className="lg-arrow" aria-label="Next product" onClick={() => step(1)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
