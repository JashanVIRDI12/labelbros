"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Arrow } from "@/components/site/Arrow";
import { Field, FormAlert, Honeypot, describedBy, type Status } from "@/components/forms/Field";
import type { QuoteSnapshot } from "@/components/sections/Pricing";
import { quoteSearch } from "@/components/sections/pricing-model";
import { UPLOAD_MB, isStripeUrl, send } from "@/lib/api";
import { CALL, PROOF, money } from "@/lib/facts";
import { EMAIL } from "@/lib/forms";
import { useUrlFlag } from "@/lib/use-url-flag";

/*
 * "Send it to us": the quote as built above (a cream ticket that follows every change) and the
 * form that orders it. "Pay and order" saves it and goes to Stripe's checkout; "Send it as a
 * quote" sends it without paying, for anything the builder doesn't cover. The server works the
 * price out again itself. Without the backend set up it says so instead of pretending.
 */

const IDEA_HINT = "What it says and shows, colours, style, where it goes. Logos or examples: add a link above.";

const sizeOf = (bytes: number) =>
  bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`;

export function QuoteSend({ snap }: { snap: QuoteSnapshot | null }) {
  const [status, setStatus] = useState<Status>("idle");
  const [mode, setMode] = useState<"pay" | "quote">("pay");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<{ name: string; email: string; ref: string | null } | null>(null);
  // back from Stripe without paying
  const cancelled = useUrlFlag("checkout", "cancelled");

  const file = snap?.file ?? null;
  const attach = !!file && file.size <= UPLOAD_MB * 1e6;
  const design = snap?.quote.artwork === "design";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const how = submitter?.value === "quote" ? "quote" : "pay";
    setMode(how);
    const data = new FormData(form);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    const errs: Record<string, string> = {};
    if (!v("name")) errs.name = "Tell us your name.";
    if (!EMAIL.test(v("email"))) errs.email = "We need your email to send your proof.";
    if (!/\d(?:\D*\d){6}/.test(v("phone"))) errs.phone = "We need a phone number to call you about your design.";
    if (design && v("notes").length < 10) errs.notes = "Tell us your idea: what it says and shows, colours, style.";
    if (v("link") && !/^https?:\/\/\S+$/i.test(v("link"))) errs.link = "Paste the whole link, starting with https://";
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    if (!snap) return;

    // the quote's choices (the server prices them), the summary as shown, and their file
    for (const [k, val] of new URLSearchParams(quoteSearch(snap.quote))) data.set(k === "artwork" ? "artwork_choice" : k, val);
    data.set("summary", snap.summary);
    data.set("mode", how);
    data.set("currency", snap.currency);
    if (attach && file) data.set("artwork", file, file.name);

    setStatus(how === "pay" ? "paying" : "sending");
    const res = await send("/api/orders", data);
    if (res.ok) {
      if (how === "pay" && res.url && isStripeUrl(res.url)) {
        window.location.assign(res.url);
        return;
      }
      setSent({ name: v("name"), email: v("email"), ref: res.ref });
      setStatus("sent");
      return;
    }
    if (res.fields) {
      setErrors(res.fields);
      const key = Object.keys(res.fields).find((k) => form.querySelector(`[name="${k}"]`));
      if (key) form.querySelector<HTMLElement>(`[name="${key}"]`)?.focus();
    }
    setStatus(res.reason);
  }

  const busy = status === "sending" || status === "paying";

  return (
    <section id="send" aria-labelledby="send-title" className="qs">
      <div className="qs-intro">
        <h2 id="send-title" className="section-title">
          Pay and we start.
        </h2>
        <p className="qs-lede">
          Pay now and we check your artwork (or design it for you), email you a proof to approve, and call you if
          anything needs changing. Nothing prints until you say yes.
        </p>

        {/* the quote as built: a ticket that follows every change above */}
        <div className="qs-ticket" aria-live="polite">
          <p className="qs-ticket-head">Your quote</p>
          <p className="qs-ticket-line">{snap?.summary ?? "Build your quote above."}</p>
          {snap && (
            <p className="qs-ticket-price">
              {money(snap.total, snap.currency)} <span>{snap.currency.toUpperCase()}</span>
            </p>
          )}
          <p className="qs-ticket-art">
            {design
              ? "Artwork: we design it for you, then send a proof to approve."
              : file
                ? `Artwork: ${file.name} (${sizeOf(file.size)})${attach ? ", sent with your order." : `. Over ${UPLOAD_MB} MB: add a link below, or send it when we reply.`}`
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
              Your quote is with us{sent?.ref ? ` (reference ${sent.ref})` : ""}. We check it and write back by email
              {sent ? ` to ${sent.email}` : ""}, with a free proof before anything prints.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
              <Link href="/stickers" className="btn btn-primary">
                See all our stickers
                <Arrow />
              </Link>
              <Link href="/how-it-works" className="text-link">
                How it works
              </Link>
            </div>
          </div>
        ) : (
          <form noValidate onSubmit={onSubmit} aria-describedby="qf-note">
            {cancelled && status === "idle" && (
              <p className="form-tip" role="status">
                Your payment wasn&apos;t finished, so nothing was charged. Your quote is still here.
              </p>
            )}
            <div className="form-grid">
              <Field id="qf-name" label="Your name" error={errors.name}>
                <input id="qf-name" name="name" autoComplete="name" required maxLength={120} aria-invalid={!!errors.name} aria-describedby={describedBy("qf-name", errors.name)} />
              </Field>
              <Field id="qf-email" label="Email" error={errors.email} hint="Your proof comes here.">
                <input id="qf-email" name="email" type="email" autoComplete="email" inputMode="email" required maxLength={200} aria-invalid={!!errors.email} aria-describedby={describedBy("qf-email", errors.email, "Your proof comes here.")} />
              </Field>
              <Field id="qf-phone" label="Phone" error={errors.phone} hint="We call if your design needs changes.">
                <input
                  id="qf-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  maxLength={40}
                  aria-invalid={!!errors.phone}
                  aria-describedby={describedBy("qf-phone", errors.phone, "We call if your design needs changes.")}
                />
              </Field>
              <Field id="qf-company" label="Business" optional>
                <input id="qf-company" name="company" autoComplete="organization" maxLength={160} />
              </Field>
              <Field id="qf-needed" label="Need them by" optional error={errors.needed}>
                <input id="qf-needed" name="needed" type="date" aria-invalid={!!errors.needed} aria-describedby={describedBy("qf-needed", errors.needed)} />
              </Field>
              <Field id="qf-link" label="Link to your files" optional error={errors.link ?? errors.artwork} hint="Dropbox, Google Drive or WeTransfer, for big files.">
                <input id="qf-link" name="link" type="url" inputMode="url" placeholder="https://" maxLength={500} aria-invalid={!!(errors.link ?? errors.artwork)} aria-describedby={describedBy("qf-link", errors.link ?? errors.artwork, "Dropbox, Google Drive or WeTransfer, for big files.")} />
              </Field>
              <div className="form-wide">
                {design ? (
                  <Field id="qf-notes" label="Your idea" error={errors.notes} hint={IDEA_HINT}>
                    <textarea
                      id="qf-notes"
                      name="notes"
                      rows={5}
                      required
                      maxLength={3000}
                      placeholder="A round sticker for our coffee shop, Fire Escape: a flame and a coffee cup, red and cream, bold and a bit retro."
                      aria-invalid={!!errors.notes}
                      aria-describedby={describedBy("qf-notes", errors.notes, IDEA_HINT)}
                    />
                  </Field>
                ) : (
                  <Field id="qf-notes" label="Anything else?" optional hint="Colours, a deadline, or what the builder does not cover: rolls, more than 100,000, special materials.">
                    <textarea id="qf-notes" name="notes" rows={4} maxLength={3000} aria-describedby="qf-notes-hint" />
                  </Field>
                )}
              </div>
            </div>
            <Honeypot />

            {errors.quote && <FormAlert>{errors.quote}</FormAlert>}
            <FormAlert status={status} />

            <div className="form-foot">
              <button type="submit" name="mode" value="pay" className="btn btn-primary" disabled={busy || !snap}>
                {status === "paying" ? "Taking you to checkout…" : snap ? `Pay ${money(snap.total, snap.currency)} ${snap.currency.toUpperCase()} and order` : "Pay and order"}
                <Arrow />
              </button>
              <button type="submit" name="mode" value="quote" className="text-link text-button" disabled={busy || !snap}>
                {status === "sending" && mode === "quote" ? "Sending…" : "Or send it as a quote first"}
              </button>
              <p id="qf-note" className="form-note form-note-wide">
                Secure checkout by Stripe. Shipping and any tax are shown there before you pay. {PROOF}. {CALL}, and
                nothing prints until you say yes.
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
