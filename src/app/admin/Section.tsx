import { requireAdmin } from "@/server/auth";
import { ready } from "@/server/env";
import { STATUSES, counts, listSubmissions, type Kind } from "@/server/inbox";
import { AdminShell, Empty, Filters, SubmissionTable, type Column, type Section as Id } from "./ui";

/** A list section (kits, quotes, leads, messages): status filters over a table of its own columns. */
export async function SectionList({
  id,
  kind,
  title,
  lead,
  columns,
  empty,
  status: raw,
}: {
  id: Id;
  kind: Kind;
  title: string;
  lead: string;
  columns: Column[];
  empty: string;
  status?: string;
}) {
  await requireAdmin();
  const status = STATUSES[kind].some((s) => s.id === raw) ? raw! : "";
  if (!ready.db())
    return (
      <AdminShell current={id} title={title}>
        <Empty text="Connect the database to see this list." />
      </AdminShell>
    );
  const [rows, tally] = await Promise.all([listSubmissions({ kind, status: status || undefined }, 300), counts()]);
  return (
    <AdminShell tally={tally} current={id} title={title} lead={lead}>
      <Filters
        base={`/admin/${id}`}
        current={status}
        options={[{ id: "", label: "All" }, ...STATUSES[kind].map((s) => ({ id: s.id, label: s.label }))]}
      />
      <SubmissionTable rows={rows} columns={columns} empty={empty} />
    </AdminShell>
  );
}
