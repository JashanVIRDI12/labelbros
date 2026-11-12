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
    { id: "invoice_requested", label: "Invoice requested" },
    { id: "invoiced", label: "Invoice sent" },
    { id: "paid", label: "Paid: check artwork" },
    { id: "proof_sent", label: "Proof sent" },
    { id: "changes", label: "Changes requested" },
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
export const TODO = ["paid", "new", "approved", "invoice_requested", "changes"];

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
  /** where it starts (the kind's first status unless set) */
  status?: string;
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
  const status = n.status && STATUSES[n.kind].some((x) => x.id === n.status) ? n.status : STATUSES[n.kind][0].id;
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

/* ---------- Invoices (business orders paid by invoice) ---------- */

/** The Stripe invoice sent for an order: saved on it, and the order moves to "Invoice sent". */
export async function setInvoice(ref: string, invoice: { id: string; url: string | null; number: string | null; cents: number }, actor: string) {
  const sql = await db();
  const patch = json({ invoice: { id: invoice.id, url: invoice.url, number: invoice.number, cents: invoice.cents } });
  // a proof may already have gone out: the order keeps its place on the line, only a request moves on
  await sql`
    with u as (
      update submissions set details = details || ${patch}::text::jsonb, updated_at = now(),
        status = case when status = 'invoice_requested' then 'invoiced' else status end
      where ref = ${ref} and kind = 'order' and paid_at is null and details->>'payment' = 'invoice' and details->'invoice' is null
      returning id
    )
    insert into events (submission_id, actor, action, detail) select id, ${actor}, 'invoice sent', ${invoice.number ?? invoice.id} from u`;
}

/** An invoice Stripe says is paid: the order is paid (once). Returns the row if this call paid it. */
export async function markInvoicePaid(ref: string, invoiceId: string, cents: number, currency: string) {
  const sql = await db();
  const [row] = await sql<Submission[]>`
    with u as (
      update submissions set paid_at = now(), updated_at = now(), amount_cents = ${cents},
        status = case when status in ('invoice_requested', 'invoiced') then 'paid' else status end
      where ref = ${ref} and kind = 'order' and paid_at is null
        and details->'invoice'->>'id' = ${invoiceId}
      returning *
    ),
    e as (
      insert into events (submission_id, actor, action, detail)
      select id, 'stripe', 'invoice paid', '$' || to_char(${cents}::int / 100.0, 'FM999999990.00') || ' ' || upper(${currency}::text) from u
    )
    select * from u`;
  return row ?? null;
}

/* ---------- Proofs ---------- */

export type Proof = {
  id: string;
  submission_id: string;
  token: string;
  version: number;
  name: string;
  mime: string;
  size: number;
  message: string;
  status: "sent" | "approved" | "changes" | "replaced";
  comment: string;
  created_at: Date;
  decided_at: Date | null;
};

/** Save a new proof for an order (earlier open ones are replaced) and move the order to "Proof sent". */
export async function createProof(ref: string, p: { token: string; name: string; mime: string; bytes: Uint8Array; message: string }, actor: string) {
  const sql = await db();
  return sql.begin(async (tx) => {
    const [s] = await tx<{ id: string }[]>`select id from submissions where ref = ${ref} and kind = 'order' for update`;
    if (!s) return null;
    await tx`update proofs set status = 'replaced' where submission_id = ${s.id} and status = 'sent'`;
    const [{ v }] = await tx<{ v: number }[]>`select coalesce(max(version), 0) + 1 as v from proofs where submission_id = ${s.id}`;
    const [proof] = await tx<Proof[]>`
      insert into proofs (submission_id, token, version, name, mime, size, bytes, message)
      values (${s.id}, ${p.token}, ${v}, ${p.name}, ${p.mime}, ${p.bytes.byteLength}, ${Buffer.from(p.bytes)}, ${p.message})
      returning id, submission_id, token, version, name, mime, size, message, status, comment, created_at, decided_at`;
    await tx`update submissions set status = 'proof_sent', updated_at = now() where id = ${s.id}`;
    await tx`insert into events (submission_id, actor, action, detail) values (${s.id}, ${actor}, 'proof sent', ${`Proof ${v}`})`;
    return proof;
  });
}

/** A proof and its order, by the customer's private link. */
export async function getProof(token: string) {
  const sql = await db();
  const [row] = await sql<(Proof & { ref: string; order_status: string; summary: string; details: Record<string, unknown>; name_on_order: string; latest: number; paid_at: Date | null })[]>`
    select p.id, p.submission_id, p.token, p.version, p.name, p.mime, p.size, p.message, p.status, p.comment, p.created_at, p.decided_at,
      s.ref, s.status as order_status, s.summary, s.details, s.name as name_on_order, s.paid_at,
      (select max(version) from proofs where submission_id = p.submission_id)::int as latest
    from proofs p join submissions s on s.id = p.submission_id
    where p.token = ${token}`;
  return row ?? null;
}

export async function getProofFile(token: string) {
  const sql = await db();
  const [row] = await sql<{ name: string; mime: string; bytes: Buffer }[]>`select name, mime, bytes from proofs where token = ${token}`;
  return row ?? null;
}

export async function getProofFileById(id: string) {
  const sql = await db();
  const [row] = await sql<{ name: string; mime: string; bytes: Buffer }[]>`select name, mime, bytes from proofs where id = ${id}`;
  return row ?? null;
}

/** An order's proofs, newest first (for its admin page). */
export async function listProofs(submissionId: string) {
  const sql = await db();
  return sql<Proof[]>`
    select id, submission_id, token, version, name, mime, size, message, status, comment, created_at, decided_at
    from proofs where submission_id = ${submissionId} order by version desc`;
}

/**
 * The customer's answer to a proof: approved (the order moves to "Proof approved") or changes
 * (back to "Changes requested", with what they want). Only an open proof can be answered, once.
 */
export async function decideProof(token: string, decision: "approved" | "changes", comment: string) {
  const sql = await db();
  const [row] = await sql<{ ref: string; version: number }[]>`
    with p as (
      update proofs set status = ${decision}, comment = ${comment.slice(0, 4000)}, decided_at = now()
      where token = ${token} and status = 'sent'
      returning submission_id, version
    ),
    s as (
      update submissions set status = ${decision === "approved" ? "approved" : "changes"}, updated_at = now()
      from p where submissions.id = p.submission_id and submissions.status in ('proof_sent', 'paid', 'changes', 'invoiced', 'invoice_requested')
      returning submissions.id, submissions.ref
    ),
    e as (
      insert into events (submission_id, actor, action, detail)
      select p.submission_id, 'customer', ${decision === "approved" ? "approved proof" : "asked for changes"}, 'Proof ' || p.version || case when ${comment} = '' then '' else ': ' || ${comment.slice(0, 300)} end
      from p
    )
    select (select ref from submissions where id = p.submission_id) as ref, p.version from p`;
  return row ?? null;
}

/** The usual next step for each status (the admin's one-click button). */
export const NEXT: Partial<Record<Kind, Record<string, string>>> = {
  order: { paid: "proof_sent", changes: "proof_sent", proof_sent: "approved", approved: "printing", printing: "shipped", shipped: "done" },
  sample_kit: { paid: "shipped", shipped: "done" },
  quote: { new: "replied", replied: "won" },
  business: { new: "replied", replied: "won" },
  contact: { new: "replied", replied: "closed" },
};
export const nextStatus = (kind: Kind, status: string) => NEXT[kind]?.[status];

/** The production line, in order: the board's columns. */
export const LINE = ["invoice_requested", "paid", "proof_sent", "approved", "printing", "shipped"] as const;
/** Statuses shown in another column of the board: invoiced orders wait with the requests, changes go back to "check artwork". */
export const COLUMN_OF: Record<string, (typeof LINE)[number]> = { invoiced: "invoice_requested", changes: "paid" };

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

/** A line in a submission's history. */
export async function addEvent(submissionId: string, actor: string, action: string, detail = "") {
  const sql = await db();
  await sql`insert into events (submission_id, actor, action, detail) values (${submissionId}, ${actor}, ${action}, ${detail})`;
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
