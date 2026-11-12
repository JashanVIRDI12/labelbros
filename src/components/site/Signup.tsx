"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import { Ph } from "@/components/site/Ph";
import { send } from "@/lib/api";
import { EMAIL } from "@/lib/forms";
import { SIGNUP_CONSENT } from "@/lib/signup";
import { BRAND, contactOr } from "@/lib/site";

/*
 * The footer's email sign-up, CASL-style: an email field and an unticked box with exactly what
 * they're agreeing to, who is asking (name and mailing address) and that they can leave any time.
 * Nothing is sent until the box is ticked.
 */
export function Signup() {
  const id = useId();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "busy" | "offline">("idle");
  const [errors, setErrors] = useState<{ email?: string; consent?: string }>({});
  const started = useRef(0);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    const consent = data.get("consent") === "yes";
    const errs: typeof errors = {};
    if (!EMAIL.test(email)) errs.email = "Add a valid email.";
    if (!consent) errs.consent = "Tick the box to say yes to our emails.";
    setErrors(errs);
    if (errs.email) return form.querySelector<HTMLElement>('[name="email"]')?.focus();
    if (errs.consent) return form.querySelector<HTMLElement>('[name="consent"]')?.focus();
    setStatus("sending");
    const res = await send("/api/subscribe", {
      email,
      consent: true,
      source: `footer ${window.location.pathname}`,
      website: String(data.get("website") ?? ""),
      t: started.current,
    });
    if (res.ok) return setStatus("sent");
    if (res.fields) setErrors(res.fields);
    setStatus(res.reason);
  }

  if (status === "sent")
    return (
      <div className="signup signup-done" role="status">
        <p className="signup-title">You&apos;re on the list.</p>
        <p className="signup-note">Our next email comes from {BRAND}. Every one has a link to leave.</p>
      </div>
    );

  return (
    <form
      className="signup"
      noValidate
      onSubmit={onSubmit}
      onFocus={() => {
        if (!started.current) started.current = Date.now();
      }}
      aria-labelledby={`${id}-title`}
    >
      <p id={`${id}-title`} className="signup-title">
        Label tips and deals, now and then.
      </p>
      <div className="signup-row">
        <label htmlFor={`${id}-email`} className="sr-only">
          Email
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@business.com"
          maxLength={200}
          className="signup-input"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? `${id}-email-error` : undefined}
        />
        <button type="submit" className="btn btn-primary btn-sm signup-btn" disabled={status === "sending"}>
          {status === "sending" ? "Signing up…" : "Sign up"}
        </button>
      </div>
      {errors.email && (
        <p id={`${id}-email-error`} className="signup-error">
          {errors.email}
        </p>
      )}
      <label className="signup-consent" htmlFor={`${id}-consent`}>
        <input
          id={`${id}-consent`}
          name="consent"
          type="checkbox"
          value="yes"
          aria-invalid={!!errors.consent}
          aria-describedby={errors.consent ? `${id}-consent-error` : undefined}
        />
        <span>{SIGNUP_CONSENT}</span>
      </label>
      {errors.consent && (
        <p id={`${id}-consent-error`} className="signup-error">
          {errors.consent}
        </p>
      )}
      <p className="signup-note">
        Sent by {BRAND}, <Ph text={contactOr("address")} />. Questions: <Link href="/contact">contact us</Link>. See our{" "}
        <Link href="/privacy">privacy policy</Link>.
      </p>
      {(status === "error" || status === "busy" || status === "offline") && (
        <p className="signup-error" role="alert">
          {status === "busy" ? "Too many tries. Wait a few minutes." : status === "offline" ? "Sign-ups aren't open yet." : "That didn't go through. Try again."}
        </p>
      )}
      <div className="field-trap" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
    </form>
  );
}
