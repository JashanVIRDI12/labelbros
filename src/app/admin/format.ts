/** Whole dollars without cents ($84), anything else to the cent. */
const whole = (cents: number) => (cents % 100 === 0 ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {});

/** $84 CAD / $60.75 USD, or nothing. */
export const money = (cents: number | null, cur = "cad") =>
  cents == null
    ? ""
    : `${(cents / 100).toLocaleString(cur === "usd" ? "en-US" : "en-CA", { style: "currency", currency: cur.toUpperCase(), ...whole(cents) })} ${cur.toUpperCase()}`;

/** "5 min ago", "3 h ago", "2 d ago", then the date. */
export function ago(d: Date, now = Date.now()) {
  const s = Math.max(0, (now - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
  return dateTime(d);
}

export const dateTime = (d: Date) =>
  d.toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: process.env.SHOP_TIMEZONE || "America/Vancouver" });

/** Has this moment passed (with some slack, in ms)? Admin pages render per request, so the clock is safe to read. */
export const isPast = (d: Date, slackMs = 0) => d.getTime() < Date.now() - slackMs;

/** The time `days` ago, in ms. */
export const daysAgo = (days: number) => Date.now() - days * 86400_000;

/** The amount alone, in its currency's format: $84 (the code is shown apart). */
export const amount = (cents: number, cur = "cad") =>
  (cents / 100).toLocaleString(cur === "usd" ? "en-US" : "en-CA", { style: "currency", currency: cur.toUpperCase(), ...whole(cents) });
