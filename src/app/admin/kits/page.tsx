import { Suspense } from "react";
import { SectionList } from "../Section";

type Search = Promise<{ status?: string }>;

export default function SamplekitsPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<p className="adm-loading">Loading…</p>}>
      <List searchParams={searchParams} />
    </Suspense>
  );
}

async function List({ searchParams }: { searchParams: Search }) {
  const { status } = await searchParams;
  return (
    <SectionList
      id="kits"
      kind="sample_kit"
      title="Sample kits"
      lead="Paid kits to pack and send."
      columns={["who", "amount", "status", "when"]}
      empty="No sample kits yet."
      status={status}
    />
  );
}
