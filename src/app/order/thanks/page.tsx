import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClearCart } from "@/components/store/ClearCart";
import { Arrow } from "@/components/site/Arrow";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { CALL, PROOF, SHIPS } from "@/lib/facts";
import { BRAND } from "@/lib/site";
import { completeCheckout } from "@/server/checkout";
import { ready } from "@/server/env";
import { getByRef } from "@/server/inbox";
import { stripe } from "@/server/stripe";

/*
 * Back from Stripe: the order, its reference and what happens next. It asks Stripe itself
 * whether the payment went through (the webhook may not have arrived yet) and only shows the
 * order when the reference and Stripe's session id belong together.
 */

export const metadata: Metadata = {
  title: `Thank you · ${BRAND}`,
  robots: { index: false, follow: false },
};

type Search = Promise<{ ref?: string; session_id?: string }>;

export default function ThanksPage({ searchParams }: { searchParams: Search }) {
  return (
    <>
      <Header />
      <main id="main" className="store ty">
        <div className="ty-card form-card">
          <Suspense fallback={<p className="sent-body">Checking your payment…</p>}>
            <Receipt searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}

async function lookUp(ref: string | undefined, sessionId: string | undefined) {
  if (!ref || !sessionId || !ready.db() || !ready.stripe()) return null;
  if (!/^LB-[A-Z0-9]{6}$/.test(ref) || !/^cs_[A-Za-z0-9_]{10,200}$/.test(sessionId)) return null;
  const row = await getByRef(ref);
  if (!row || row.stripe_session_id !== sessionId) return null;
  if (row.status !== "pending_payment" && row.status !== "abandoned") return { row, paid: true };
  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    const done = await completeCheckout(session);
    return { row: done ?? row, paid: Boolean(done) || session.payment_status === "paid" };
  } catch {
    return { row, paid: false };
  }
}

async function Receipt({ searchParams }: { searchParams: Search }) {
  const { ref, session_id } = await searchParams;
  const found = await lookUp(ref, session_id);

  if (!found)
    return (
      <>
        <h1 className="sent-title">We couldn&apos;t find that order.</h1>
        <p className="sent-body">
          If you paid, your receipt is on its way by email and we have your order. Questions?{" "}
          <Link href="/contact" className="underline underline-offset-2">
            Send us a message
          </Link>
          .
        </p>
      </>
    );

  const { row, paid } = found;
  const first = row.name.split(" ")[0];
  const kit = row.kind === "sample_kit";

  if (!paid)
    return (
      <>
        <h1 className="sent-title">Payment processing.</h1>
        <p className="sent-body">
          Your order {row.ref} is saved. Stripe is still confirming the payment; you get an email as soon as it goes
          through.
        </p>
      </>
    );

  return (
    <div className="sent" role="status">
      {row.details.source === "shop" && <ClearCart />}
      <span className="sent-stamp" aria-hidden="true">
        Paid
      </span>
      <h1 className="sent-title">Thanks{first ? `, ${first}` : ""}.</h1>
      <p className="sent-body">
        Order <b>{row.ref}</b>: {row.summary}.
      </p>
      <p className="sent-body">
        {kit
          ? `${SHIPS}. We email you when it is on its way.`
          : `${row.details.design_for_them ? "We start on your design now. " : ""}${PROOF.replace("Free proof", "Your proof comes")}, by email${row.email ? ` to ${row.email}` : ""}, for you to approve. ${CALL}${row.phone ? ` (on ${row.phone})` : ""}. Nothing prints until you say yes.`}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
        <Link href="/track" className="btn btn-primary">
          Track your order
          <Arrow />
        </Link>
        <Link href="/" className="text-link">
          Back to the home page
        </Link>
      </div>
    </div>
  );
}
