import "server-only";

/*
 * Every server setting, read in one place. Nothing here reaches the browser. Each part of the
 * backend switches on only when its settings are present, so the site still builds and the
 * forms say "we can't send yet" instead of failing. The full list, with where to find each
 * value, is in reference/BACKEND.md and .env.example.
 */

const str = (k: string) => (process.env[k] ?? "").trim();
const num = (k: string, fallback: number) => {
  const n = Number(str(k));
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const env = {
  /** Postgres connection string (Neon, Supabase, or the host's own Postgres). */
  databaseUrl: str("DATABASE_URL"),
  /** Connections per server process (lower it on hosts with a small connection limit). */
  dbPoolMax: num("DATABASE_POOL_MAX", 5),
  /** Prepared statements (one round trip per query). "false" only for poolers without them. */
  dbPrepare: str("DATABASE_PREPARE") !== "false",
  /** How long an unused connection stays open, in seconds (reconnecting is the slow part). */
  dbIdleSeconds: num("DATABASE_IDLE_SECONDS", 300),

  stripeSecretKey: str("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: str("STRIPE_WEBHOOK_SECRET"),
  /** A CAD Shipping Rate made in the Stripe dashboard, for Canadian orders under the free-shipping line. */
  stripeShippingRateId: str("STRIPE_SHIPPING_RATE_ID"),
  /** A USD Shipping Rate, for every order outside Canada. */
  stripeShippingRateIdUsd: str("STRIPE_SHIPPING_RATE_ID_USD"),
  /** "true" once Stripe Tax is set up (GST/HST registrations added in the dashboard). */
  stripeAutomaticTax: str("STRIPE_AUTOMATIC_TAX") === "true",
  /** Where USD orders ship, as two-letter codes ("US,GB"); empty: everywhere Stripe ships but Canada. */
  shipCountriesUsd: str("SHIP_COUNTRIES_USD")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter((c) => /^[A-Z]{2}$/.test(c) && c !== "CA"),

  smtpHost: str("SMTP_HOST"),
  smtpPort: num("SMTP_PORT", 465),
  smtpUser: str("SMTP_USER"),
  smtpPass: str("SMTP_PASS"),
  /** The address emails come from, e.g. "Label Bros <hello@labelbros.ca>". */
  mailFrom: str("MAIL_FROM"),
  /** Where new orders and messages are sent. */
  shopInbox: str("SHOP_INBOX"),

  /** The admin password as a hash, made by `pnpm admin:password` (preferred) ... */
  adminPasswordHash: str("ADMIN_PASSWORD_HASH"),
  /** ... or the password itself (12 characters or more). */
  adminPassword: str("ADMIN_PASSWORD"),
  /** A long random string that signs admin sessions (32 characters or more). */
  sessionSecret: str("SESSION_SECRET"),

  /** The largest artwork file accepted, in MB (Vercel caps a request at 4.5 MB). */
  maxUploadMb: num("MAX_UPLOAD_MB", 4),

  siteUrl: str("NEXT_PUBLIC_SITE_URL").replace(/\/$/, ""),
  isProd: process.env.NODE_ENV === "production",
};

export const ready = {
  db: () => Boolean(env.databaseUrl),
  stripe: () => Boolean(env.stripeSecretKey),
  mail: () => Boolean(env.smtpHost && env.mailFrom && env.shopInbox),
  admin: () =>
    env.sessionSecret.length >= 32 && (Boolean(env.adminPasswordHash) || env.adminPassword.length >= 12),
};
