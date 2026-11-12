import Stripe from "stripe";
import postgres from "postgres";
import nodemailer from "nodemailer";
import { loadSettings, WEBHOOK_EVENTS } from "./payment-env.mjs";

const e = loadSettings();
let missing = 0;
function report(ok, name, detail) {
  if (!ok) missing++;
  console.log(`${ok ? "OK" : "NEEDS SETUP"}  ${name}: ${detail}`);
}
const value = (name) => (e[name] ?? "").trim();
const mode = /^[sr]k_live_/.test(value("STRIPE_SECRET_KEY")) ? "live" : /^[sr]k_test_/.test(value("STRIPE_SECRET_KEY")) ? "test" : "missing";
const live = process.argv.includes("--live") || mode === "live";
console.log(`Checking ${live ? "production" : mode} payment settings. Secret values are never printed.`);
report(mode !== "missing" && (!live || mode === "live"), "Stripe key", mode === "missing" ? "Add STRIPE_SECRET_KEY." : `${mode} mode${live && mode !== "live" ? "; a live key is required for production" : ""}.`);

let origin;
try { origin = new URL(value("NEXT_PUBLIC_SITE_URL")); } catch { /* reported below */ }
const local = origin && ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
report(Boolean(origin && (local || origin.protocol === "https:") && (!live || !local)), "Site URL", origin ? `${origin.origin}${live && local ? "; set your public HTTPS domain" : ""}` : "Add NEXT_PUBLIC_SITE_URL.");

await Promise.all([
  (async () => {
    if (!value("DATABASE_URL")) return report(false, "Database", "Add DATABASE_URL.");
    const sql = postgres(value("DATABASE_URL"), { max: 1, connect_timeout: 10, idle_timeout: 1, onnotice: () => {} });
    try {
      const [r] = await sql`select to_regclass('public.submissions') is not null as orders, to_regclass('public.stripe_events') is not null as webhooks`;
      report(r.orders && r.webhooks, "Database", r.orders && r.webhooks ? "Connected; order and webhook tables exist." : "Run pnpm db:setup.");
    } catch (err) { report(false, "Database", `Connection failed (${err.code || err.name}).`); }
    finally { await sql.end({ timeout: 1 }); }
  })(),
  (async () => {
    if (mode === "missing") return;
    const st = new Stripe(value("STRIPE_SECRET_KEY"), { maxNetworkRetries: 0, timeout: 12_000 });
    try {
      const account = await st.accounts.retrieve();
      report(!live || account.charges_enabled && account.payouts_enabled, "Stripe account", live ? `Payments ${account.charges_enabled ? "enabled" : "disabled"}; payouts ${account.payouts_enabled ? "enabled" : "disabled"}. Finish activation in the Stripe Dashboard if disabled.` : "Test key authenticated. Live account activation requires checking with a live key.");
      if (local && !live) {
        report(value("STRIPE_WEBHOOK_SECRET").startsWith("whsec_") && value("STRIPE_WEBHOOK_SECRET_SOURCE") === "cli", "Local webhooks", "Run pnpm stripe:listen and keep it running; it saves the matching signing secret.");
      } else {
        const endpoints = await st.webhookEndpoints.list({ limit: 100 });
        const expected = origin ? new URL("/api/stripe/webhook", origin).href : "";
        const found = endpoints.data.find((x) => x.url === expected && x.status === "enabled" && (x.enabled_events.includes("*") || WEBHOOK_EVENTS.every((t) => x.enabled_events.includes(t))));
        report(Boolean(found && value("STRIPE_WEBHOOK_SECRET").startsWith("whsec_") && value("STRIPE_WEBHOOK_SECRET_SOURCE") !== "cli"), "Public webhook", found ? "Endpoint enabled with the required events; use its Dashboard signing secret." : "Register your public /api/stripe/webhook endpoint and its five events; add its signing secret.");
      }
      for (const [name, currency] of [["STRIPE_SHIPPING_RATE_ID", "cad"], ["STRIPE_SHIPPING_RATE_ID_USD", "usd"]]) {
        if (!value(name)) { report(false, `${currency.toUpperCase()} shipping`, `Set ${name} after choosing your shipping charge.`); continue; }
        const rate = await st.shippingRates.retrieve(value(name));
        report(rate.active && rate.fixed_amount?.currency === currency, `${currency.toUpperCase()} shipping`, rate.active && rate.fixed_amount?.currency === currency ? "Active rate in the correct currency." : "Rate is inactive or uses the wrong currency.");
      }
      const tax = await st.tax.settings.retrieve();
      const registrations = await st.tax.registrations.list({ status: "active", limit: 100 });
      const taxReady = tax.status === "active" && registrations.data.length > 0;
      report(taxReady && value("STRIPE_AUTOMATIC_TAX") === "true", "Automatic tax", taxReady ? "Tax settings and registrations exist; set STRIPE_AUTOMATIC_TAX=true to collect." : "Add your actual head-office address and applicable registrations in Stripe Tax before enabling collection.");
    } catch (err) {
      report(false, "Stripe API", `Check failed (${err.type || err.name}${err.code ? `: ${err.code}` : ""}); no secret values logged.`);
    }
  })(),
  (async () => {
    if (!value("SMTP_HOST") || !value("MAIL_FROM") || !value("SHOP_INBOX")) return report(false, "Order emails", "Add SMTP_HOST, SMTP_USER/SMTP_PASS, MAIL_FROM and SHOP_INBOX.");
    const port = Number(value("SMTP_PORT")) || 465;
    const transport = nodemailer.createTransport({
      host: value("SMTP_HOST"), port, secure: port === 465,
      requireTLS: port !== 465 && !["localhost", "127.0.0.1"].includes(value("SMTP_HOST")),
      auth: value("SMTP_USER") ? { user: value("SMTP_USER"), pass: value("SMTP_PASS") } : undefined,
      connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 10_000,
    });
    try { await transport.verify(); report(true, "Order emails", "SMTP connection and authentication verified; no messages sent."); }
    catch (err) { report(false, "Order emails", `SMTP verification failed (${err.code || err.name}).`); }
    finally { transport.close(); }
  })(),
]);

console.log(missing ? `${missing} setting(s) still need attention. Local test payments can work while production details are pending.` : "All requested checks passed.");
process.exitCode = missing ? 1 : 0;
