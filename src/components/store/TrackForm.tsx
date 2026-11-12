"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { EMAIL } from "@/lib/forms";
import { TRACK_STEPS, type TrackResult } from "@/lib/track";

/*
 * Track my order: the order number and the email it was placed with, then the order's steps with
 * the current one marked. A link from the confirmation email (?ref=LB-…) fills in the number.
 */
export function TrackForm() {
  const [status, setStatus] = useState<"idle" | "looking" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackResult | null>(null);
  const refInput = useRef<HTMLInputElement>(null);
  const result = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref && refInput.current) refInput.current.value = ref;
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const ref = String(data.get("ref") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    if (!/^(LB-)?[A-Za-z0-9]{6}$/i.test(ref) || !EMAIL.test(email)) {
      setStatus("error");
      setMessage("Add your order number (it starts with LB-) and the email you ordered with.");
      return;
    }
    setStatus("looking");
    setMessage(null);
    let res: Response;
    try {
      res = await fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ref, email }) });
    } catch {
      setStatus("error");
      setMessage("That didn't go through. Check your connection and try again.");
      return;
    }
    const body = (await res.json().catch(() => ({}))) as { order?: TrackResult; error?: string; fields?: { form?: string } };
    if (res.ok && body.order) {
      setOrder(body.order);
      setStatus("idle");
      requestAnimationFrame(() => result.current?.focus());
      return;
    }
    setStatus("error");
    setMessage(
      body.error === "busy"
        ? "That's a lot of lookups. Wait a few minutes and try again."
        : body.error === "offline"
          ? "Tracking isn't open yet. Contact us and we'll tell you where your order is."
          : (body.fields?.form ?? "We couldn't find that order."),
    );
  }

  return (
    <div className="track">
      <form className="track-form form-card" onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="tr-ref" className="field-label">
            Order number
          </label>
          <input ref={refInput} id="tr-ref" name="ref" autoComplete="off" placeholder="LB-7K3Q9P" maxLength={12} />
        </div>
        <div className="field">
          <label htmlFor="tr-email" className="field-label">
            Email you ordered with
          </label>
          <input id="tr-email" name="email" type="email" inputMode="email" autoComplete="email" maxLength={200} />
        </div>
        <button type="submit" className="btn btn-primary track-btn" disabled={status === "looking"}>
          {status === "looking" ? "Looking…" : "Track order"}
        </button>
        {message && (
          <p className="form-alert" role="alert">
            {message}
          </p>
        )}
        <p className="track-help">
          Your order number is in your confirmation email. Can&apos;t find it? <Link href="/contact">Contact us</Link>.
        </p>
      </form>

      {order && (
        <div ref={result} className="track-result" tabIndex={-1} aria-live="polite">
          <p className="track-ref">{order.ref}</p>
          <p className="track-summary">{order.summary}</p>
          {order.state === "invoice" ? (
            <p className="track-state">We have your order and are checking your artwork. Your proof and invoice come by email; we print once the proof is approved and the invoice is paid.</p>
          ) : order.state === "unpaid" ? (
            <p className="track-state">This order wasn&apos;t paid, so nothing is being made. Your cart is still here when you want it.</p>
          ) : order.state ? (
            <p className="track-state">This order was {order.state}. Questions? Contact us with the order number.</p>
          ) : (
            <ol className="track-steps">
              {TRACK_STEPS.map((s, i) => (
                <li key={s.id} className="track-step" data-state={i < order.step ? "done" : i === order.step ? "now" : "next"}>
                  <span className="track-dot" aria-hidden="true" />
                  <span>
                    <b>
                      {s.label}
                      {i === order.step && <span className="sr-only"> (current step)</span>}
                    </b>
                    <small>{s.note}</small>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
