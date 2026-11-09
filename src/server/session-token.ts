import { createHmac, timingSafeEqual } from "node:crypto";

/*
 * The admin session cookie: "<expiry>.<version>.<signature>", signed with SESSION_SECRET. No
 * database needed to check it, so the proxy can turn people away before a page runs. The
 * version comes from the password, so changing the password signs everyone out.
 * Kept free of other server modules so the proxy can import it.
 */

export const SESSION_HOURS = 8;
export const cookieName = () => (process.env.NODE_ENV === "production" ? "__Host-lb_admin" : "lb_admin");

const secret = () => (process.env.SESSION_SECRET ?? "").trim();
const sign = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

/** Changes whenever the admin password (or its hash) changes. */
export const passwordVersion = () =>
  sign(`v:${(process.env.ADMIN_PASSWORD_HASH ?? "").trim() || (process.env.ADMIN_PASSWORD ?? "").trim()}`).slice(0, 10);

export function makeToken(now = Date.now()) {
  const data = `${now + SESSION_HOURS * 3600_000}.${passwordVersion()}`;
  return `${data}.${sign(data)}`;
}

export function verifyToken(token: string | undefined, now = Date.now()) {
  if (!token || secret().length < 32) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [exp, version, sig] = parts;
  const expected = Buffer.from(sign(`${exp}.${version}`));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
  return Number(exp) > now && version === passwordVersion();
}
