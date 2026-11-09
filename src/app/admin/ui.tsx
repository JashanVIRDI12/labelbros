import Link from "next/link";
import type { ReactNode } from "react";
import { env, ready } from "@/server/env";
import { KIND_LABEL, TODO, counts, nextStatus, statusLabel, type Kind, type Submission } from "@/server/inbox";
import { changeStatus, logout } from "./actions";
import { ago, isPast, money } from "./format";

/*
 * The back office's building blocks: the shell (sections down the side, search on top), status
 * and kind marks, the sticker spec drawn as a glyph, job cards for the production board,
 * submission tables and the orders chart. All server-rendered; the only scripts are Next's.
 */

/* ---------- Shell ---------- */

export type Section = "overview" | "orders" | "kits" | "quotes" | "leads" | "messages" | "all";

const NAV: { group?: string; items: { id: Section; label: string; href: string; kind?: Kind }[] }[] = [
  { items: [{ id: "overview", label: "Overview", href: "/admin" }] },
  {
    group: "Production",
    items: [
      { id: "orders", label: "Orders", href: "/admin/orders", kind: "order" },
      { id: "kits", label: "Sample kits", href: "/admin/kits", kind: "sample_kit" },
    ],
  },
  {
    group: "Sales",
    items: [
      { id: "quotes", label: "Quotes", href: "/admin/quotes", kind: "quote" },
      { id: "leads", label: "Business leads", href: "/admin/leads", kind: "business" },
      { id: "messages", label: "Messages", href: "/admin/messages", kind: "contact" },
    ],
  },
  { items: [{ id: "all", label: "Everything", href: "/admin/all" }] },
];

const ICONS: Record<Section, string> = {
  overview: "M3 11.5 10 5l7 6.5M5.5 9.5V16h9V9.5",
  orders: "M4 6h12v10H4zM4 9h12M8 6V4h4v2",
  kits: "M3.5 7.5 10 4l6.5 3.5v6L10 17l-6.5-3.5zM3.5 7.5 10 11l6.5-3.5M10 11v6",
  quotes: "M5 3.5h7l3 3V16.5H5zM12 3.5v3h3M7.5 10h5M7.5 13h5",
  leads: "M3.5 16V6.5h5V16M8.5 16V3.5h8V16M2.5 16h15M11 6.5h3M11 9.5h3M11 12.5h3",
  messages: "M3.5 5h13v9h-8l-3.5 3v-3H3.5z",
  all: "M8.5 14a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zM12.5 12.5 17 17",
};

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="adm-icon">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function setupSteps() {
  return [
    { done: ready.db(), label: "Database", how: "DATABASE_URL" },
    { done: ready.stripe(), label: "Stripe payments", how: "STRIPE_SECRET_KEY" },
    { done: Boolean(env.stripeWebhookSecret), label: "Stripe webhook", how: "STRIPE_WEBHOOK_SECRET" },
    { done: ready.mail(), label: "Email alerts", how: "SMTP_HOST, MAIL_FROM, SHOP_INBOX" },
    { done: Boolean(env.siteUrl), label: "Site address", how: "NEXT_PUBLIC_SITE_URL" },
    { done: env.stripeAutomaticTax, label: "Sales tax (GST/HST)", how: "STRIPE_AUTOMATIC_TAX=true" },
  ];
}

/** The page frame: sections down the side (with what needs doing in each), title and search on top. */
export async function AdminShell({
  tally: given,
  current,
  title,
  lead,
  actions,
  children,
}: {
  /** the sidebar counts, when the page fetched them alongside its own data */
  tally?: Awaited<ReturnType<typeof counts>>;
  current: Section;
  title: string;
  lead?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const tally = given ?? (ready.db() ? await counts() : []);
  const todo = (k?: Kind) => (k ? (tally.find((t) => t.kind === k)?.todo ?? 0) : 0);
  const steps = setupSteps();
  const done = steps.filter((s) => s.done).length;

  return (
    <div className="adm-app">
      {/* the holographic finish, shared by every sticker glyph (sticker art may carry any colour) */}
      <svg width="0" height="0" className="sr-only" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="adm-holo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffb3e6" />
            <stop offset="0.35" stopColor="#b8c7ff" />
            <stop offset="0.65" stopColor="#a8f0dc" />
            <stop offset="1" stopColor="#fff0a8" />
          </linearGradient>
        </defs>
      </svg>
      <aside className="adm-side-wrap" aria-label="Back office">
        <div className="adm-side">
        <Link href="/admin" className="adm-brand" aria-label="Label Bros back office, overview">
          <span className="adm-brand-sticker">
            <b>Label</b>
            <b>Bros</b>
          </span>
          <span className="adm-brand-sub">Back office</span>
        </Link>
        <nav className="adm-nav" aria-label="Sections">
          {NAV.map((g, i) => (
            <div key={g.group ?? i} className="adm-nav-group">
              {g.group && <p className="adm-nav-head">{g.group}</p>}
              <ul>
                {g.items.map((it) => {
                  const n = todo(it.kind);
                  return (
                    <li key={it.id}>
                      <Link href={it.href} className="adm-nav-link" aria-current={current === it.id ? "page" : undefined}>
                        <Icon d={ICONS[it.id]} />
                        <span>{it.label}</span>
                        {n > 0 && (
                          <span className="adm-badge" aria-label={`${n} to do`}>
                            {n}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="adm-side-foot">
          {done < steps.length && (
            <details className="adm-setup">
              <summary>
                <span>Setup</span>
                <span className="adm-setup-count">
                  {done} of {steps.length}
                </span>
                <span className="adm-meter" aria-hidden="true">
                  <i style={{ width: `${(done / steps.length) * 100}%` }} />
                </span>
              </summary>
              <ul>
                {steps.map((s) => (
                  <li key={s.label} data-done={s.done || undefined}>
                    <span aria-hidden="true">{s.done ? "✓" : "○"}</span>
                    <span>
                      {s.label}
                      {!s.done && <code>{s.how}</code>}
                    </span>
                  </li>
                ))}
              </ul>
              <p>Each step: reference/BACKEND.md</p>
            </details>
          )}
          <div className="adm-side-links">
            <Link href="/" className="adm-side-link">
              View site ↗
            </Link>
            <form action={logout}>
              <button type="submit" className="adm-side-link">
                Sign out
              </button>
            </form>
          </div>
        </div>
        </div>
      </aside>

      <div className="adm-body">
        <header className="adm-top">
          <div className="adm-top-title">
            <h1>{title}</h1>
            {lead && <p>{lead}</p>}
          </div>
          <div className="adm-top-tools">
            {actions}
            <form action="/admin/all" className="adm-search" role="search">
              <label htmlFor="adm-q" className="sr-only">
                Search everything
              </label>
              <Icon d={ICONS.all} />
              <input id="adm-q" name="q" placeholder="Search name, email, LB-…" maxLength={100} />
            </form>
          </div>
        </header>
        <main id="main" className="adm-main">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ---------- Marks ---------- */

/** A status with its mark: yellow = waiting on us, green = done, red = stopped, outline = waiting on them. */
export function StatusMark({ kind, status }: { kind: Kind; status: string }) {
  return (
    <span className="adm-status" data-status={status} data-todo={TODO.includes(status) || undefined}>
      {statusLabel(kind, status)}
    </span>
  );
}

export function KindMark({ kind }: { kind: Kind }) {
  return (
    <span className="adm-kind" data-kind={kind}>
      {KIND_LABEL[kind]}
    </span>
  );
}

type Spec = { shape?: string; finish?: string; product?: string; size?: string; quantity?: number | string; needed_by?: string };
export const specOf = (s: Pick<Submission, "details">) => s.details as Spec;

const SHAPES: Record<string, ReactNode> = {
  "die-cut": <path d="M14 4c5 0 7 3 9 6 4 0 6 3 5 7 3 2 3 7-1 9-1 4-6 5-9 3-3 2-8 1-9-2-4 0-6-4-4-7-3-3-1-8 3-9 0-4 3-7 6-7z" />,
  circle: <circle cx="16" cy="16" r="12" />,
  square: <rect x="4.5" y="4.5" width="23" height="23" rx="3" />,
  rectangle: <rect x="3" y="8" width="26" height="16" rx="3" />,
};

/** The sticker as ordered: its shape, filled with its finish (holographic shimmers, matte is flat). */
export function SpecGlyph({ shape = "die-cut", finish = "gloss", size = 32 }: { shape?: string; finish?: string; size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className="adm-glyph" data-finish={finish} aria-hidden="true">
      <g className="adm-glyph-shape">{SHAPES[shape] ?? SHAPES["die-cut"]}</g>
      {finish === "gloss" && <path d="M9 10.5c2-3 5-4 8-4" className="adm-glyph-shine" />}
    </svg>
  );
}

/** "Needed by" as a short date, red when it has passed and the job isn't out the door. */
export function Due({ date, open = true }: { date?: string; open?: boolean }) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const d = new Date(`${date}T12:00:00`);
  const late = open && isPast(d, 12 * 3600_000);
  return (
    <span className="adm-due" data-late={late || undefined}>
      {late ? "Late · " : "Due "}
      {d.toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
    </span>
  );
}

/* ---------- Production board ---------- */

/** One job on the board: a ticket with its spec, who it's for, what it's worth and the next step. */
export function JobCard({ s }: { s: Submission & { file_count?: number } }) {
  const spec = specOf(s);
  const items = (s.details as { items?: unknown[] }).items;
  const next = nextStatus(s.kind, s.status);
  const open = !["shipped", "done"].includes(s.status);
  return (
    <article className="adm-job">
      <Link href={`/admin/${s.ref}`} className="adm-job-link">
        <span className="adm-job-top">
          <span className="adm-job-ref">{s.ref}</span>
          <Due date={spec.needed_by} open={open} />
        </span>
        <span className="adm-job-spec">
          <SpecGlyph shape={spec.shape} finish={spec.finish} size={36} />
          <span>
            <b>
              {Array.isArray(items)
                ? `${items.length} ${items.length === 1 ? "item" : "items"}`
                : `${spec.quantity ? Number(spec.quantity).toLocaleString("en-CA") : "—"} ${spec.product ?? (s.kind === "sample_kit" ? "kit" : "")}`}
            </b>
            <span>{Array.isArray(items) ? s.summary : [spec.size, spec.finish].filter(Boolean).join(" · ") || s.summary}</span>
          </span>
        </span>
        <span className="adm-job-who">
          <span>{s.name || "Name at checkout"}</span>
          <span className="adm-job-amount">{money(s.amount_cents, s.currency)}</span>
        </span>
        {(s.file_count ?? 0) > 0 && <span className="adm-job-file">Artwork attached</span>}
        {(s.details as Record<string, unknown>).artwork === "Design it for me" && <span className="adm-flag">We design it</span>}
      </Link>
      {next && (
        <form action={changeStatus} className="adm-job-next">
          <input type="hidden" name="ref" value={s.ref} />
          <input type="hidden" name="status" value={next} />
          <button type="submit">
            {statusLabel(s.kind, next).replace(/:.*/, "")} <span aria-hidden="true">→</span>
          </button>
        </form>
      )}
    </article>
  );
}

/* ---------- Tables ---------- */

export type Column = "who" | "what" | "spec" | "labels" | "amount" | "status" | "when" | "kind";

/** A list of submissions; each row opens its page. Columns differ by section. */
export function SubmissionTable({
  rows,
  columns,
  empty,
}: {
  rows: (Submission & { file_count?: number })[];
  columns: Column[];
  empty: string;
}) {
  if (!rows.length) return <Empty text={empty} />;
  return (
    <div className="adm-table-wrap">
      <table className="adm-table">
        <thead>
          <tr>
            {columns.includes("who") && <th scope="col">From</th>}
            {columns.includes("kind") && <th scope="col">Type</th>}
            {columns.includes("spec") && <th scope="col">Job</th>}
            {columns.includes("labels") && <th scope="col">Labels</th>}
            {columns.includes("what") && <th scope="col">About</th>}
            {columns.includes("amount") && (
              <th scope="col" className="adm-num">
                Amount
              </th>
            )}
            {columns.includes("status") && <th scope="col">Status</th>}
            {columns.includes("when") && (
              <th scope="col" className="adm-num">
                Received
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const spec = specOf(r);
            const d = r.details as Record<string, unknown>;
            return (
              <tr key={r.id} data-todo={TODO.includes(r.status) || undefined}>
                {columns.includes("who") && (
                  <td>
                    <Link href={`/admin/${r.ref}`} className="adm-row-link">
                      <b>{r.name || "Name at checkout"}</b>
                      <span>{r.company ?? r.email}</span>
                    </Link>
                  </td>
                )}
                {columns.includes("kind") && (
                  <td>
                    <KindMark kind={r.kind} />
                  </td>
                )}
                {columns.includes("spec") && (
                  <td>
                    <span className="adm-cell-spec">
                      <SpecGlyph shape={spec.shape} finish={spec.finish} size={26} />
                      <span>
                        {spec.quantity ? `${Number(spec.quantity).toLocaleString("en-CA")} × ` : ""}
                        {[spec.shape, spec.size, spec.finish].filter(Boolean).join(", ") || r.summary}
                        {(r.file_count ?? 0) > 0 && <small> · artwork</small>}
                      </span>
                    </span>
                  </td>
                )}
                {columns.includes("labels") && (
                  <td>
                    <span className="adm-chips">
                      {(Array.isArray(d.labels) ? (d.labels as string[]) : []).map((l) => (
                        <span key={l} className="adm-chip">
                          {l}
                        </span>
                      ))}
                      {d.how_many ? <span className="adm-chip adm-chip-soft">{String(d.how_many)}</span> : null}
                    </span>
                  </td>
                )}
                {columns.includes("what") && (
                  <td className="adm-cell-what">
                    {typeof d.topic === "string" && <b>{d.topic}: </b>}
                    {typeof d.message === "string" ? d.message.slice(0, 140) : r.summary}
                  </td>
                )}
                {columns.includes("amount") && <td className="adm-num adm-strong">{money(r.amount_cents, r.currency)}</td>}
                {columns.includes("status") && (
                  <td>
                    <StatusMark kind={r.kind} status={r.status} />
                  </td>
                )}
                {columns.includes("when") && (
                  <td className="adm-num adm-muted">
                    <span className="adm-when">
                      <time dateTime={r.created_at.toISOString()}>{ago(r.created_at)}</time>
                      <small>{r.ref}</small>
                    </span>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <div className="adm-empty">
      <SpecGlyph shape="die-cut" finish="matte" size={44} />
      <p>{text}</p>
    </div>
  );
}

/** Filter chips for a list: each a link that keeps the section and sets ?status. */
export function Filters({
  base,
  current,
  options,
}: {
  base: string;
  current: string;
  options: { id: string; label: string; n?: number }[];
}) {
  return (
    <nav className="adm-filters" aria-label="Filter">
      {options.map((o) => (
        <Link key={o.id} href={o.id ? `${base}?status=${o.id}` : base} className="adm-filter" aria-current={current === o.id ? "true" : undefined}>
          {o.label}
          {o.n !== undefined && <span>{o.n}</span>}
        </Link>
      ))}
    </nav>
  );
}

/* ---------- Chart ---------- */

/**
 * Paid orders per day: one series, thin bars on a quiet baseline, a tooltip on hover or focus for
 * each day, and the same numbers as a table for screen readers.
 */
export function DayBars({ days, label }: { days: { day: string; n: number }[]; label: string }) {
  const max = Math.max(1, ...days.map((d) => d.n));
  const fmt = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
  const total = days.reduce((a, d) => a + d.n, 0);
  return (
    <figure className="adm-bars">
      <div className="adm-bars-plot" aria-hidden="true">
        <span className="adm-bars-max">{max}</span>
        {days.map((d, i) => (
          <span key={d.day} className="adm-bar" data-today={i === days.length - 1 || undefined}>
            <i style={{ height: d.n ? `${Math.max(4, (d.n / max) * 100)}%` : 0 }} />
            <span className="adm-tip">
              <b>{d.n}</b> {d.n === 1 ? "order" : "orders"} · {fmt(d.day)}
            </span>
          </span>
        ))}
      </div>
      <figcaption className="adm-bars-axis" aria-hidden="true">
        <span>{fmt(days[0]?.day ?? "")}</span>
        <span>Today</span>
      </figcaption>
      <table className="sr-only">
        <caption>
          {label}: {total} in {days.length} days
        </caption>
        <tbody>
          {days.map((d) => (
            <tr key={d.day}>
              <th scope="row">{fmt(d.day)}</th>
              <td>{d.n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
