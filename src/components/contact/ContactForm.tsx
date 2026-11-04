"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Arrow } from "@/components/site/Arrow";
import { Field, Honeypot, EMAIL, describedBy } from "@/components/forms/Field";
import { NotConnected, canSend, sendEmail } from "@/lib/emailjs";
import { CONTACT } from "@/lib/site";

/*
 * The contact form, kept short: what it is about (a quote points to the quote page, the
 * quickest way), name, email, the message. Sent by EmailJS; without it set up it says so.
 */

const TOPICS = [
  { id: "quote", label: "A quote" },
  { id: "artwork", label: "My artwork" },
  { id: "order", label: "An order" },
  { id: "other", label: "Something else" },
] as const;
type Topic = (typeof TOPICS)[number]["id"];

type Status = "idle" | "sending" | "sent" | "error" | "offline";

export function ContactForm() {
  const [topic, setTopic] = useState<Topic>("artwork");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<{ name: string; email: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    if (v("website")) {
      setStatus("sent");
      return;
    }
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
    if (!canSend("contact")) {
      setStatus("offline");
      return;
    }
    setStatus("sending");
    try {
      await sendEmail("contact", {
        topic: TOPICS.find((t) => t.id === topic)!.label,
        name: v("name"),
        email: v("email"),
        reply_to: v("email"),
        order: v("order") || "none",
        message: v("message"),
        page: window.location.href,
      });
      setSent({ name: v("name"), email: v("email") });
      setStatus("sent");
    } catch (err) {
      setStatus(err instanceof NotConnected ? "offline" : "error");
    }
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
          <Link href="/quote" className="btn btn-primary">
            Get a quote
            <Arrow />
          </Link>
          <Link href="/how-it-works#faq" className="text-link">
            Questions, answered
          </Link>
        </div>
      </div>
    );

  return (
    <form noValidate onSubmit={onSubmit}>
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
          Quickest: price it yourself, upload your artwork and send it in one go.{" "}
          <Link href="/quote">Get a quote</Link>
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

      {status === "offline" && (
        <p className="form-alert" role="alert">
          We can&apos;t send messages from the site yet.
          {CONTACT.email && (
            <>
              {" "}
              Email us at <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.
            </>
          )}
        </p>
      )}
      {status === "error" && (
        <p className="form-alert" role="alert">
          That didn&apos;t go through. Check your connection and try again.
        </p>
      )}

      <div className="form-foot">
        <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send message"}
          <Arrow />
        </button>
      </div>
    </form>
  );
}
