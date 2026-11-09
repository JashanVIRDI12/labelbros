"use client";

import { useState } from "react";
import { Arrow } from "@/components/site/Arrow";
import { isStripeUrl, send } from "@/lib/api";
import { CONTACT } from "@/lib/site";
import { useUrlFlag } from "@/lib/use-url-flag";
import { useCurrency } from "@/lib/currency";

/*
 * "Order a sample kit": straight to Stripe's checkout, which asks for the address and the
 * sticker size. Says why if it can't (backend not set up yet, or a failed request).
 */
export function KitButton() {
  const [state, setState] = useState<"idle" | "going" | "offline" | "error">("idle");
  const cancelled = useUrlFlag("checkout", "cancelled", "#samples");
  const currency = useCurrency();

  async function order() {
    setState("going");
    const res = await send("/api/sample-kit", { currency });
    if (res.ok && res.url && isStripeUrl(res.url)) {
      window.location.assign(res.url);
      return;
    }
    setState(!res.ok && res.reason === "offline" ? "offline" : "error");
  }

  const note =
    state === "offline"
      ? `Online ordering isn't open yet.${CONTACT.email ? ` Email ${CONTACT.email} for a kit.` : ""}`
      : state === "error"
        ? "That didn't go through. Try again in a moment."
        : state === "idle" && cancelled
          ? "Checkout wasn't finished, so nothing was charged."
          : "";

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={order} disabled={state === "going"} aria-describedby={note ? "kit-note" : undefined}>
        {state === "going" ? "Taking you to checkout…" : "Order a sample kit"}
        <Arrow />
      </button>
      <p id="kit-note" className="kit-note" role="status">
        {note}
      </p>
    </>
  );
}
