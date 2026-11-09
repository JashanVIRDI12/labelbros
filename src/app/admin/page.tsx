import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/server/auth";
import { ready } from "@/server/env";
import { LINE, TODO, counts, listSubmissions, overview } from "@/server/inbox";
import { amount, dateTime, money } from "./format";
import { AdminShell, DayBars, Empty, KindMark, StatusMark } from "./ui";

/*
 * Overview: the shop at a glance. Money in this month (each currency on its own, never added
 * together), what is waiting on the shop, the production line stage by stage, paid orders over
 * the last 30 days, the to-do list and the latest activity.
 */

const TZ = process.env.SHOP_TIMEZONE || "America/Vancouver";

const LINE_LABEL: Record<string, string> = {
  paid: "Send proof",
  proof_sent: "Proof sent",
  approved: "Approved",
  printing: "Printing",
  shipped: "Shipped",
};

export default function OverviewPage() {
  return (
    <Suspense fallback={<p className="adm-loading">Loading…</p>}>
      <Overview />
    </Suspense>
  );
}

function greeting() {
  const h = Number(new Date().toLocaleString("en-CA", { hour: "numeric", hour12: false, timeZone: TZ }));
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

async function Overview() {
  await requireAdmin();
  if (!ready.db())
    return (
      <AdminShell current="overview" title="Overview">
        <Empty text="Connect the database (DATABASE_URL) to see orders here." />
      </AdminShell>
    );

  const [o, todo, tally] = await Promise.all([overview(TZ), listSubmissions({ todo: true }, 8), counts()]);
  const n = (kind: string, statuses: string[]) =>
    o.byStatus.filter((r) => r.kind === kind && statuses.includes(r.status)).reduce((a, r) => a + r.n, 0);

  const toProof = n("order", ["paid"]);
  const inProduction = n("order", ["approved", "printing"]);
  const kitsToPack = n("sample_kit", ["paid"]);
  const newEnquiries = n("quote", ["new"]) + n("business", ["new"]) + n("contact", ["new"]);
  const paidDays = o.days.map((d) => ({ day: d.day, n: d.paid }));
  const paid30 = paidDays.reduce((a, d) => a + d.n, 0);
  const month = new Date().toLocaleDateString("en-CA", { month: "long", timeZone: TZ });
  const moneyRows = o.money.length ? o.money : [{ currency: "cad", month: 0, prev: 0, paid: 0 }];

  return (
    <AdminShell
      tally={tally}
      current="overview"
      title={greeting()}
      lead={new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric", timeZone: TZ })}
    >
      {/* the numbers that matter today */}
      <section className="adm-tiles" aria-label="Today">
        <div className="adm-tile adm-tile-money">
          <p className="adm-tile-label">Paid in {month}</p>
          {moneyRows.map((m) => (
            <p key={m.currency} className="adm-tile-value">
              {amount(m.month, m.currency)}
              <span className="adm-cur">{m.currency.toUpperCase()}</span>
            </p>
          ))}
          <p className="adm-tile-note">
            {moneyRows.reduce((a, m) => a + m.paid, 0)} paid orders and kits
            {moneyRows.some((m) => m.prev)
              ? ` · last month ${moneyRows
                  .filter((m) => m.prev)
                  .map((m) => money(m.prev, m.currency))
                  .join(" + ")}`
              : ""}
          </p>
        </div>
        <Link href="/admin/orders" className="adm-tile" data-hot={toProof > 0 || undefined}>
          <p className="adm-tile-label">Proofs to send</p>
          <p className="adm-tile-value">{toProof}</p>
          <p className="adm-tile-note">{toProof ? "Paid and waiting for a proof" : "All caught up"}</p>
        </Link>
        <Link href="/admin/orders" className="adm-tile">
          <p className="adm-tile-label">In production</p>
          <p className="adm-tile-value">{inProduction}</p>
          <p className="adm-tile-note">
            {o.overdue ? <span className="adm-late">{o.overdue} past their date</span> : "Approved or printing"}
          </p>
        </Link>
        <Link href="/admin/leads" className="adm-tile" data-hot={newEnquiries > 0 || undefined}>
          <p className="adm-tile-label">New enquiries</p>
          <p className="adm-tile-value">{newEnquiries}</p>
          <p className="adm-tile-note">
            {kitsToPack ? `${kitsToPack} sample ${kitsToPack === 1 ? "kit" : "kits"} to pack too` : "Quotes, leads and messages"}
          </p>
        </Link>
      </section>

      {/* the production line, stage by stage, like labels along a roll */}
      <section className="adm-panel" aria-labelledby="line-title">
        <div className="adm-panel-head">
          <h2 id="line-title">Production line</h2>
          <Link href="/admin/orders" className="adm-link">
            Open the board →
          </Link>
        </div>
        <ol className="adm-line">
          {LINE.map((st, i) => {
            const count = n("order", [st]);
            return (
              <li key={st} data-hot={(TODO.includes(st) && count > 0) || undefined}>
                <Link href={`/admin/orders?status=${st}&view=list`}>
                  <span className="adm-line-step">{i + 1}</span>
                  <span className="adm-line-n">{count}</span>
                  <span className="adm-line-label">{LINE_LABEL[st]}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="adm-split">
        <section className="adm-panel" aria-labelledby="chart-title">
          <div className="adm-panel-head">
            <h2 id="chart-title">Paid orders, last 30 days</h2>
            <span className="adm-muted">{paid30} in total</span>
          </div>
          <DayBars days={paidDays} label="Paid orders per day" />
        </section>

        <section className="adm-panel" aria-labelledby="todo-title">
          <div className="adm-panel-head">
            <h2 id="todo-title">Needs you</h2>
            <Link href="/admin/all?todo=1" className="adm-link">
              All →
            </Link>
          </div>
          {todo.length ? (
            <ul className="adm-todo">
              {todo.map((s) => (
                <li key={s.id}>
                  <Link href={`/admin/${s.ref}`}>
                    <KindMark kind={s.kind} />
                    <span className="adm-todo-main">
                      <b>{s.name || "Name at checkout"}</b>
                      <span>{s.summary}</span>
                    </span>
                    <StatusMark kind={s.kind} status={s.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="Nothing waiting. Nice." />
          )}
        </section>
      </div>

      <section className="adm-panel" aria-labelledby="activity-title">
        <div className="adm-panel-head">
          <h2 id="activity-title">Latest activity</h2>
        </div>
        {o.activity.length ? (
          <ol className="adm-feed">
            {o.activity.map((e) => (
              <li key={e.id}>
                <span className="adm-feed-dot" data-actor={e.actor} aria-hidden="true" />
                <span className="adm-feed-text">
                  <Link href={`/admin/${e.ref}`}>
                    <b>{e.name || e.ref}</b>
                  </Link>{" "}
                  {describe(e.action, e.detail)}
                </span>
                <time dateTime={e.at.toISOString()}>{dateTime(e.at)}</time>
              </li>
            ))}
          </ol>
        ) : (
          <Empty text="No activity yet." />
        )}
      </section>
    </AdminShell>
  );
}

/** An event in plain words. */
function describe(action: string, detail: string) {
  if (action === "created") return "sent it in";
  if (action === "paid") return `paid ${detail}`;
  if (action === "status") return `moved: ${detail}`;
  if (action === "notes updated") return "notes updated";
  if (action === "refunded") return `refunded ${detail}`;
  if (action === "checkout expired") return "left checkout without paying";
  return `${action}${detail ? `: ${detail}` : ""}`;
}
