import "server-only";
import { db, json } from "./db";
import { newRef } from "./security";

/*
 * Orders, quotes and messages: one inbox. Every change is written to the submission's history
 * (events), so the admin page can show who did what and when.
 */

export type Kind = "order" | "sample_kit" | "quote" | "contact" | "business";

export const KIND_LABEL: Record<Kind, string> = {
  order: "Order",
  sample_kit: "Sample kit",
  quote: "Quote",
  contact: "Message",
  business: "Business",
};

/** The steps each kind goes through, in order; the first is where it starts. */
export const STATUSES: Record<Kind, { id: string; label: string }[]> = {
  order: [
    { id: "pending_payment", label: "Awaiting payment" },
    { id: "paid", label: "Paid: send proof" },
    { id: "proof_sent", label: "Proof sent" },
    { id: "approved", label: "Proof approved" },
    { id: "printing", label: "Printing" },
    { id: "shipped", label: "Shipped" },
    { id: "done", label: "Done" },
    { id: "cancelled", label: "Cancelled" },
    { id: "refunded", label: "Refunded" },
    { id: "abandoned", label: "Checkout abandoned" },
  ],
  sample_kit: [
    { id: "pending_payment", label: "Awaiting payment" },
    { id: "paid", label: "Paid: pack it" },
    { id: "shipped", label: "Shipped" },
    { id: "done", label: "Done" },
    { id: "refunded", label: "Refunded" },
    { id: "abandoned", label: "Checkout abandoned" },
  ],
  quote: [
    { id: "new", label: "New" },
    { id: "replied", label: "Replied" },
    { id: "won", label: "Became an order" },
    { id: "closed", label: "Closed" },
  ],
  contact: [
    { id: "new", label: "New" },
    { id: "replied", label: "Replied" },
    { id: "closed", label: "Closed" },
  ],
  business: [
    { id: "new", label: "New" },
    { id: "replied", label: "Replied" },
    { id: "won", label: "Became a customer" },
    { id: "closed", label: "Closed" },
  ],
};

/** Statuses that need someone to act: shown first and counted on the inbox. */
export const TODO = ["paid", "new", "approved"];

export const statusLabel = (kind: Kind, status: string) =>
  STATUSES[kind].find((s) => s.id === status)?.label ?? status;

export type Submission = {
  id: string;
  ref: string;
  kind: Kind;
  status: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  summary: string;
  details: Record<string, unknown>;
  amount_cents: number | null;
  currency: string;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  paid_at: Date | null;
  shipping: Record<string, unknown> | null;
  notes: string;
  created_at: Date;
  updated_at: Date;
};

type New = {
  kind: Kind;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  summary: string;
  details: Record<string, unknown>;
  amountCents?: number;
  currency?: "cad" | "usd";
  ipHash?: string;
  file?: { name: string; bytes: Uint8Array };
  files?: { name: string; bytes: Uint8Array }[];
};

/** Save a new submission (and its file) and return it: one statement, so one round trip. */
export async function createSubmission(n: New): Promise<Submission> {
  const sql = await db();
  const status = STATUSES[n.kind][0].id;
  for (let attempt = 0; ; attempt++) {
    const ref = newRef();
    try {
      const [row] = await sql<Submission[]>`
        with s as (
          insert into submissions (ref, kind, status, name, email, phone, company, summary, details, amount_cents, currency, ip_hash)
          values (${ref}, ${n.kind}, ${status}, ${n.name}, ${n.email}, ${n.phone ?? null}, ${n.company ?? null},
                  ${n.summary}, ${json(n.details)}::text::jsonb, ${n.amountCents ?? null}, ${n.currency ?? "cad"}, ${n.ipHash ?? null})
          returning *
        ),
        e as (insert into events (submission_id, actor, action) select s.id, 'customer', 'created' from s)
        select * from s`;
      // the files go in with the row's id: one more statement, only when there are files
      const files = n.files ?? (n.file ? [n.file] : []);
      if (files.length)
        await sql`
          insert into files ${sql(
            files.map((f) => ({ submission_id: row.id, name: f.name, size: f.bytes.byteLength, bytes: Buffer.from(f.bytes) })),
            "submission_id",
            "name",
            "size",
            "bytes",
          )}`;
      return row;
    } catch (err) {
      // a reference that already exists: draw another (rare)
      if (attempt < 3 && (err as { code?: string }).code === "23505") continue;
      throw err;
    }
  }
}

export async function getByRef(ref: string) {
  const sql = await db();
  const [row] = await sql<Submission[]>`select * from submissions where ref = ${ref}`;
  return row ?? null;
}

export async function getBySession(sessionId: string) {
  const sql = await db();
  const [row] = await sql<Submission[]>`select * from submissions where stripe_session_id = ${sessionId}`;
  return row ?? null;
}

export async function setSession(id: string, sessionId: string) {
  const sql = await db();
  await sql`update submissions set stripe_session_id = ${sessionId}, updated_at = now() where id = ${id}`;
}


/**
 * Mark a checkout paid. Only moves an order that is still waiting, so a repeat (the webhook
 * and the thank-you page both call it) changes nothing. Returns the row if this call paid it.
 */
export async function markPaid(
  sessionId: string,
  p: {
    paymentIntent: string | null;
    amountCents: number | null;
    shipping: unknown;
    phone: string | null;
    name: string | null;
    email: string | null;
  },
) {
  const sql = await db();
  // the sample kit has no name or email until Stripe collects them
  const [row] = await sql<Submission[]>`
    with u as (
      update submissions set
        status = 'paid', paid_at = now(), updated_at = now(),
        stripe_payment_intent = ${p.paymentIntent},
        amount_cents = coalesce(${p.amountCents}::int, amount_cents),
        shipping = ${json(p.shipping)}::text::jsonb,
        phone = coalesce(phone, ${p.phone}::text),
        name = case when name = '' then coalesce(${p.name}::text, '') else name end,
        email = case when email = '' then lower(coalesce(${p.email}::text, '')) else email end
      where stripe_session_id = ${sessionId} and status in ('pending_payment', 'abandoned')
      returning *
    ),
    e as (
      insert into events (submission_id, actor, action, detail)
      select id, 'stripe', 'paid', case when amount_cents is null then '' else '$' || to_char(amount_cents / 100.0, 'FM999999990.00') || ' ' || upper(currency) end
      from u
    )
    select * from u`;
  return row ?? null;
}

export async function markAbandoned(sessionId: string) {
  const sql = await db();
  await sql`
    with u as (
      update submissions set status = 'abandoned', updated_at = now()
      where stripe_session_id = ${sessionId} and status = 'pending_payment' returning id
    )
    insert into events (submission_id, actor, action) select id, 'stripe', 'checkout expired' from u`;
}

export async function markRefunded(paymentIntent: string, amount: string) {
  const sql = await db();
  await sql`
    with u as (
      update submissions set status = 'refunded', updated_at = now()
      where stripe_payment_intent = ${paymentIntent} returning id
    )
    insert into events (submission_id, actor, action, detail) select id, 'stripe', 'refunded', ${amount} from u`;
}

/** The usual next step for each status (the admin's one-click button). */
export const NEXT: Partial<Record<Kind, Record<string, string>>> = {
  order: { paid: "proof_sent", proof_sent: "approved", approved: "printing", printing: "shipped", shipped: "done" },
  sample_kit: { paid: "shipped", shipped: "done" },
  quote: { new: "replied", replied: "won" },
  business: { new: "replied", replied: "won" },
  contact: { new: "replied", replied: "closed" },
};
export const nextStatus = (kind: Kind, status: string) => NEXT[kind]?.[status];

/** The production line, in order: the board's columns. */
export const LINE = ["paid", "proof_sent", "approved", "printing", "shipped"] as const;

/** Statuses that end a job early (shown apart from the steps). */
export const OFF_LINE = ["cancelled", "refunded", "abandoned", "closed"];

export type ListFilter = { kind?: Kind; kinds?: Kind[]; status?: string; statuses?: string[]; q?: string; todo?: boolean };

/** The inbox list, newest first (things to do first when asked). */
export async function listSubmissions(f: ListFilter, limit = 100) {
  const sql = await db();
  const q = f.q?.trim();
  const like = q ? `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%` : null;
  return sql<(Submission & { file_count: number })[]>`
    select s.*, (select count(*)::int from files where submission_id = s.id) as file_count
    from submissions s
    where true
      ${f.kind ? sql`and s.kind = ${f.kind}` : sql``}
      ${f.kinds ? sql`and s.kind = any(${f.kinds}::text[])` : sql``}
      ${f.status ? sql`and s.status = ${f.status}` : sql``}
      ${f.statuses ? sql`and s.status = any(${f.statuses}::text[])` : sql``}
      ${f.todo ? sql`and s.status = any(${TODO}::text[])` : sql``}
      ${like ? sql`and (s.ref ilike ${like} or s.name ilike ${like} or s.email ilike ${like} or coalesce(s.company, '') ilike ${like} or s.summary ilike ${like})` : sql``}
    order by s.created_at desc
    limit ${limit}`;
}

/** Counts for the inbox tabs: everything, and what needs doing. */
export async function counts() {
  const sql = await db();
  const rows = await sql<{ kind: Kind; total: number; todo: number }[]>`
    select kind, count(*)::int as total, count(*) filter (where status = any(${TODO}::text[]))::int as todo
    from submissions group by kind`;
  return rows;
}


/** A submission's files, with their bytes (for the shop's email). */
export async function filesWithBytes(submissionId: string) {
  const sql = await db();
  return sql<{ name: string; bytes: Buffer }[]>`
    select name, bytes from files where submission_id = ${submissionId} order by name`;
}

export async function getFile(id: string) {
  const sql = await db();
  const [row] = await sql<{ name: string; bytes: Buffer }[]>`select name, bytes from files where id = ${id}`;
  return row ?? null;
}


// every status each kind may take, and its label (for the history line), as JSON for SQL
const ALLOWED = json(Object.fromEntries(Object.entries(STATUSES).map(([k, list]) => [k, list.map((x) => x.id)])));
const LABELS = json(Object.fromEntries(Object.entries(STATUSES).map(([k, list]) => [k, Object.fromEntries(list.map((x) => [x.id, x.label]))])));

/** Move a submission to a status its kind allows, with a history line: one round trip. */
export async function setStatus(ref: string, status: string, actor: string) {
  const sql = await db();
  await sql`
    with cur as (select id, kind, status from submissions where ref = ${ref}),
    u as (
      update submissions s set status = ${status}, updated_at = now()
      from cur
      where s.id = cur.id and cur.status <> ${status}
        and (${ALLOWED}::text::jsonb -> cur.kind) @> to_jsonb(${status}::text)
      returning s.id, cur.kind, cur.status as old
    )
    insert into events (submission_id, actor, action, detail)
    select id, ${actor}, 'status',
      coalesce(${LABELS}::text::jsonb -> kind ->> old, old) || ' → ' || coalesce(${LABELS}::text::jsonb -> kind ->> ${status}::text, ${status}::text)
    from u`;
}

export async function setNotes(ref: string, notes: string, actor: string) {
  const sql = await db();
  const text = notes.slice(0, 10000);
  await sql`
    with u as (
      update submissions set notes = ${text}, updated_at = now()
      where ref = ${ref} and notes is distinct from ${text} returning id
    )
    insert into events (submission_id, actor, action) select id, ${actor}, 'notes updated' from u`;
}

export type JobFile = { id: string; name: string; size: number; created_at: Date };
export type JobEvent = { id: string; actor: string; action: string; detail: string; at: Date };

/** A submission with its files and history, in one query (for its admin page). */
export async function getJob(ref: string) {
  const sql = await db();
  const [row] = await sql<(Submission & { files: JobFile[]; events: JobEvent[] })[]>`
    select s.*,
      coalesce((select json_agg(json_build_object('id', f.id, 'name', f.name, 'size', f.size, 'created_at', f.created_at) order by f.created_at)
                from files f where f.submission_id = s.id), '[]'::json) as files,
      coalesce((select json_agg(json_build_object('id', e.id, 'actor', e.actor, 'action', e.action, 'detail', e.detail, 'at', e.at) order by e.at desc)
                from events e where e.submission_id = s.id), '[]'::json) as events
    from submissions s where s.ref = ${ref}`;
  if (!row) return null;
  // dates inside JSON arrive as text
  row.files = row.files.map((f) => ({ ...f, created_at: new Date(f.created_at) }));
  row.events = row.events.map((e) => ({ ...e, id: String(e.id), at: new Date(e.at) }));
  return row;
}

/* ---------- The overview ---------- */

export type Overview = {
  money: { currency: string; month: number; prev: number; paid: number }[];
  byStatus: { kind: Kind; status: string; n: number }[];
  days: { day: string; paid: number; enquiries: number }[];
  overdue: number;
  activity: { id: string; at: Date; actor: string; action: string; detail: string; ref: string; name: string; kind: Kind }[];
};

/** Everything the overview shows, in one round of queries. Days are counted in the shop's time zone. */
export async function overview(tz: string, days = 30): Promise<Overview> {
  const sql = await db();
  const [money, byStatus, daily, [late], activity] = await Promise.all([
    sql<{ currency: string; month: number; prev: number; paid: number }[]>`
      select currency,
        coalesce(sum(amount_cents) filter (where paid_at >= date_trunc('month', now() at time zone ${tz}) at time zone ${tz}), 0)::int as month,
        coalesce(sum(amount_cents) filter (where paid_at >= (date_trunc('month', now() at time zone ${tz}) - interval '1 month') at time zone ${tz}
                                             and paid_at < date_trunc('month', now() at time zone ${tz}) at time zone ${tz}), 0)::int as prev,
        count(*) filter (where paid_at >= date_trunc('month', now() at time zone ${tz}) at time zone ${tz})::int as paid
      from submissions
      where paid_at is not null and status <> 'refunded' and kind in ('order', 'sample_kit')
      group by currency order by currency`,
    sql<{ kind: Kind; status: string; n: number }[]>`
      select kind, status, count(*)::int as n from submissions group by kind, status`,
    sql<{ day: string; paid: number; enquiries: number }[]>`
      select to_char(d, 'YYYY-MM-DD') as day,
        (select count(*)::int from submissions s
          where s.paid_at is not null and s.kind in ('order', 'sample_kit')
            and (s.paid_at at time zone ${tz})::date = d) as paid,
        (select count(*)::int from submissions s
          where s.kind in ('quote', 'business', 'contact')
            and (s.created_at at time zone ${tz})::date = d) as enquiries
      from generate_series((now() at time zone ${tz})::date - (${days}::int - 1), (now() at time zone ${tz})::date, interval '1 day') as g(d)
      order by d`,
    sql<{ n: number }[]>`
      select count(*)::int as n from submissions
      where kind = 'order' and status in ('paid', 'proof_sent', 'approved', 'printing')
        and details->>'needed_by' ~ '^\\d{4}-\\d{2}-\\d{2}$'
        and (details->>'needed_by')::date < (now() at time zone ${tz})::date`,
    sql<Overview["activity"]>`
      select e.id, e.at, e.actor, e.action, e.detail, s.ref, s.name, s.kind
      from events e join submissions s on s.id = e.submission_id
      order by e.at desc limit 10`,
  ]);
  return { money, byStatus, days: daily, overdue: late?.n ?? 0, activity };
}
