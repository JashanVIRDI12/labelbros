import { Suspense } from "react";
import { SectionList } from "../Section";

type Search = Promise<{ status?: string }>;

export default function BusinessleadsPage({ searchParams }: { searchParams: Search }) {
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
      id="leads"
      kind="business"
      title="Business leads"
      lead="Enquiries from the business labels page."
      columns={["who", "labels", "what", "status", "when"]}
      empty="No business enquiries yet."
      status={status}
    />
  );
}
