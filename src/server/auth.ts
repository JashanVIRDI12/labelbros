import "server-only";
import { scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { env } from "./env";
import { SESSION_HOURS, cookieName, makeToken, verifyToken } from "./session-token";

/*
 * Signing in to /admin: one shop password, checked in constant time against an scrypt hash
 * (ADMIN_PASSWORD_HASH from `pnpm admin:password`) or the plain ADMIN_PASSWORD. The proxy
 * checks the cookie first; every admin page and action checks it again here.
 */

const scrypt = (pw: string, salt: Buffer, len: number, opts: ScryptOptions) =>
  new Promise<Buffer>((res, rej) => scryptCb(pw, salt, len, opts, (e, k) => (e ? rej(e) : res(k))));

/**
 * Checks against ADMIN_PASSWORD_HASH ("scrypt:N:r:p:salt:hash", from `pnpm admin:password`) or
 * ADMIN_PASSWORD. Colons, because Next.js reads every "$" in a .env file as a variable; hashes
 * written with "$" still work when pasted into a host's settings.
 */
export async function checkPassword(pw: string) {
  if (!pw || pw.length > 200) return false;
  if (env.adminPasswordHash) {
    const [algo, n, r, p, salt, hash] = env.adminPasswordHash.split(/[:$]/);
    if (algo !== "scrypt" || !salt || !hash) return false;
    const expected = Buffer.from(hash, "base64url");
    const key = await scrypt(pw, Buffer.from(salt, "base64url"), expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: 64 * 1024 * 1024,
    });
    return timingSafeEqual(key, expected);
  }
  if (env.adminPassword.length < 12) return false;
  // compare equal-length digests so the length of the password is not revealed either
  const salt = Buffer.from("lb-compare");
  const opts = { N: 2 ** 14, r: 8, p: 1 };
  const [a, b] = await Promise.all([scrypt(pw, salt, 32, opts), scrypt(env.adminPassword, salt, 32, opts)]);
  return timingSafeEqual(a, b);
}

export async function startSession() {
  (await cookies()).set(cookieName(), makeToken(), {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function endSession() {
  (await cookies()).delete(cookieName());
}

export async function isSignedIn() {
  await connection(); // always at request time: the check reads the clock
  return verifyToken((await cookies()).get(cookieName())?.value);
}

/** For admin pages and actions: carry on only when signed in. */
export async function requireAdmin() {
  if (!(await isSignedIn())) redirect("/admin/login");
}
