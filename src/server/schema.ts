/*
 * The database tables. Every statement is "if not exists", so running it again is safe: the
 * app runs it on first use, and `pnpm db:setup` runs it ahead of time.
 *   submissions   orders, sample kits, quotes, contact and business messages (one inbox)
 *   files         customer artwork, kept with its submission
 *   events        the history of every change
 *   stripe_events webhook events already handled (so none is handled twice)
 *   rate_hits     recent requests per visitor, for rate limits
<<<<<<< Updated upstream
=======
 *   subscribers   email sign-ups, with the consent each one gave (CASL) and when they left
 *   proofs        the proofs we send for an order: the file, a private link for the customer,
 *                 and what they said (approved, or the changes they want)
>>>>>>> Stashed changes
 */
export const SCHEMA = /* sql */ `
create table if not exists submissions (
  id            uuid primary key default gen_random_uuid(),
  ref           text not null unique,
  kind          text not null check (kind in ('order','sample_kit','quote','contact','business')),
  status        text not null,
  name          text not null,
  email         text not null,
  phone         text,
  company       text,
  summary       text not null default '',
  details       jsonb not null default '{}'::jsonb,
  amount_cents  integer,
  currency      text not null default 'cad',
  stripe_session_id  text unique,
  stripe_payment_intent text,
  paid_at       timestamptz,
  shipping      jsonb,
  notes         text not null default '',
  ip_hash       text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists submissions_kind_created on submissions (kind, created_at desc);
create index if not exists submissions_status on submissions (status);
create index if not exists submissions_email on submissions (lower(email));
create index if not exists submissions_payment_intent on submissions (stripe_payment_intent);

create table if not exists files (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  name          text not null,
  size          integer not null,
  bytes         bytea not null,
  created_at    timestamptz not null default now()
);
create index if not exists files_submission on files (submission_id);

create table if not exists events (
  id            bigserial primary key,
  submission_id uuid not null references submissions(id) on delete cascade,
  actor         text not null,
  action        text not null,
  detail        text not null default '',
  at            timestamptz not null default now()
);
create index if not exists events_submission on events (submission_id, at);

create table if not exists stripe_events (
  id            text primary key,
  type          text not null,
  at            timestamptz not null default now()
);

create table if not exists rate_hits (
  bucket        text not null,
  at            timestamptz not null default now()
);
create index if not exists rate_hits_bucket_at on rate_hits (bucket, at);
<<<<<<< Updated upstream
=======

create table if not exists subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  consent_text  text not null,
  source        text not null default '',
  ip_hash       text,
  token         text not null unique,
  consented_at  timestamptz not null default now(),
  unsubscribed_at timestamptz
);
create unique index if not exists subscribers_email on subscribers (lower(email));

create table if not exists proofs (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  token         text not null unique,
  version       integer not null,
  name          text not null,
  mime          text not null,
  size          integer not null,
  bytes         bytea not null,
  message       text not null default '',
  status        text not null default 'sent' check (status in ('sent','approved','changes','replaced')),
  comment       text not null default '',
  created_at    timestamptz not null default now(),
  decided_at    timestamptz
);
create index if not exists proofs_submission on proofs (submission_id, version);
>>>>>>> Stashed changes
`;
