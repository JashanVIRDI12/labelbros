import { spawn } from "node:child_process";
import { loadSettings, redactSecrets, saveSetting, WEBHOOK_EVENTS } from "./payment-env.mjs";

const settings = loadSettings();
const key = (settings.STRIPE_SECRET_KEY ?? "").trim();
if (!/^[sr]k_test_[A-Za-z0-9]+$/.test(key)) {
  console.error("Local webhook forwarding needs a Stripe test secret key in .env.local.");
  process.exit(1);
}
const origin = new URL(process.argv[2] || settings.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
if (!["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)) {
  console.error("Use a local URL, for example: pnpm stripe:listen http://localhost:3000");
  process.exit(1);
}
const target = new URL("/api/stripe/webhook", origin).href;
const listener = spawn("stripe", ["listen", "--skip-update", "--color", "off", "--events", WEBHOOK_EVENTS.join(","), "--forward-to", target], {
  // Keep the key out of shell history and process arguments; ignore other CLI profiles.
  env: { ...settings, STRIPE_API_KEY: key, STRIPE_NO_AUTO_UPDATE: "1" },
  stdio: ["ignore", "pipe", "pipe"],
});
let ready = false;
let buffer = "";
const timer = setTimeout(() => {
  console.error("Stripe listener did not become ready within 30 seconds.");
  listener.kill();
  process.exitCode = 1;
}, 30_000);
function output(chunk) {
  buffer += chunk.toString();
  const lines = buffer.split(/[\r\n]+/);
  buffer = lines.pop() ?? "";
  for (const line of lines) {
    const secret = line.match(/\bwhsec_[A-Za-z0-9_]+\b/)?.[0];
    if (secret && !ready) {
      saveSetting("STRIPE_WEBHOOK_SECRET", secret);
      saveSetting("STRIPE_WEBHOOK_SECRET_SOURCE", "cli");
      if (!settings.NEXT_PUBLIC_SITE_URL) saveSetting("NEXT_PUBLIC_SITE_URL", origin.origin);
      ready = true;
      clearTimeout(timer);
      console.log(`Stripe test webhooks are forwarding to ${target}`);
      console.log("The matching signing secret is saved in .env.local. Keep this terminal running.");
    }
    if (line.trim() && !secret) console.log(redactSecrets(line));
  }
}
listener.stdout.on("data", output);
listener.stderr.on("data", output);
listener.on("error", (err) => {
  clearTimeout(timer);
  console.error(err.code === "ENOENT" ? "Install the Stripe CLI first: https://docs.stripe.com/stripe-cli" : redactSecrets(err.message));
  process.exitCode = 1;
});
listener.on("close", (code, signal) => {
  clearTimeout(timer);
  if (!signal) process.exitCode = code ?? 1;
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => listener.kill(signal));
