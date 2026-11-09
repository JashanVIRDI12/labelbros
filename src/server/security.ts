import "server-only";
import { createHmac, randomInt } from "node:crypto";
import { db } from "./db";
import { env } from "./env";

/*
 * Guards shared by every public endpoint: same-site requests only, a rate limit per visitor
 * (kept in the database, so it holds across serverless instances), and visitor IPs stored only
 * as a keyed hash.
 */

/** The visitor's IP: the host's own header first (Vercel), else the proxy's last hop (cPanel). */
export function clientIp(h: Headers) {
  const real = h.get("x-real-ip")?.trim();
  if (real) return real;
  const hops = (h.get("x-forwarded-for") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return hops.at(-1) ?? "unknown";
}

/** A keyed hash of the IP: the same visitor matches, the address itself is never stored. */
export const ipHash = (ip: string) =>
  createHmac("sha256", env.sessionSecret || env.databaseUrl || "labelbros").update(ip).digest("base64url").slice(0, 22);

/** The site's own origin, as the browser sees it. */
export function siteOrigin(req: Request) {
  if (env.siteUrl) return env.siteUrl;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? (env.isProd ? "https" : "http");
  return host ? `${proto.split(",")[0].trim()}://${host.split(",")[0].trim()}` : new URL(req.url).origin;
}

/** Was this POST sent by a page on this site? (Blocks other sites posting forms in a visitor's name.) */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return req.headers.get("sec-fetch-site") !== "cross-site";
  try {
    const o = new URL(origin).host;
    const allowed = new Set([new URL(siteOrigin(req)).host, req.headers.get("host") ?? ""]);
    return allowed.has(o);
  } catch {
    return false;
  }
}

/**
 * Allow at most `limit` hits per `windowSec` for this bucket (e.g. "contact:<ip hash>").
 * Returns false when the limit is reached; the hit is only counted when allowed.
 */
export async function rateLimit(bucket: string, limit: number, windowSec: number) {
  const sql = await db();
  // count and record in one statement: one round trip
  const [{ ok }] = await sql<{ ok: boolean }[]>`
    with c as (
      select count(*)::int as n from rate_hits
      where bucket = ${bucket} and at > now() - make_interval(secs => ${windowSec}::int)
    ),
    i as (insert into rate_hits (bucket) select ${bucket} from c where n < ${limit}::int)
    select n < ${limit}::int as ok from c`;
  // tidy up now and then, without making anyone wait
  if (randomInt(50) === 0) void sql`delete from rate_hits where at < now() - interval '2 days'`.catch(() => {});
  return ok;
}

const REF_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L
/** A short, readable reference for an order or message: LB-7K3Q9P. */
export function newRef() {
  let s = "";
  for (let i = 0; i < 6; i++) s += REF_CHARS[randomInt(REF_CHARS.length)];
  return `LB-${s}`;
}

/** A JSON reply with no caching. */
export const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
