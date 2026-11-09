import { Suspense } from "react";
import { SectionList } from "../Section";

type Search = Promise<{ status?: string }>;

export default function QuotesPage({ searchParams }: { searchParams: Search }) {
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
      id="quotes"
      kind="quote"
      title="Quotes"
      lead="Quotes sent without paying: check them and reply with a proof or a price."
      columns={["who", "spec", "amount", "status", "when"]}
      empty="No quotes yet."
      status={status}
    />
  );
}
