"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Arrow } from "@/components/site/Arrow";
import { onOpenCart, removeLine, setPacks, useCart, type CartLine } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { FREE_SHIPPING, money, type Currency } from "@/lib/facts";
import { priceIn } from "@/lib/pricing";
import { MAX_PACKS, checkLine, lineSummary, productBySlug, unitPriceUsd } from "@/lib/products";
import { ProductThumb } from "./ProductMedia";

/*
 * The header's cart button (with how many lines are in it) and the cart that slides in from the
 * right: each line with its picture, what it is, its artwork, its price, packs and remove; the
 * free-shipping meter; the subtotal; checkout. Opens from the button or after Add to cart.
 */

/** A line's price in the visitor's currency (whole dollars per pack, as charged). */
export function linePrice(l: CartLine, cur: Currency) {
  const p = productBySlug(l.slug);
  if (!p) return 0;
  return priceIn(unitPriceUsd(p, l), cur) * (p.kind === "deal" ? l.packs : 1);
}

/** The lines that still match a product and its choices (a line from an old catalogue is dropped). */
export const usable = (lines: CartLine[]) =>
  lines.filter((l) => {
    const p = productBySlug(l.slug);
    return p && checkLine(p, l);
  });

const ARTWORK: Record<CartLine["artwork"], string> = {
  upload: "Artwork attached",
  design: "We design it",
  later: "Artwork: send after ordering",
  none: "",
};

export function CartLines({ lines, compact = false }: { lines: CartLine[]; compact?: boolean }) {
  const cur = useCurrency();
  return (
    <ul className="cl">
      {lines.map((l) => {
        const p = productBySlug(l.slug);
        if (!p) return null;
        const art = l.artwork === "upload" ? (l.fileName ? `Artwork: ${l.fileName}` : ARTWORK.later) : ARTWORK[l.artwork];
        return (
          <li key={l.id} className="cl-line">
            <ProductThumb p={p} className="cl-thumb" />
            <span className="cl-main">
              <Link href={`/shop/${p.slug}`} className="cl-name">
                {p.name}
              </Link>
              <span className="cl-spec">{lineSummary(p, l)}</span>
              {art && <span className="cl-art">{art}</span>}
              {!compact && l.notes && <span className="cl-notes">“{l.notes}”</span>}
              <span className="cl-tools">
                {p.kind === "deal" && (
                  <span className="stepper" role="group" aria-label={`Packs of ${p.name}`}>
                    <button type="button" aria-label="One pack fewer" onClick={() => setPacks(l.id, l.packs - 1)} disabled={l.packs <= 1}>
                      −
                    </button>
                    <output>{l.packs}</output>
                    <button type="button" aria-label="One pack more" onClick={() => setPacks(l.id, l.packs + 1)} disabled={l.packs >= MAX_PACKS}>
                      +
                    </button>
                  </span>
                )}
                <button type="button" className="cl-remove" onClick={() => removeLine(l.id)}>
                  Remove
                </button>
              </span>
            </span>
            <b className="cl-price">{money(linePrice(l, cur), cur)}</b>
          </li>
        );
      })}
    </ul>
  );
}

/** How far to free shipping (Canada, CAD only). */
export function FreeShip({ subtotal, cur }: { subtotal: number; cur: Currency }) {
  if (cur !== "cad") return null;
  const left = Math.max(0, FREE_SHIPPING - subtotal);
  return (
    <div className="freeship">
      <p>{left > 0 ? <>Add {money(left, cur)} more for free shipping in Canada</> : <b>Free shipping in Canada unlocked</b>}</p>
      <span className="freeship-bar" aria-hidden="true">
        <span style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%` }} />
      </span>
    </div>
  );
}

export function CartDrawer() {
  const all = useCart();
  const lines = usable(all);
  const cur = useCurrency();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => onOpenCart(() => setOpen(true)), []);
  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      opener.current?.focus?.();
    };
  }, [open]);

  const subtotal = lines.reduce((n, l) => n + linePrice(l, cur), 0);
  const count = lines.length;

  return (
    <>
<<<<<<< Updated upstream:src/components/shop/CartDrawer.tsx
      <button type="button" className="cart-btn" onClick={() => setOpen(true)} aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}>
=======
      <button type="button" className="hdr-icon cart-btn" data-cart-button onClick={() => setOpen(true)} aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}>
>>>>>>> Stashed changes:src/components/store/CartDrawer.tsx
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M9 10V7a3 3 0 0 1 6 0v3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <span className="hdr-icon-text">Cart</span>
        {count > 0 && (
          <span className="cart-count" aria-hidden="true" suppressHydrationWarning>
            {count}
          </span>
        )}
      </button>

      <div className="drawer" data-open={open || undefined} inert={!open}>
        <button type="button" className="drawer-backdrop" aria-label="Close cart" tabIndex={-1} onClick={() => setOpen(false)} />
        <div ref={panel} className="drawer-panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabIndex={-1}>
          <header className="drawer-head">
            <h2 id="drawer-title">Your cart{count ? ` (${count})` : ""}</h2>
            <button type="button" className="drawer-close" onClick={() => setOpen(false)} aria-label="Close cart">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </header>
          {count === 0 ? (
            <div className="drawer-empty">
              <p className="drawer-empty-title">Your cart is empty.</p>
              <p>Pick a label, type your size, and the price follows.</p>
              <Link href="/labels" className="btn btn-primary" onClick={() => setOpen(false)}>
                Shop labels
                <Arrow />
              </Link>
            </div>
          ) : (
            <>
              <div className="drawer-body" data-lenis-prevent>
                <FreeShip subtotal={subtotal} cur={cur} />
                <CartLines lines={lines} compact />
              </div>
              <footer className="drawer-foot">
                <p className="drawer-total">
                  <span>Subtotal</span>
                  <b>
                    {money(subtotal, cur)} <small>{cur.toUpperCase()}</small>
                  </b>
                </p>
                <p className="drawer-note">Shipping and any tax are worked out at checkout. Every item gets a free proof first.</p>
                <Link href="/cart" className="btn btn-primary drawer-checkout" onClick={() => setOpen(false)}>
                  Checkout
                  <Arrow />
                </Link>
                <button type="button" className="text-link drawer-more" onClick={() => setOpen(false)}>
                  Keep shopping
                </button>
              </footer>
            </>
          )}
        </div>
      </div>
    </>
  );
}
