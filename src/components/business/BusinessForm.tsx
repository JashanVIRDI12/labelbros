"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { Field, FormAlert, Honeypot, EMAIL, describedBy, type Status } from "@/components/forms/Field";
import { Arrow } from "@/components/site/Arrow";
import { send } from "@/lib/api";
import { PROOF } from "@/lib/facts";
import { BUSINESS_KINDS, BUSINESS_OFTEN, BUSINESS_VOLUME } from "@/lib/forms";
import { Asset } from "./labels";

/*
 * "Tell us what you label": the business enquiry. Beside the form, our sample asset tag prints
 * the visitor's company name as they type it, so the form shows what they are asking for. The
 * questions are the ones a print job needs (which labels, roughly how many, how often), all
 * chips but the contact details and a message. Saved and emailed to the shop by /api/messages.
 */

const MAX_TAG = 26; // characters of the company name that fit the sample tag

export function BusinessForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [company, setCompany] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [sent, setSent] = useState<{ name: string; email: string } | null>(null);
  // when they started filling it in (a form sent within seconds of that is a bot)
  const started = useRef(0);
  const start = () => {
    if (!started.current) started.current = Date.now();
  };

  const tag = company.trim() ? company.trim().slice(0, MAX_TAG) + (company.trim().length > MAX_TAG ? "…" : "") : undefined;

  const toggle = (id: string) => setLabels((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    const errs: Record<string, string> = {};
    if (!v("name")) errs.name = "Tell us your name.";
    if (!EMAIL.test(v("email"))) errs.email = "We need your email to write back.";
    if (!v("company")) errs.company = "Which business is it for?";
    if (v("message").length < 2) errs.message = "Tell us a little about the labels.";
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
      setSent({ name: v("name"), email: v("email") });
      setStatus("sent");
      return;
    }
    if (res.fields) setErrors(res.fields);
    setStatus(res.reason);
  }

  return (
    <section id="talk" className="bq" aria-labelledby="talk-title">
      <div className="bq-intro">
        <h2 id="talk-title" className="section-title">
          Tell us what you label.
        </h2>
        <p className="bq-lede">
          Running labels for a warehouse, a fleet or a product line? Tell us what you need and a person writes back
          with prices and the right stock for the job.
        </p>
        <div className="bq-tag" aria-hidden="true">
          <Asset n={1} company={tag} />
        </div>
        <ul className="bq-points">
          <li>Numbers, barcodes and QR codes on every label</li>
          <li>Your artwork kept on file for reorders</li>
          <li>{PROOF}, before anything prints</li>
        </ul>
      </div>

      <div className="bq-card form-card">
        {status === "sent" ? (
          <div className="sent" role="status">
            <span className="sent-stamp" aria-hidden="true">
              Sent
            </span>
            <p className="sent-title">Thanks{sent ? `, ${sent.name.split(" ")[0]}` : ""}.</p>
            <p className="sent-body">
              Your enquiry is with us. A person writes back by email{sent ? ` to ${sent.email}` : ""}.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
              <Link href="/quote?product=labels&shape=rectangle" className="btn btn-primary">
                Order online
                <Arrow />
              </Link>
              <Link href="/how-it-works" className="text-link">
                How it works
              </Link>
            </div>
          </div>
        ) : (
          <form noValidate onSubmit={onSubmit} onFocus={start}>
            <fieldset className="quote-field">
              <legend>
                Which labels? <span className="field-opt">(pick any)</span>
              </legend>
              <div className="chips">
                {BUSINESS_KINDS.map((k) => (
                  <label key={k.id} className="chip">
                    <input type="checkbox" name="labels" value={k.id} checked={labels.includes(k.id)} onChange={() => toggle(k.id)} />
                    <span>{k.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="quote-field">
              <legend>
                Roughly how many? <span className="field-opt">(optional)</span>
              </legend>
              <div className="chips">
                {BUSINESS_VOLUME.map((k) => (
                  <label key={k.id} className="chip">
                    <input type="radio" name="volume" value={k.id} />
                    <span>{k.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="quote-field">
              <legend>
                How often? <span className="field-opt">(optional)</span>
              </legend>
              <div className="chips">
                {BUSINESS_OFTEN.map((k) => (
                  <label key={k.id} className="chip">
                    <input type="radio" name="often" value={k.id} />
                    <span>{k.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="form-grid">
              <Field id="bf-company" label="Business" error={errors.company} hint="It prints on the tag.">
                <input
                  id="bf-company"
                  name="company"
                  autoComplete="organization"
                  required
                  maxLength={160}
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  aria-invalid={!!errors.company}
                  aria-describedby={describedBy("bf-company", errors.company, "It prints on the tag.")}
                />
              </Field>
              <Field id="bf-name" label="Your name" error={errors.name}>
                <input id="bf-name" name="name" autoComplete="name" required maxLength={120} aria-invalid={!!errors.name} aria-describedby={describedBy("bf-name", errors.name)} />
              </Field>
              <Field id="bf-email" label="Work email" error={errors.email} hint="We write back here.">
                <input id="bf-email" name="email" type="email" autoComplete="email" inputMode="email" required maxLength={200} aria-invalid={!!errors.email} aria-describedby={describedBy("bf-email", errors.email, "We write back here.")} />
              </Field>
              <Field id="bf-phone" label="Phone" optional>
                <input id="bf-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={40} />
              </Field>
              <Field id="bf-needed" label="Need them by" optional error={errors.needed}>
                <input id="bf-needed" name="needed" type="date" aria-invalid={!!errors.needed} aria-describedby={describedBy("bf-needed", errors.needed)} />
              </Field>
              <div className="form-wide">
                <Field id="bf-message" label="About the labels" error={errors.message} hint="Sizes, where they go, what they stick to, numbering, colours.">
                  <textarea
                    id="bf-message"
                    name="message"
                    rows={5}
                    required
                    maxLength={5000}
                    aria-invalid={!!errors.message}
                    aria-describedby={describedBy("bf-message", errors.message, "Sizes, where they go, what they stick to, numbering, colours.")}
                  />
                </Field>
              </div>
            </div>
            <Honeypot />

            <FormAlert status={status} />

            <div className="form-foot">
              <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send enquiry"}
                <Arrow />
              </button>
              <p className="form-note">
                Know the size already?{" "}
                <Link href="/quote?product=labels&shape=rectangle" className="underline underline-offset-2">
                  Upload it and order
                </Link>
                .
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
