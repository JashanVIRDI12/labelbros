import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Arrow } from "@/components/site/Arrow";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { ClearCart } from "@/components/store/ClearCart";
import { CALL, INVOICE_DAYS, PROOF } from "@/lib/facts";
import { BRAND } from "@/lib/site";

/*
 * After "Request invoice": the order is saved and nothing was charged. Shows the reference only
 * (nothing personal: anyone with the link sees this page) and what happens next.
 */

export const metadata: Metadata = {
  title: `Invoice requested · ${BRAND}`,
  robots: { index: false, follow: false },
};

type Search = Promise<{ ref?: string }>;

export default function RequestedPage({ searchParams }: { searchParams: Search }) {
  return (
    <>
      <Header />
      <main id="main" className="store ty">
        <div className="ty-card form-card">
          <Suspense fallback={<p className="sent-body">One moment…</p>}>
            <Body searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}

async function Body({ searchParams }: { searchParams: Search }) {
  const { ref } = await searchParams;
  const valid = ref && /^LB-[A-Z0-9]{6}$/.test(ref) ? ref : null;
  return (
    <div className="sent" role="status">
      <ClearCart />
      <span className="sent-stamp" aria-hidden="true">
        Sent
      </span>
      <h1 className="sent-title">Your order is in.</h1>
      {valid && (
        <p className="sent-body">
          Order <b>{valid}</b>. Keep this number to track it.
        </p>
      )}
      <p className="sent-body">Nothing has been charged. Here is what happens next:</p>
      <ol className="ty-steps">
        <li>We check your artwork by hand. {CALL}.</li>
        <li>
          {PROOF.replace("Free proof", "Your free proof comes by email")}, with an invoice from Stripe due in {INVOICE_DAYS} days.
        </li>
        <li>Approve the proof and pay the invoice online, and we print and ship.</li>
      </ol>
      <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
        <Link href="/track" className="btn btn-primary">
          Track your order
          <Arrow />
        </Link>
        <Link href="/labels" className="text-link">
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
