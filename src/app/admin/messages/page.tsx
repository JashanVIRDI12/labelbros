import { Suspense } from "react";
import { SectionList } from "../Section";

type Search = Promise<{ status?: string }>;

export default function MessagesPage({ searchParams }: { searchParams: Search }) {
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
      id="messages"
      kind="contact"
      title="Messages"
      lead="From the contact page."
      columns={["who", "what", "status", "when"]}
      empty="No messages yet."
      status={status}
    />
  );
}
