import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/server/auth";
import { ready } from "@/server/env";
import { counts, listSubmissions } from "@/server/inbox";
import { AdminShell, Empty, SubmissionTable } from "../ui";

/** Everything, newest first: search results from the top bar, or only what needs doing. */
type Search = Promise<{ q?: string; todo?: string }>;

export default function AllPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<p className="adm-loading">Loading…</p>}>
      <All searchParams={searchParams} />
    </Suspense>
  );
}

async function All({ searchParams }: { searchParams: Search }) {
  await requireAdmin();
  const { q: rawQ, todo: rawTodo } = await searchParams;
  const q = (rawQ ?? "").trim().slice(0, 100);
  const todo = rawTodo === "1" && !q;
  if (!ready.db())
    return (
      <AdminShell current="all" title="Everything">
        <Empty text="Connect the database to search." />
      </AdminShell>
    );
  const [rows, tally] = await Promise.all([listSubmissions({ q: q || undefined, todo }, 300), counts()]);
  const title = q ? `Results for “${q}”` : todo ? "Needs you" : "Everything";
  return (
    <AdminShell
      tally={tally}
      current="all"
      title={title}
      lead={q ? `${rows.length} found across orders, kits, quotes, leads and messages.` : todo ? "Paid orders to proof, approved jobs to print and new enquiries." : "Every order, kit, quote, lead and message."}
    >
      <nav className="adm-filters" aria-label="Filter">
        <Link href="/admin/all" className="adm-filter" aria-current={!q && !todo ? "true" : undefined}>
          Everything
        </Link>
        <Link href="/admin/all?todo=1" className="adm-filter" aria-current={todo ? "true" : undefined}>
          Needs you
        </Link>
      </nav>
      <SubmissionTable rows={rows} columns={["who", "kind", "what", "amount", "status", "when"]} empty={q ? `Nothing matches “${q}”.` : "Nothing here yet."} />
    </AdminShell>
  );
}
