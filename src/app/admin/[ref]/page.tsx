import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/server/auth";
import { env, ready } from "@/server/env";
import { KIND_LABEL, STATUSES, counts, getJob, nextStatus, statusLabel, type Kind } from "@/server/inbox";
import { changeStatus, saveNotes } from "../actions";
import { dateTime, money } from "../format";
import { AdminShell, Due, SpecGlyph, StatusMark, specOf, type Section } from "../ui";

/*
 * One job, as a ticket: where it is (a stepper with the next step one click away), what to make
 * (the sticker drawn with its shape and finish, every spec, the artwork), who it's for, the money
 * and the address, private notes and the history of every change. Quotes, leads and messages
 * use the same frame with their own details.
 */

type Params = Promise<{ ref: string }>;

export default function JobPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<p className="adm-loading">Loading…</p>}>
      <Job params={params} />
    </Suspense>
  );
}

type Address = { line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string };
type Shipping = { name?: string; address?: Address; cost?: number; tax?: number; custom?: { key: string; value: string | null }[] };

const SECTION: Record<Kind, { id: Section; label: string; href: string }> = {
  order: { id: "orders", label: "Orders", href: "/admin/orders" },
  sample_kit: { id: "kits", label: "Sample kits", href: "/admin/kits" },
  quote: { id: "quotes", label: "Quotes", href: "/admin/quotes" },
  business: { id: "leads", label: "Business leads", href: "/admin/leads" },
  contact: { id: "messages", label: "Messages", href: "/admin/messages" },
};

/** The normal path for each kind; any other status is a stop (cancelled, refunded...). */
const PATH: Record<Kind, string[]> = {
  order: ["pending_payment", "paid", "proof_sent", "approved", "printing", "shipped", "done"],
  sample_kit: ["pending_payment", "paid", "shipped", "done"],
  quote: ["new", "replied", "won"],
  business: ["new", "replied", "won"],
  contact: ["new", "replied", "closed"],
};

const kb = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`);
const short = (label: string) => label.replace(/:.*/, "");
const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

async function Job({ params }: { params: Params }) {
  await requireAdmin();
  const { ref } = await params;
  if (!/^LB-[A-Z0-9]{6}$/.test(ref) || !ready.db()) notFound();
  // the job, its files and history in one query, the sidebar counts beside it
  const [s, tally] = await Promise.all([getJob(ref), counts()]);
  if (!s) notFound();
  const { files, events } = s;

  const d = s.details as Record<string, unknown>;
  const spec = specOf(s);
  const ship = s.shipping as Shipping | null;
  const a = ship?.address;
  const kitSize = ship?.custom?.find((c) => c.key === "size")?.value;
  const path = PATH[s.kind];
  const at = path.indexOf(s.status);
  const stopped = at < 0;
  const next = nextStatus(s.kind, s.status);
  const section = SECTION[s.kind];
  const stripeBase = `https://dashboard.stripe.com${env.stripeSecretKey.startsWith("sk_test") ? "/test" : ""}`;
  const subject = encodeURIComponent(`Your Label Bros ${s.kind === "order" || s.kind === "sample_kit" ? "order" : "enquiry"} ${s.ref}`);
  type Line = { product: string; summary: string; packs: number; cents: number; artwork: string; design_for_them?: string; notes?: string };
  const items = Array.isArray(d.items) ? (d.items as Line[]) : null;
  const isJob = (s.kind === "order" || s.kind === "quote") && !items;
  const message = str(d.message);
  const theirNotes = str(d.notes);
  const design = d.design_for_them === "yes" || str(d.artwork) === "Design it for me";

  return (
    <AdminShell
      tally={tally}
      current={section.id}
      title={s.name || "Name at checkout"}
      lead={
        <>
          <Link href={section.href} className="adm-crumb">
            {section.label}
          </Link>{" "}
          / {s.ref} · {KIND_LABEL[s.kind]} · received {dateTime(s.created_at)}
        </>
      }
    >
      {/* where it is, and the next step */}
      <section className="adm-panel adm-progress" aria-label="Progress">
        {stopped ? (
          <p className="adm-stopped">
            <StatusMark kind={s.kind} status={s.status} /> This {KIND_LABEL[s.kind].toLowerCase()} is stopped.
          </p>
        ) : (
          <ol className="adm-steps">
            {path.map((st, i) => (
              <li key={st} data-state={i < at ? "done" : i === at ? "now" : "todo"} aria-current={i === at ? "step" : undefined}>
                <span className="adm-step-dot" aria-hidden="true">
                  {i < at ? "✓" : i + 1}
                </span>
                <span className="adm-step-label">{short(statusLabel(s.kind, st))}</span>
              </li>
            ))}
          </ol>
        )}
        <div className="adm-progress-actions">
          {next && (
            <form action={changeStatus}>
              <input type="hidden" name="ref" value={s.ref} />
              <input type="hidden" name="status" value={next} />
              <button type="submit" className="adm-btn adm-btn-primary">
                Mark as {short(statusLabel(s.kind, next)).toLowerCase()} →
              </button>
            </form>
          )}
          <form action={changeStatus} className="adm-inline">
            <input type="hidden" name="ref" value={s.ref} />
            <label htmlFor="adm-status" className="sr-only">
              Set status
            </label>
            <select id="adm-status" name="status" defaultValue={s.status} className="adm-input adm-select">
              {STATUSES[s.kind].map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
            <button type="submit" className="adm-btn">
              Set
            </button>
          </form>
        </div>
      </section>

      <div className="adm-job-grid">
        <div className="adm-job-main">
          {/* what to make */}
          {items && (
            <section className="adm-panel adm-ticket" aria-labelledby="items-title">
              <div className="adm-panel-head">
                <h2 id="items-title">Shop order · {items.length} {items.length === 1 ? "item" : "items"}</h2>
                <Due date={str(d.needed_by)} open={!["shipped", "done"].includes(s.status)} />
              </div>
              <ol className="adm-items">
                {items.map((it, i) => (
                  <li key={i}>
                    <span className="adm-items-n">{i + 1}</span>
                    <span className="adm-items-main">
                      <b>
                        {it.product}
                        {it.design_for_them && <span className="adm-flag">We design it</span>}
                      </b>
                      <span>{it.summary}</span>
                      <span className="adm-muted">{it.artwork}</span>
                      {it.notes && <blockquote className="adm-quote">{it.notes}</blockquote>}
                    </span>
                    <b className="adm-items-price">{money(it.cents, s.currency)}</b>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {isJob && (
            <section className="adm-panel adm-ticket" aria-labelledby="ticket-title">
              <div className="adm-panel-head">
                <h2 id="ticket-title">{s.kind === "quote" ? "Quote" : "Job ticket"}</h2>
                <span className="adm-ticket-flags">
                  {design && <span className="adm-flag">We design it</span>}
                  <Due date={spec.needed_by} open={!["shipped", "done"].includes(s.status)} />
                </span>
              </div>
              <div className="adm-ticket-body">
                <div className="adm-ticket-art">
                  <SpecGlyph shape={spec.shape} finish={spec.finish} size={112} />
                  <span>{spec.size}</span>
                </div>
                <dl className="adm-spec">
                  <div>
                    <dt>Quantity</dt>
                    <dd className="adm-spec-big">{spec.quantity ? Number(spec.quantity).toLocaleString("en-CA") : "—"}</dd>
                  </div>
                  <div>
                    <dt>Product</dt>
                    <dd>{spec.product ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Shape</dt>
                    <dd>{spec.shape ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Size</dt>
                    <dd>{spec.size ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Finish</dt>
                    <dd>{spec.finish ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Artwork</dt>
                    <dd>{str(d.artwork) ?? "—"}</dd>
                  </div>
                  {str(d.needed_by) && (
                    <div>
                      <dt>Needed by</dt>
                      <dd>{str(d.needed_by)}</dd>
                    </div>
                  )}
                  {str(d.as_shown) && (
                    <div className="adm-spec-wide">
                      <dt>The builder showed</dt>
                      <dd>{str(d.as_shown)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </section>
          )}

          {s.kind === "sample_kit" && (
            <section className="adm-panel adm-ticket" aria-labelledby="ticket-title">
              <div className="adm-panel-head">
                <h2 id="ticket-title">Pack this kit</h2>
              </div>
              <div className="adm-ticket-body">
                <div className="adm-ticket-art">
                  <SpecGlyph shape="die-cut" finish="holo" size={112} />
                </div>
                <dl className="adm-spec">
                  <div>
                    <dt>Contents</dt>
                    <dd>{s.summary}</dd>
                  </div>
                  <div>
                    <dt>Sticker size</dt>
                    <dd className="adm-spec-big">{kitSize ? kitSize.replace("in", " in") : "—"}</dd>
                  </div>
                </dl>
              </div>
            </section>
          )}

          {s.kind === "business" && (
            <section className="adm-panel" aria-labelledby="need-title">
              <div className="adm-panel-head">
                <h2 id="need-title">What they need</h2>
                <Due date={str(d.needed_by)} />
              </div>
              <div className="adm-chips adm-chips-lg">
                {(Array.isArray(d.labels) ? (d.labels as string[]) : []).map((l) => (
                  <span key={l} className="adm-chip">
                    {l}
                  </span>
                ))}
              </div>
              <dl className="adm-spec adm-spec-row">
                <div>
                  <dt>How many</dt>
                  <dd>{str(d.how_many) ?? "Not said"}</dd>
                </div>
                <div>
                  <dt>How often</dt>
                  <dd>{str(d.how_often) ?? "Not said"}</dd>
                </div>
                <div>
                  <dt>Business</dt>
                  <dd>{s.company ?? "—"}</dd>
                </div>
              </dl>
            </section>
          )}

          {(message || theirNotes) && (
            <section className="adm-panel" aria-labelledby="msg-title">
              <div className="adm-panel-head">
                <h2 id="msg-title">{s.kind === "contact" ? (str(d.topic) ?? "Message") : design ? "Their idea" : "From the customer"}</h2>
                {str(d.order_number) && <span className="adm-muted">Order {str(d.order_number)}</span>}
              </div>
              <blockquote className="adm-quote">{message ?? theirNotes}</blockquote>
            </section>
          )}

          {(files.length > 0 || str(d.artwork_link)) && (
            <section className="adm-panel" aria-labelledby="files-title">
              <div className="adm-panel-head">
                <h2 id="files-title">Artwork</h2>
              </div>
              <ul className="adm-files">
                {files.map((f) => (
                  <li key={f.id}>
                    <span className="adm-file-ext">{f.name.split(".").pop()?.toUpperCase().slice(0, 4)}</span>
                    <span className="adm-file-name">
                      <b>{f.name}</b>
                      <span>{kb(f.size)}</span>
                    </span>
                    <a href={`/admin/files/${f.id}`} className="adm-btn" download>
                      Download
                    </a>
                  </li>
                ))}
                {str(d.artwork_link) && /^https?:\/\//.test(str(d.artwork_link)!) && (
                  <li>
                    <span className="adm-file-ext">LINK</span>
                    <span className="adm-file-name">
                      <b>{new URL(str(d.artwork_link)!).hostname}</b>
                      <span>Files shared as a link</span>
                    </span>
                    <a href={str(d.artwork_link)} target="_blank" rel="noopener noreferrer nofollow" className="adm-btn">
                      Open ↗
                    </a>
                  </li>
                )}
              </ul>
            </section>
          )}

          <section className="adm-panel" aria-labelledby="notes-title">
            <div className="adm-panel-head">
              <h2 id="notes-title">Shop notes</h2>
              <span className="adm-muted">Only the shop sees these</span>
            </div>
            <form action={saveNotes} className="adm-notes">
              <input type="hidden" name="ref" value={s.ref} />
              <label htmlFor="adm-notes" className="sr-only">
                Shop notes
              </label>
              <textarea id="adm-notes" name="notes" defaultValue={s.notes} rows={5} maxLength={10000} className="adm-input" placeholder="Proof versions, colour notes, what the customer said on the phone…" />
              <button type="submit" className="adm-btn">
                Save notes
              </button>
            </form>
          </section>
        </div>

        <aside className="adm-job-side">
          <section className="adm-panel" aria-labelledby="who-title">
            <div className="adm-panel-head">
              <h2 id="who-title">Customer</h2>
            </div>
            <p className="adm-person">
              <span className="adm-avatar" aria-hidden="true">
                {(s.name || "?").slice(0, 1).toUpperCase()}
              </span>
              <span>
                <b>{s.name || "Name at checkout"}</b>
                {s.company && <span>{s.company}</span>}
              </span>
            </p>
            <dl className="adm-dl">
              <dt>Email</dt>
              <dd>{s.email ? <a href={`mailto:${s.email}?subject=${subject}`}>{s.email}</a> : "—"}</dd>
              {s.phone && (
                <>
                  <dt>Phone</dt>
                  <dd>
                    <a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`}>{s.phone}</a>
                  </dd>
                </>
              )}
            </dl>
            <div className="adm-contact-btns">
              {s.phone && (
                <a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`} className="adm-btn adm-btn-primary">
                  Call
                </a>
              )}
              {s.email && (
                <a href={`mailto:${s.email}?subject=${subject}`} className={`adm-btn${s.phone ? "" : " adm-btn-primary"}`}>
                  Reply by email
                </a>
              )}
            </div>
          </section>

          {(s.amount_cents != null || ship) && (
            <section className="adm-panel" aria-labelledby="money-title">
              <div className="adm-panel-head">
                <h2 id="money-title">{s.paid_at ? "Paid" : "Price"}</h2>
                <span className="adm-amount">{money(s.amount_cents, s.currency)}</span>
              </div>
              <dl className="adm-dl">
                {s.paid_at && (
                  <>
                    <dt>When</dt>
                    <dd>{dateTime(s.paid_at)}</dd>
                  </>
                )}
                {ship?.cost ? (
                  <>
                    <dt>Shipping</dt>
                    <dd>{money(ship.cost, s.currency)}</dd>
                  </>
                ) : s.paid_at ? (
                  <>
                    <dt>Shipping</dt>
                    <dd>Free</dd>
                  </>
                ) : null}
                {ship?.tax ? (
                  <>
                    <dt>Tax</dt>
                    <dd>{money(ship.tax, s.currency)}</dd>
                  </>
                ) : null}
                {a && (
                  <>
                    <dt>Ship to</dt>
                    <dd className="adm-address">
                      {[ship?.name, a.line1, a.line2, [a.city, a.state, a.postal_code].filter(Boolean).join(" "), a.country].filter(Boolean).join("\n")}
                    </dd>
                  </>
                )}
              </dl>
              {s.stripe_payment_intent && (
                <a href={`${stripeBase}/payments/${s.stripe_payment_intent}`} target="_blank" rel="noopener noreferrer" className="adm-link">
                  Receipt and refunds in Stripe ↗
                </a>
              )}
            </section>
          )}

          <section className="adm-panel" aria-labelledby="history-title">
            <div className="adm-panel-head">
              <h2 id="history-title">History</h2>
            </div>
            <ol className="adm-history">
              {events.map((e) => (
                <li key={e.id} data-actor={e.actor}>
                  <b>{e.action === "status" ? "Moved" : e.action === "created" ? "Received" : e.action.replace(/^./, (c) => c.toUpperCase())}</b>
                  {e.detail && <span>{e.detail}</span>}
                  <small>
                    {e.actor === "customer" ? "Customer" : e.actor === "stripe" ? "Stripe" : "Shop"} · {dateTime(e.at)}
                  </small>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}
