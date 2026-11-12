import { Suspense } from "react";
import { requireAdmin } from "@/server/auth";
import { ready } from "@/server/env";
import { listSubscribers } from "@/server/subscribers";
import { ago } from "../format";
import { AdminShell, Empty } from "../ui";

/** Email sign-ups from the footer: who said yes, to what, where and when, and who left. */
export default function SubscribersPage() {
  return (
    <Suspense fallback={<p className="adm-loading">Loading…</p>}>
      <List />
    </Suspense>
  );
}

async function List() {
  await requireAdmin();
  if (!ready.db())
    return (
      <AdminShell current="subscribers" title="Email list">
        <Empty text="Connect the database to see this list." />
      </AdminShell>
    );
  const rows = await listSubscribers();
  const active = rows.filter((r) => !r.unsubscribed_at);
  return (
    <AdminShell
      current="subscribers"
      title="Email list"
      lead={`${active.length} subscribed${rows.length > active.length ? `, ${rows.length - active.length} left` : ""}. Each one ticked the consent box (CASL); email only these addresses, and include the unsubscribe link.`}
    >
      {rows.length === 0 ? (
        <Empty text="No sign-ups yet. They come from the form at the bottom of every page." />
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Email</th>
                <th scope="col">Signed up</th>
                <th scope="col">Where</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <a href={`mailto:${r.email}`}>{r.email}</a>
                  </td>
                  <td title={r.consented_at.toISOString()}>{ago(r.consented_at)}</td>
                  <td>{r.source || "—"}</td>
                  <td>{r.unsubscribed_at ? `Left ${ago(r.unsubscribed_at)}` : "Subscribed"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
