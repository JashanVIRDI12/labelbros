"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field, FormAlert, Honeypot, describedBy, type Status } from "@/components/forms/Field";
import { Arrow } from "@/components/site/Arrow";
import { ShipTo } from "@/components/site/ShipTo";
import { PayMarks } from "@/components/site/Trust";
import { isStripeUrl, send } from "@/lib/api";
import { getFile, useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { CALL, INVOICE_DAYS, INVOICE_MIN, PROOF, money } from "@/lib/facts";
import { EMAIL } from "@/lib/forms";
import { useUrlFlag } from "@/lib/use-url-flag";
import { CartLines, FreeShip, linePrice, usable } from "./CartDrawer";

/*
 * The cart page: the lines on the left; on the right who it's for and how to pay.
 *   Card     name, email, phone, then Stripe's checkout (Stripe takes the address and the card).
 *   Invoice  business orders of INVOICE_MIN or more: the business, billing address and PO number;
 *            nothing is charged now, and we email a proof and a Stripe invoice.
 * Each line's artwork goes with the order; the server prices everything again.
 */

const COUNTRIES = [
  { id: "CA", label: "Canada" },
  { id: "US", label: "United States" },
];

export function CartCheckout() {
  const router = useRouter();
  const lines = usable(useCart());
  const cur = useCurrency();
  const cancelled = useUrlFlag("checkout", "cancelled");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pay, setPay] = useState<"card" | "invoice">("card");

  const subtotal = lines.reduce((n, l) => n + linePrice(l, cur), 0);
  const canInvoice = subtotal >= INVOICE_MIN;
  const invoice = pay === "invoice" && canInvoice;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    const errs: Record<string, string> = {};
    if (!v("name")) errs.name = "Tell us your name.";
    if (!EMAIL.test(v("email"))) errs.email = "We need your email to send your proof.";
    if (!/\d(?:\D*\d){6}/.test(v("phone"))) errs.phone = "We need a phone number to call you about your design.";
    if (invoice) {
      if (!v("company")) errs.company = "Which business is it for?";
      if (!v("line1")) errs.line1 = "Add the street address.";
      if (!v("city")) errs.city = "Add the city.";
      if (!v("state")) errs.state = "Add the province or state.";
      if (!v("postal_code")) errs.postal_code = "Add the postal or ZIP code.";
    }
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus(invoice ? "sending" : "paying");
    data.set("currency", cur);
    data.set("pay", invoice ? "invoice" : "card");
    data.set("lines", JSON.stringify(lines.map(({ id, slug, shape, w, h, material, finish, format, qty, packs, artwork, notes }) => ({ id, slug, shape, w, h, material, finish, format, qty, packs, artwork, notes }))));
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
    if (res.ok && res.url?.startsWith("/order/requested")) {
      router.push(res.url);
      return;
    }
    if (!res.ok && res.fields) setErrors(res.fields);
    setStatus(res.ok ? "error" : res.reason);
  }

  if (lines.length === 0)
    return (
      <div className="cart-empty">
        <p className="cart-empty-title">Your cart is empty.</p>
        <p>Pick a label, type your size in inches, and the price follows. Every order starts with a free proof.</p>
        <div className="cart-empty-btns">
          <Link href="/labels" className="btn btn-primary">
            Shop labels
            <Arrow />
          </Link>
          <Link href="/business" className="btn btn-ghost">
            Bulk pricing
          </Link>
        </div>
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
        <FreeShip subtotal={subtotal} cur={cur} />
        <CartLines lines={lines} />
        <Link href="/labels" className="text-link cart-more">
          Keep shopping
          <Arrow />
        </Link>
      </section>

      <section className="cart-pay form-card" aria-labelledby="cart-pay-title">
        <h2 id="cart-pay-title" className="cart-h2">
          Checkout
        </h2>
        <form noValidate onSubmit={onSubmit}>
          <fieldset className="pay-pick">
            <legend className="field-label">How would you like to pay?</legend>
            <label className="pay-opt" data-checked={!invoice || undefined}>
              <input type="radio" name="pay-method" checked={!invoice} onChange={() => setPay("card")} />
              <span>
                <b>Pay now</b>
                <small>Card, Apple Pay or Google Pay, through Stripe</small>
              </span>
            </label>
            <label className="pay-opt" data-checked={invoice || undefined} data-disabled={!canInvoice || undefined}>
              <input type="radio" name="pay-method" checked={invoice} disabled={!canInvoice} onChange={() => setPay("invoice")} />
              <span>
                <b>Pay by invoice</b>
                <small>{canInvoice ? `For businesses: nothing charged now, invoice due in ${INVOICE_DAYS} days` : `For business orders of ${money(INVOICE_MIN, cur)} or more`}</small>
              </span>
            </label>
          </fieldset>

          <div className="cart-fields">
            <Field id="co-name" label="Your name" error={errors.name}>
              <input id="co-name" name="name" autoComplete="name" required maxLength={120} aria-invalid={!!errors.name} aria-describedby={describedBy("co-name", errors.name)} />
            </Field>
            <Field id="co-email" label="Email" error={errors.email} hint="Your proof comes here.">
              <input id="co-email" name="email" type="email" autoComplete="email" inputMode="email" required maxLength={200} aria-invalid={!!errors.email} aria-describedby={describedBy("co-email", errors.email, "Your proof comes here.")} />
            </Field>
            <Field id="co-phone" label="Phone" error={errors.phone} hint="We call if your design needs changes.">
              <input id="co-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required maxLength={40} aria-invalid={!!errors.phone} aria-describedby={describedBy("co-phone", errors.phone, "We call if your design needs changes.")} />
            </Field>
            <Field id="co-company" label="Business" optional={!invoice} error={errors.company}>
              <input id="co-company" name="company" autoComplete="organization" maxLength={160} aria-invalid={!!errors.company} aria-describedby={describedBy("co-company", errors.company)} />
            </Field>
            {invoice && (
              <>
                <Field id="co-line1" label="Billing street address" error={errors.line1}>
                  <input id="co-line1" name="line1" autoComplete="address-line1" maxLength={200} aria-invalid={!!errors.line1} aria-describedby={describedBy("co-line1", errors.line1)} />
                </Field>
                <Field id="co-line2" label="Suite or unit" optional>
                  <input id="co-line2" name="line2" autoComplete="address-line2" maxLength={200} />
                </Field>
                <div className="cart-two">
                  <Field id="co-city" label="City" error={errors.city}>
                    <input id="co-city" name="city" autoComplete="address-level2" maxLength={120} aria-invalid={!!errors.city} aria-describedby={describedBy("co-city", errors.city)} />
                  </Field>
                  <Field id="co-state" label="Province or state" error={errors.state}>
                    <input id="co-state" name="state" autoComplete="address-level1" maxLength={80} aria-invalid={!!errors.state} aria-describedby={describedBy("co-state", errors.state)} />
                  </Field>
                </div>
                <div className="cart-two">
                  <Field id="co-postal" label="Postal or ZIP code" error={errors.postal_code}>
                    <input id="co-postal" name="postal_code" autoComplete="postal-code" maxLength={20} aria-invalid={!!errors.postal_code} aria-describedby={describedBy("co-postal", errors.postal_code)} />
                  </Field>
                  <Field id="co-country" label="Country">
                    <select id="co-country" name="country" autoComplete="country" defaultValue={cur === "usd" ? "US" : "CA"}>
                      {COUNTRIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field id="co-po" label="PO number" optional>
                  <input id="co-po" name="po" maxLength={60} />
                </Field>
              </>
            )}
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
              <dd>{invoice ? "Added to your invoice" : cur === "cad" && subtotal >= 100 ? "Free" : "Worked out at checkout"}</dd>
            </div>
            <div className="cart-sum-total">
              <dt>Total</dt>
              <dd>
                {money(subtotal, cur)} <small>{cur.toUpperCase()}</small>
              </dd>
            </div>
          </dl>

          {errors.form && <FormAlert>{errors.form}</FormAlert>}
          <FormAlert status={status} />

          <button type="submit" className="btn btn-primary cart-paybtn" disabled={status === "paying" || status === "sending"}>
            {status === "paying" ? "Taking you to checkout…" : status === "sending" ? "Sending your order…" : invoice ? "Request invoice" : `Pay ${money(subtotal, cur)} ${cur.toUpperCase()}`}
            <Arrow />
          </button>
          <ul className="buy-trust">
            {invoice ? <li>We check your artwork, then email your proof and the invoice</li> : <li>Secure checkout by Stripe; any tax is shown there</li>}
            <li>{PROOF}: nothing prints until you approve</li>
            <li>{CALL}</li>
          </ul>
          {!invoice && <PayMarks className="cart-marks" />}
        </form>
      </section>
    </div>
  );
}
