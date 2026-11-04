"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Arrow } from "@/components/site/Arrow";
import { Field, Honeypot, EMAIL, describedBy } from "@/components/forms/Field";
import type { QuoteSnapshot } from "@/components/sections/Pricing";
import { ATTACH_LIMIT, NotConnected, canSend, sendEmail } from "@/lib/emailjs";
import { PROOF, money } from "@/lib/facts";
import { CONTACT } from "@/lib/site";

/*
 * "Send it to us": the quote as built above (a cream ticket that follows every change) and the
 * form that sends it, with their artwork when it is small enough, by EmailJS. On success the
 * form gives way to a "Sent" stamp. Without EmailJS set up it says so instead of pretending.
 */

type Status = "idle" | "sending" | "sent" | "error" | "offline";

const sizeOf = (bytes: number) =>
  bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`;

export function QuoteSend({ snap }: { snap: QuoteSnapshot | null }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<{ name: string; email: string } | null>(null);

  const file = snap?.file ?? null;
  const attach = !!file && ATTACH_LIMIT > 0 && file.size <= ATTACH_LIMIT;
  const design = snap?.quote.artwork === "design";

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
    if (!EMAIL.test(v("email"))) errs.email = "We need your email to send your proof.";
    if (v("link") && !/^https?:\/\/\S+$/i.test(v("link"))) errs.link = "Paste the whole link, starting with https://";
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    if (!canSend("quote")) {
      setStatus("offline");
      return;
    }
    setStatus("sending");
    try {
      await sendEmail(
        "quote",
        {
          name: v("name"),
          email: v("email"),
          reply_to: v("email"),
          phone: v("phone") || "not given",
          company: v("company") || "not given",
          needed_by: v("needed") || "no date given",
          artwork_link: v("link") || "none",
          notes: v("notes") || "none",
          quote: snap?.summary ?? "",
          price: snap ? `${money(snap.total)} CAD` : "",
          each: snap ? `${money(snap.each)} CAD` : "",
          artwork_choice: design ? "Design it for me" : file ? "Their own file" : "No file yet",
          artwork_file: file ? `${file.name} (${sizeOf(file.size)}), ${attach ? "attached" : "not attached: ask for it"}` : "none",
          page: window.location.href,
        },
        attach ? file : null,
      );
      setSent({ name: v("name"), email: v("email") });
      setStatus("sent");
    } catch (err) {
      setStatus(err instanceof NotConnected ? "offline" : "error");
    }
  }

  return (
    <section id="send" aria-labelledby="send-title" className="qs">
      <div className="qs-intro">
        <h2 id="send-title" className="section-title">
          Send it to us.
        </h2>
        <p className="qs-lede">
          We check your artwork, set it up and email you a free proof. Nothing prints until you approve it.
        </p>

        {/* the quote as built: a ticket that follows every change above */}
        <div className="qs-ticket" aria-live="polite">
          <p className="qs-ticket-head">Your quote</p>
          <p className="qs-ticket-line">{snap?.summary ?? "Build your quote above."}</p>
          {snap && (
            <p className="qs-ticket-price">
              {money(snap.total)} <span>CAD</span>
            </p>
          )}
          <p className="qs-ticket-art">
            {design
              ? "Artwork: designed for you, with a free proof."
              : file
                ? `Artwork: ${file.name} (${sizeOf(file.size)})${attach ? ", sent with this quote." : ". We ask you for it when we reply, or add a link below."}`
                : "Artwork: none yet. Upload it above, add a link below, or send it when we reply."}
          </p>
          <a href="#pricing" className="text-link qs-change">
            Change it
          </a>
        </div>
      </div>

      <div className="qs-card form-card">
        {status === "sent" ? (
          <div className="sent" role="status">
            <span className="sent-stamp" aria-hidden="true">
              Sent
            </span>
            <p className="sent-title">Thanks{sent ? `, ${sent.name.split(" ")[0]}` : ""}.</p>
            <p className="sent-body">
              Your quote is with us. {PROOF.replace("Free proof", "Your free proof comes")}, by email
              {sent ? ` to ${sent.email}` : ""}.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
              <Link href="/#samples" className="btn btn-primary">
                Order a sample kit
                <Arrow />
              </Link>
              <Link href="/how-it-works" className="text-link">
                How it works
              </Link>
            </div>
          </div>
        ) : (
          <form noValidate onSubmit={onSubmit} aria-describedby="qf-note">
            <div className="form-grid">
              <Field id="qf-name" label="Your name" error={errors.name}>
                <input id="qf-name" name="name" autoComplete="name" required aria-invalid={!!errors.name} aria-describedby={describedBy("qf-name", errors.name)} />
              </Field>
              <Field id="qf-email" label="Email" error={errors.email} hint="Your proof comes here.">
                <input id="qf-email" name="email" type="email" autoComplete="email" inputMode="email" required aria-invalid={!!errors.email} aria-describedby={describedBy("qf-email", errors.email, "Your proof comes here.")} />
              </Field>
              <Field id="qf-phone" label="Phone" optional>
                <input id="qf-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" />
              </Field>
              <Field id="qf-company" label="Business" optional>
                <input id="qf-company" name="company" autoComplete="organization" />
              </Field>
              <Field id="qf-needed" label="Need them by" optional>
                <input id="qf-needed" name="needed" type="date" />
              </Field>
              <Field id="qf-link" label="Link to your files" optional error={errors.link} hint="Dropbox, Google Drive or WeTransfer, for big files.">
                <input id="qf-link" name="link" type="url" inputMode="url" placeholder="https://" aria-invalid={!!errors.link} aria-describedby={describedBy("qf-link", errors.link, "Dropbox, Google Drive or WeTransfer, for big files.")} />
              </Field>
              <div className="form-wide">
                <Field id="qf-notes" label="Anything else?" optional hint="Colours, a deadline, or what the builder does not cover: rolls, more than 100,000, special materials.">
                  <textarea id="qf-notes" name="notes" rows={4} aria-describedby="qf-notes-hint" />
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
                {status === "sending" ? "Sending…" : "Send my quote"}
                <Arrow />
              </button>
              <p id="qf-note" className="form-note">
                {PROOF}. Nothing prints until you say yes.
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
