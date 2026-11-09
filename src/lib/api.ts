/*
 * Sending the site's forms to its own backend (src/app/api). One shape of answer for every
 * form: sent (with a reference and, for payments, the Stripe page to go to), field errors to
 * show, or a reason it could not be sent.
 */

export type Result =
  | { ok: true; ref: string | null; url?: string }
  | { ok: false; reason: "offline" | "busy" | "error"; fields?: Record<string, string> };

export async function send(path: string, body: FormData | Record<string, unknown>): Promise<Result> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    });
  } catch {
    return { ok: false, reason: "error" };
  }
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    ref?: string | null;
    url?: string;
    error?: string;
    fields?: Record<string, string>;
  };
  if (res.ok && data.ok) return { ok: true, ref: data.ref ?? null, url: data.url };
  if (data.error === "offline") return { ok: false, reason: "offline" };
  if (data.error === "busy") return { ok: false, reason: "busy" };
  return { ok: false, reason: "error", fields: data.fields };
}

/** Only send a Stripe Checkout URL the browser to Stripe (never anywhere else). */
export const isStripeUrl = (url: string) => {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && (u.hostname === "checkout.stripe.com" || u.hostname.endsWith(".stripe.com"));
  } catch {
    return false;
  }
};

/** Artwork up to this size goes with the form; bigger files go as a link (the server checks too). */
export const UPLOAD_MB = 4;
