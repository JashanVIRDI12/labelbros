import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/server/auth";
import { ready } from "@/server/env";
import { COLUMN_OF, LINE, STATUSES, counts, listSubmissions, statusLabel } from "@/server/inbox";
import { daysAgo } from "../format";
import { AdminShell, Empty, Filters, JobCard, SubmissionTable } from "../ui";

/*
 * Orders: the production board (one column per stage, each job a ticket with a one-click next
 * step) or the full list with a filter per status.
 */

type Search = Promise<{ view?: string; status?: string }>;

export default function OrdersPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<p className="adm-loading">Loading…</p>}>
      <Orders searchParams={searchParams} />
    </Suspense>
  );
}

const COLUMN_NOTE: Record<string, string> = {
  invoice_requested: "Business orders: check the artwork, send the invoice",
  paid: "Check the artwork, send a proof (and changes asked for)",
  proof_sent: "Waiting on the customer",
  approved: "Ready to print",
  printing: "On the press",
  shipped: "Out the door",
};

async function Orders({ searchParams }: { searchParams: Search }) {
  await requireAdmin();
  const { view: v, status: st } = await searchParams;
  const list = v === "list" || Boolean(st);
  const status = STATUSES.order.some((s) => s.id === st) ? st! : "";

  const toggle = (
    <div className="adm-toggle" role="group" aria-label="View">
      <Link href="/admin/orders" aria-current={!list ? "true" : undefined}>
        Board
      </Link>
      <Link href="/admin/orders?view=list" aria-current={list ? "true" : undefined}>
        List
      </Link>
    </div>
  );

  if (!ready.db())
    return (
      <AdminShell current="orders" title="Orders">
        <Empty text="Connect the database to see orders." />
      </AdminShell>
    );

  if (list) {
    const [rows, tally] = await Promise.all([listSubmissions({ kind: "order", status: status || undefined }, 300), counts()]);
    return (
      <AdminShell tally={tally} current="orders" title="Orders" lead="Every order, newest first." actions={toggle}>
        <Filters
          base="/admin/orders"
          current={status}
          options={[{ id: "", label: "All" }, ...STATUSES.order.map((s) => ({ id: s.id, label: s.label }))]}
        />
        <SubmissionTable rows={rows} columns={["who", "spec", "amount", "status", "when"]} empty="No orders here yet." />
      </AdminShell>
    );
  }

  const [rows, tally] = await Promise.all([listSubmissions({ kind: "order", statuses: [...LINE, ...Object.keys(COLUMN_OF)] }, 400), counts()]);
  const recent = daysAgo(14); // shipped jobs stay on the board for two weeks
  const columns = LINE.map((st) => ({
    st,
    jobs: rows
      .filter((r) => (COLUMN_OF[r.status] ?? r.status) === st && (st !== "shipped" || r.updated_at.getTime() > recent))
      // oldest first: the job that has waited longest is on top
      .sort((a, b) => (a.paid_at ?? a.created_at).getTime() - (b.paid_at ?? b.created_at).getTime()),
  }));

  return (
    <AdminShell tally={tally} current="orders" title="Orders" lead="Orders move left to right. The longest-waiting job is on top; business invoices start in the first column." actions={toggle}>
      <div className="adm-board">
        {columns.map((c) => (
          <section key={c.st} className="adm-col" data-status={c.st} aria-labelledby={`col-${c.st}`}>
            <header className="adm-col-head">
              <h2 id={`col-${c.st}`}>
                {statusLabel("order", c.st).replace("Paid: s", "S")}
                <span>{c.jobs.length}</span>
              </h2>
              <p>{COLUMN_NOTE[c.st]}</p>
            </header>
            <div className="adm-col-jobs">
              {c.jobs.length ? c.jobs.map((s) => <JobCard key={s.id} s={s} />) : <p className="adm-col-empty">Nothing here</p>}
            </div>
          </section>
        ))}
      </div>
    </AdminShell>
  );
}
