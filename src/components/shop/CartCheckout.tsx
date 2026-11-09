"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Field, FormAlert, Honeypot, describedBy, type Status } from "@/components/forms/Field";
import { Arrow } from "@/components/site/Arrow";
import { ShipTo } from "@/components/site/ShipTo";
import { isStripeUrl, send } from "@/lib/api";
import { getFile, useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { CALL, FREE_SHIPPING, money, PROOF } from "@/lib/facts";
import { EMAIL } from "@/lib/forms";
import { useUrlFlag } from "@/lib/use-url-flag";
import { CartLines, linePrice } from "./CartDrawer";

/*
 * The cart page: the lines on the left; on the right who it's for (name, email, phone: we call
 * if a design needs changes) and the total, then Pay, which sends the cart and each line's
 * artwork to the server and goes on to Stripe's checkout.
 */

export function CartCheckout() {
  const lines = useCart();
  const cur = useCurrency();
  const cancelled = useUrlFlag("checkout", "cancelled");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = lines.reduce((n, l) => n + linePrice(l, cur), 0);
  const freeLine = FREE_SHIPPING; // CAD, Canada only
  const toFree = cur === "cad" ? Math.max(0, freeLine - subtotal) : 0;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    const errs: Record<string, string> = {};
    if (!v("name")) errs.name = "Tell us your name.";
    if (!EMAIL.test(v("email"))) errs.email = "We need your email to send your proofs.";
    if (!/\d(?:\D*\d){6}/.test(v("phone"))) errs.phone = "We need a phone number to call you about your design.";
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus("paying");
    data.set("currency", cur);
    data.set("lines", JSON.stringify(lines.map(({ id, slug, finish, size, qty, packs, artwork, notes }) => ({ id, slug, finish, size, qty, packs, artwork, notes }))));
    for (const l of lines) {
      if (l.artwork !== "upload" || !l.fileName) continue;
      const f = await getFile(l.id);
      if (f) data.set(`file_${l.id}`, f, f.name);
    }
    const res = await send("/api/checkout", data);
    if (res.ok && res.url && isStripeUrl(res.url)) {
      window.location.assign(res.url);
      return;
    }
    if (!res.ok && res.fields) setErrors(res.fields);
    setStatus(res.ok ? "error" : res.reason);
  }

  if (lines.length === 0)
    return (
      <div className="cart-empty">
        <p className="cart-empty-title">Your cart is empty.</p>
        <p>Pick a pack or build your own: every order starts with a free proof.</p>
        <Link href="/shop" className="btn btn-primary">
          Shop stickers
          <Arrow />
        </Link>
      </div>
    );

  return (
    <div className="cart-grid">
      <section className="cart-items" aria-labelledby="cart-items-title">
        <h2 id="cart-items-title" className="cart-h2">
          {lines.length} {lines.length === 1 ? "item" : "items"}
        </h2>
        {cancelled && status === "idle" && (
          <p className="form-tip" role="status">
            Your payment wasn&apos;t finished, so nothing was charged. Your cart is still here.
          </p>
        )}
        <CartLines lines={lines} />
        <Link href="/shop" className="text-link cart-more">
          Keep shopping
          <Arrow />
        </Link>
      </section>

      <section className="cart-pay form-card" aria-labelledby="cart-pay-title">
        <h2 id="cart-pay-title" className="cart-h2">
          Checkout
        </h2>
        <form noValidate onSubmit={onSubmit}>
          <div className="cart-fields">
            <Field id="co-name" label="Your name" error={errors.name}>
              <input id="co-name" name="name" autoComplete="name" required maxLength={120} aria-invalid={!!errors.name} aria-describedby={describedBy("co-name", errors.name)} />
            </Field>
            <Field id="co-email" label="Email" error={errors.email} hint="Your proofs come here.">
              <input id="co-email" name="email" type="email" autoComplete="email" inputMode="email" required maxLength={200} aria-invalid={!!errors.email} aria-describedby={describedBy("co-email", errors.email, "Your proofs come here.")} />
            </Field>
            <Field id="co-phone" label="Phone" error={errors.phone} hint="We call if your design needs changes.">
              <input id="co-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required maxLength={40} aria-invalid={!!errors.phone} aria-describedby={describedBy("co-phone", errors.phone, "We call if your design needs changes.")} />
            </Field>
            <Field id="co-company" label="Business" optional>
              <input id="co-company" name="company" autoComplete="organization" maxLength={160} />
            </Field>
            <Field id="co-needed" label="Need them by" optional error={errors.needed}>
              <input id="co-needed" name="needed" type="date" aria-invalid={!!errors.needed} aria-describedby={describedBy("co-needed", errors.needed)} />
            </Field>
          </div>
          <Honeypot />

          <ShipTo className="cart-ship" />

          <dl className="cart-sum">
            <div>
              <dt>Subtotal</dt>
              <dd>{money(subtotal, cur)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>{cur === "cad" && toFree === 0 ? "Free" : "At checkout"}</dd>
            </div>
            <div className="cart-sum-total">
              <dt>Total</dt>
              <dd>
                {money(subtotal, cur)} <small>{cur.toUpperCase()}</small>
              </dd>
            </div>
          </dl>
          {toFree > 0 && <p className="cart-free">Add {money(toFree, cur)} more for free shipping in Canada.</p>}

          {errors.form && <FormAlert>{errors.form}</FormAlert>}
          <FormAlert status={status} />

          <button type="submit" className="btn btn-primary cart-paybtn" disabled={status === "paying"}>
            {status === "paying" ? "Taking you to checkout…" : `Pay ${money(subtotal, cur)} ${cur.toUpperCase()}`}
            <Arrow />
          </button>
          <ul className="buy-trust">
            <li>Secure checkout by Stripe; any tax is shown there</li>
            <li>{PROOF}: nothing prints until you approve</li>
            <li>{CALL}</li>
          </ul>
        </form>
      </section>
    </div>
  );
}
