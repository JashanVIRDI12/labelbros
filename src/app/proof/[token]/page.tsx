/* eslint-disable @next/next/no-img-element -- a private proof served from the database, shown at its own size */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Arrow } from "@/components/site/Arrow";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { BRAND } from "@/lib/site";
import { ready } from "@/server/env";
import { getProof } from "@/server/inbox";
import { approveProof, requestChanges } from "../actions";

/*
 * A proof, from the private link in the customer's email: the proof itself, what we said about
 * it and what's in the order, then Approve or Ask for changes. Once answered it says so.
 */

export const metadata: Metadata = {
  title: `Your proof · ${BRAND}`,
  robots: { index: false, follow: false },
};

type Params = Promise<{ token: string }>;
type Search = Promise<{ need?: string; busy?: string; answered?: string }>;

export default function ProofPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  return (
    <>
      <Header />
      <main id="main" className="store proof">
        <Suspense fallback={<p className="proof-loading">Loading your proof…</p>}>
          <Proof params={params} searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

async function Proof({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { token } = await params;
  const { need, busy } = await searchParams;
  if (!/^[A-Za-z0-9_-]{32}$/.test(token) || !ready.db()) notFound();
  const p = await getProof(token);
  if (!p) notFound();
  const first = p.name_on_order.split(" ")[0];
  const items = Array.isArray(p.details.items) ? (p.details.items as { product: string; summary: string }[]) : [];
  const isImage = p.mime.startsWith("image/");
  const file = `/proof/${token}/file`;
  const open = p.status === "sent";
  const newer = p.latest > p.version;

  return (
    <div className="proof-grid">
      <section className="proof-sheet" aria-label="Your proof">
        {isImage ? (
          <img src={file} alt={`Proof ${p.version} for order ${p.ref}`} className="proof-img" />
        ) : (
          <a href={file} target="_blank" rel="noopener" className="proof-pdf">
            <span className="proof-pdf-ext">PDF</span>
            <b>Open proof {p.version}</b>
            <small>{p.name}</small>
          </a>
        )}
        <a href={file} target="_blank" rel="noopener" className="text-link proof-full">
          Open it full size
          <Arrow />
        </a>
      </section>

      <section className="proof-side form-card" aria-labelledby="proof-title">
        <p className="proof-ref">
          Order {p.ref} · Proof {p.version}
        </p>
        <h1 id="proof-title" className="proof-title">
          {p.status === "approved" ? "Approved. Thank you." : p.status === "changes" ? "Changes on the way." : p.status === "replaced" ? "There’s a newer proof." : `Your proof${first ? `, ${first}` : ""}.`}
        </h1>
        {newer && p.status !== "replaced" && <p className="form-tip">There’s a newer proof for this order. Open the latest link in your email.</p>}
        {p.message && <blockquote className="proof-msg">{p.message}</blockquote>}
        {items.length > 0 && (
          <ul className="proof-items">
            {items.map((it, i) => (
              <li key={i}>
                <b>{it.product}</b>
                <span>{it.summary}</span>
              </li>
            ))}
          </ul>
        )}

        {open ? (
          <>
            <p className="proof-check">Check the spelling, colours, size and cut line. We print exactly what you approve.</p>
            {busy && (
              <p className="form-alert" role="alert">
                That’s a lot of answers in a short time. Wait a few minutes and try again.
              </p>
            )}
            <form action={approveProof}>
              <input type="hidden" name="token" value={token} />
              <button type="submit" className="btn btn-primary proof-approve">
                Approve and print
                <Arrow />
              </button>
            </form>
            <form action={requestChanges} className="proof-changes" id="changes">
              <input type="hidden" name="token" value={token} />
              <label htmlFor="proof-comment" className="field-label">
                Or tell us what to change
              </label>
              <textarea id="proof-comment" name="comment" rows={4} maxLength={4000} aria-invalid={need === "comment" || undefined} aria-describedby={need === "comment" ? "proof-need" : undefined} />
              {need === "comment" && (
                <p id="proof-need" className="field-error">
                  Tell us what to change.
                </p>
              )}
              <button type="submit" className="btn btn-ghost">
                Ask for changes
              </button>
            </form>
          </>
        ) : p.status === "approved" ? (
          <p className="sent-body">
            {p.details.payment === "invoice" && !p.paid_at
              ? "You approved this proof. We print as soon as your invoice is paid, and ship within 2–4 business days."
              : "You approved this proof. We print it now and ship within 2–4 business days."}
          </p>
        ) : p.status === "changes" ? (
          <>
            <p className="sent-body">We have your changes and send a new proof soon:</p>
            <blockquote className="proof-msg">{p.comment}</blockquote>
          </>
        ) : (
          <p className="sent-body">We sent you a newer proof. Open the latest link in your email.</p>
        )}
        <p className="proof-help">
          Questions? <Link href="/contact">Contact us</Link> and quote {p.ref}.
        </p>
      </section>
    </div>
  );
}
