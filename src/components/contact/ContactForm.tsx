"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { Arrow } from "@/components/site/Arrow";
import { Field, FormAlert, Honeypot, EMAIL, describedBy, type Status } from "@/components/forms/Field";
import { send } from "@/lib/api";
import { CONTACT_TOPICS as TOPICS, type ContactTopic as Topic } from "@/lib/forms";

/*
 * The contact form, kept short: what it is about (a quote points to the quote page, the
 * quickest way), name, email, the message. Saved and emailed to the shop by /api/messages;
 * without the backend set up it says so.
 */

export function ContactForm() {
  const [topic, setTopic] = useState<Topic>("artwork");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<{ name: string; email: string } | null>(null);
  // when they started filling it in (a form sent within seconds of that is a bot)
  const started = useRef(0);
  const start = () => {
    if (!started.current) started.current = Date.now();
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    const errs: Record<string, string> = {};
    if (!v("name")) errs.name = "Tell us your name.";
    if (!EMAIL.test(v("email"))) errs.email = "We need your email to write back.";
    if (v("message").length < 2) errs.message = "What would you like to ask?";
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus("sending");
    const res = await send("/api/messages", {
      kind: "contact",
      topic,
      name: v("name"),
      email: v("email"),
      order: v("order"),
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

  if (status === "sent")
    return (
      <div className="sent" role="status">
        <span className="sent-stamp" aria-hidden="true">
          Sent
        </span>
        <p className="sent-title">Thanks{sent ? `, ${sent.name.split(" ")[0]}` : ""}.</p>
        <p className="sent-body">Your message is with us. We write back by email{sent ? ` to ${sent.email}` : ""}.</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
          <Link href="/quote#pricing" className="btn btn-primary">
            Order online
            <Arrow />
          </Link>
          <Link href="/how-it-works#faq" className="text-link">
            Questions, answered
          </Link>
        </div>
      </div>
    );

  return (
    <form noValidate onSubmit={onSubmit} onFocus={start}>
      <fieldset className="quote-field">
        <legend>What is it about?</legend>
        <div className="chips">
          {TOPICS.map((t) => (
            <label key={t.id} className="chip">
              <input type="radio" name="topic" value={t.id} checked={topic === t.id} onChange={() => setTopic(t.id)} />
              <span>{t.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {topic === "quote" && (
        <p className="form-tip">
          Quickest: upload your design, see your price and order in one go.{" "}
          <Link href="/quote#pricing">Order online</Link>
        </p>
      )}

      <div className="form-grid">
        <Field id="cf-name" label="Your name" error={errors.name}>
          <input id="cf-name" name="name" autoComplete="name" required aria-invalid={!!errors.name} aria-describedby={describedBy("cf-name", errors.name)} />
        </Field>
        <Field id="cf-email" label="Email" error={errors.email} hint="We write back here.">
          <input id="cf-email" name="email" type="email" autoComplete="email" inputMode="email" required aria-invalid={!!errors.email} aria-describedby={describedBy("cf-email", errors.email, "We write back here.")} />
        </Field>
        {topic === "order" && (
          <div className="form-wide">
            <Field id="cf-order" label="Order number" optional>
              <input id="cf-order" name="order" />
            </Field>
          </div>
        )}
        <div className="form-wide">
          <Field id="cf-message" label="Your message" error={errors.message}>
            <textarea id="cf-message" name="message" rows={5} required aria-invalid={!!errors.message} aria-describedby={describedBy("cf-message", errors.message)} />
          </Field>
        </div>
      </div>
      <Honeypot />

      <FormAlert status={status} />

      <div className="form-foot">
        <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send message"}
          <Arrow />
        </button>
      </div>
    </form>
  );
}
