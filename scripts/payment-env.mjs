import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

/** Use the same .env precedence and expansion as the application. */
export function loadSettings() {
  const require = createRequire(import.meta.url);
  const nextRequire = createRequire(require.resolve("next/package.json"));
  nextRequire("@next/env").loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
  return process.env;
}

/** Preserve unrelated settings and keep newly written secrets private. Never log the value. */
export function saveSetting(name, value, file = resolve(".env.local")) {
  if (!/^[A-Z][A-Z0-9_]*$/.test(name) || /[\r\n]/.test(value)) throw new Error("Invalid environment setting");
  const text = existsSync(file) ? readFileSync(file, "utf8") : "";
  const quote = ["'", "`", '"'].find((q) => !value.includes(q));
  if (!quote) throw new Error("This value must be entered directly in the environment file");
  const assignment = `${name}=${quote}${value.replace(/\$/g, "\\$")}${quote}`;
  const pattern = new RegExp(`^\\s*(?:export\\s+)?${name}\\s*=.*$`, "m");
  const updated = pattern.test(text) ? text.replace(pattern, () => assignment) : `${text}${text.endsWith("\n") || !text ? "" : "\n"}${assignment}\n`;
  writeFileSync(file, updated, { mode: 0o600 });
  chmodSync(file, 0o600);
}

/** A CLI error may repeat the key supplied to it. */
export function redactSecrets(text) {
  return String(text).replace(/\b(?:[spr]k_(?:test|live)_[A-Za-z0-9_]+|whsec_[A-Za-z0-9_]+)\b/g, "[redacted]");
}

export const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.expired",
  "charge.refunded",
  "invoice.paid",
];
