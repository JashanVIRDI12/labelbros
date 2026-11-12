import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { redactSecrets, saveSetting } from "../scripts/payment-env.mjs";

test("saving the webhook secret preserves unrelated settings and protects the file", () => {
  const dir = mkdtempSync(join(tmpdir(), "labelbros-env-"));
  try {
    const file = join(dir, ".env.local");
    writeFileSync(file, "# Keep this comment\nDATABASE_URL=existing\nSTRIPE_WEBHOOK_SECRET=old\nSESSION_SECRET=unchanged\n");
    saveSetting("STRIPE_WEBHOOK_SECRET", "whsec_example", file);
    const text = readFileSync(file, "utf8");
    assert.ok(text.includes("# Keep this comment\nDATABASE_URL=existing\n"));
    assert.ok(text.includes("SESSION_SECRET=unchanged\n"));
    assert.equal(text.match(/^STRIPE_WEBHOOK_SECRET=/gm).length, 1);
    assert.equal(statSync(file).mode & 0o777, 0o600);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("new settings retain literal dollar signs when Next loads the environment", () => {
  const dir = mkdtempSync(join(tmpdir(), "labelbros-env-"));
  try {
    const expected = 'literal$VALUE with "quotes" and \\slashes';
    saveSetting("PAYMENT_ENV_TEST", expected, join(dir, ".env.local"));
    const helper = new URL("../scripts/payment-env.mjs", import.meta.url).href;
    const actual = execFileSync(process.execPath, ["--input-type=module", "-e", `import { loadSettings } from ${JSON.stringify(helper)}; process.stdout.write(loadSettings().PAYMENT_ENV_TEST);`], { cwd: dir, encoding: "utf8" });
    assert.equal(actual, expected);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("diagnostic output redacts Stripe secret, publishable, restricted and webhook keys", () => {
  const text = "sk_test_fake123 rk_live_fake456 pk_test_fake789 whsec_fakeABC";
  assert.equal(redactSecrets(text), "[redacted] [redacted] [redacted] [redacted]");
});
