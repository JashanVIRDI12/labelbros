"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Art } from "@/components/sheet/Art";
import { ART } from "@/components/stickers-page/art";
import { Arrow } from "@/components/site/Arrow";
import { onOpenCart, removeLine, setPacks, useCart, type CartLine } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { money, priceIn, type Currency } from "@/lib/facts";
import { MAX_PACKS, lineSummary, productBySlug, unitPriceUsd } from "@/lib/products";

/*
 * The header's bag (with how many lines are in it) and the cart that slides in from the right:
 * each line with its sticker, what it is, its price, packs and remove; the subtotal; checkout.
 * Opens from the bag or after Add to cart; Escape, the backdrop or "Keep shopping" close it.
 */

/** A line's price in the visitor's currency (whole dollars per pack, as charged). */
export function linePrice(l: CartLine, cur: Currency) {
  const p = productBySlug(l.slug);
  if (!p) return 0;
  return priceIn(unitPriceUsd(p, l), cur) * (p.kind === "deal" ? l.packs : 1);
}

export function CartLines({ lines, compact = false }: { lines: CartLine[]; compact?: boolean }) {
  const cur = useCurrency();
  return (
    <ul className="cl">
      {lines.map((l) => {
        const p = productBySlug(l.slug);
        if (!p) return null;
        return (
          <li key={l.id} className="cl-line">
            <span className="cl-art" aria-hidden="true">
              <Art art={ART[p.art.stickers[0]]} sizes="56px" />
            </span>
            <span className="cl-main">
              <Link href={`/shop/${p.slug}`} className="cl-name">
                {p.name}
              </Link>
              <span className="cl-spec">{lineSummary(p, l)}</span>
              <span className="cl-art-note">
                {l.artwork === "design" ? "We design it" : l.fileName ? `Artwork: ${l.fileName}` : "Artwork: send it when we reply"}
              </span>
              {!compact && l.notes && <span className="cl-notes">“{l.notes}”</span>}
              <span className="cl-tools">
                {p.kind === "deal" && (
                  <span className="stepper stepper-sm" role="group" aria-label={`Packs of ${p.name}`}>
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

export function CartDrawer() {
  const lines = useCart();
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
      <button type="button" className="cart-btn" onClick={() => setOpen(true)} aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 10V7a3 3 0 0 1 6 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        {count > 0 && (
          <span className="cart-count" aria-hidden="true" suppressHydrationWarning>
            {count}
          </span>
        )}
      </button>

      <div className="drawer" data-open={open || undefined} hidden={!open}>
        <button type="button" className="drawer-backdrop" aria-label="Close cart" tabIndex={-1} onClick={() => setOpen(false)} />
        <div ref={panel} className="drawer-panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabIndex={-1}>
          <header className="drawer-head">
            <h2 id="drawer-title">Your cart</h2>
            <button type="button" className="drawer-close" onClick={() => setOpen(false)} aria-label="Close cart">
              ×
            </button>
          </header>
          {count === 0 ? (
            <div className="drawer-empty">
              <p>Your cart is empty.</p>
              <Link href="/shop" className="btn btn-primary" onClick={() => setOpen(false)}>
                Shop stickers
                <Arrow />
              </Link>
            </div>
          ) : (
            <>
              <div className="drawer-body">
                <CartLines lines={lines} compact />
              </div>
              <footer className="drawer-foot">
                <p className="drawer-total">
                  <span>Subtotal</span>
                  <b>
                    {money(subtotal, cur)} <small>{cur.toUpperCase()}</small>
                  </b>
                </p>
                <p className="drawer-note">Shipping and any tax are added at checkout. Free proof on every item.</p>
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
