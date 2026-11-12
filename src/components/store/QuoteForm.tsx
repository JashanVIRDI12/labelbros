"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { Field, FormAlert, Honeypot, EMAIL, describedBy, type Status } from "@/components/forms/Field";
import { Arrow } from "@/components/site/Arrow";
import { send } from "@/lib/api";
import { BUSINESS_KINDS, BUSINESS_OFTEN, BUSINESS_VOLUME } from "@/lib/forms";

/*
 * "Get a quote": for orders bigger than the shop takes (over 100,000), many versions, a custom
 * material or a delivery schedule. What a print job needs, as chips, then the contact details
 * and a message. Saved to the admin and emailed to the shop by /api/messages.
 */
export function QuoteForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [labels, setLabels] = useState<string[]>([]);
  const [sent, setSent] = useState<string | null>(null);
  const started = useRef(0);
  const start = () => {
    if (!started.current) started.current = Date.now();
  };
  const toggle = (id: string) => setLabels((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    const errs: Record<string, string> = {};
    if (!v("name")) errs.name = "Tell us your name.";
    if (!EMAIL.test(v("email"))) errs.email = "We need your email to send the quote.";
    if (!v("company")) errs.company = "Which business is it for?";
    if (v("message").length < 2) errs.message = "Tell us about the labels: sizes, materials, how many versions.";
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus("sending");
    const res = await send("/api/messages", {
      kind: "business",
      name: v("name"),
      email: v("email"),
      phone: v("phone"),
      company: v("company"),
      labels,
      volume: v("volume") || undefined,
      often: v("often") || undefined,
      needed: v("needed"),
      message: v("message"),
      website: v("website"),
      t: started.current,
      page: window.location.pathname,
    });
    if (res.ok) {
      setSent(v("name").split(" ")[0]);
      setStatus("sent");
      return;
    }
    if (res.fields) setErrors(res.fields);
    setStatus(res.reason);
  }

  if (status === "sent")
    return (
      <div className="form-card quote-sent" role="status">
        <p className="quote-sent-title">Thanks{sent ? `, ${sent}` : ""}. We have it.</p>
        <p>We read every request ourselves and reply by email with a quote. In the meantime, the shop prices up to 100,000 labels on the spot.</p>
        <Link href="/labels" className="btn btn-primary">
          Shop labels
          <Arrow />
        </Link>
      </div>
    );

  return (
    <form className="form-card quote-form" noValidate onSubmit={onSubmit} onFocus={start}>
      <fieldset className="quote-field">
        <legend className="field-label">
          What are they for? <span className="field-opt">(pick any)</span>
        </legend>
        <div className="opts opts-chips">
          {BUSINESS_KINDS.map((k) => (
            <label key={k.id} className="opt opt-chip" data-checked={labels.includes(k.id) || undefined}>
              <input type="checkbox" checked={labels.includes(k.id)} onChange={() => toggle(k.id)} />
              <span>{k.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="quote-two">
        <Field id="qf-volume" label="How many, per order" optional>
          <select id="qf-volume" name="volume" defaultValue="">
            <option value="">Not sure yet</option>
            {BUSINESS_VOLUME.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="qf-often" label="How often" optional>
          <select id="qf-often" name="often" defaultValue="">
            <option value="">Not sure yet</option>
            {BUSINESS_OFTEN.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="form-grid">
        <Field id="qf-name" label="Your name" error={errors.name}>
          <input id="qf-name" name="name" autoComplete="name" maxLength={120} aria-invalid={!!errors.name} aria-describedby={describedBy("qf-name", errors.name)} />
        </Field>
        <Field id="qf-company" label="Business" error={errors.company}>
          <input id="qf-company" name="company" autoComplete="organization" maxLength={160} aria-invalid={!!errors.company} aria-describedby={describedBy("qf-company", errors.company)} />
        </Field>
        <Field id="qf-email" label="Email" error={errors.email}>
          <input id="qf-email" name="email" type="email" autoComplete="email" inputMode="email" maxLength={200} aria-invalid={!!errors.email} aria-describedby={describedBy("qf-email", errors.email)} />
        </Field>
        <Field id="qf-phone" label="Phone" optional>
          <input id="qf-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </Field>
        <Field id="qf-needed" label="Need them by" optional error={errors.needed}>
          <input id="qf-needed" name="needed" type="date" aria-invalid={!!errors.needed} />
        </Field>
        <div className="form-wide">
          <Field id="qf-message" label="About the labels" error={errors.message} hint="Sizes, materials, how many designs or versions, roll or sheets, anything special.">
            <textarea
              id="qf-message"
              name="message"
              rows={5}
              maxLength={5000}
              aria-invalid={!!errors.message}
              aria-describedby={describedBy("qf-message", errors.message, "Sizes, materials, how many designs or versions, roll or sheets, anything special.")}
            />
          </Field>
        </div>
      </div>
      <Honeypot />
      <FormAlert status={status} />
      <div className="form-foot">
        <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Get my quote"}
          <Arrow />
        </button>
        <p className="form-note">We reply by email with your quote.</p>
      </div>
    </form>
  );
}
