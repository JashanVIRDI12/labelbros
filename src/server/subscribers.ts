import "server-only";
import { randomBytes } from "node:crypto";
import { SIGNUP_CONSENT } from "@/lib/signup";
import { db } from "./db";

/*
 * Email sign-ups, kept the way Canada's anti-spam law (CASL) asks: the exact words each person
 * agreed to, where and when, and a private link to leave (one click, no sign-in). Signing up
 * again after leaving records the new consent.
 */

export type Subscriber = {
  id: string;
  email: string;
  consent_text: string;
  source: string;
  consented_at: Date;
  unsubscribed_at: Date | null;
};

export async function subscribe(email: string, source: string, ipHash: string) {
  const sql = await db();
  const token = randomBytes(24).toString("base64url");
  await sql`
    insert into subscribers (email, consent_text, source, ip_hash, token)
    values (${email}, ${SIGNUP_CONSENT}, ${source}, ${ipHash}, ${token})
    on conflict ((lower(email))) do update set
      consent_text = excluded.consent_text,
      source = excluded.source,
      ip_hash = excluded.ip_hash,
      consented_at = now(),
      unsubscribed_at = null`;
}

/** Leave the list; returns the email, or null when the link is unknown or already used. */
export async function unsubscribe(token: string) {
  const sql = await db();
  const rows = await sql<{ email: string }[]>`
    update subscribers set unsubscribed_at = now()
    where token = ${token} and unsubscribed_at is null
    returning email`;
  return rows[0]?.email ?? null;
}

export async function listSubscribers(limit = 500) {
  const sql = await db();
  return sql<Subscriber[]>`
    select id, email, consent_text, source, consented_at, unsubscribed_at
    from subscribers order by consented_at desc limit ${limit}`;
}
