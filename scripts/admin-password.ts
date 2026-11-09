/*
 * Make the admin password hash for ADMIN_PASSWORD_HASH, and a SESSION_SECRET.
 * Usage: pnpm admin:password   (asks for the password; nothing is shown or saved)
 */
import { randomBytes, scrypt } from "node:crypto";
import { createInterface } from "node:readline";

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const out = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream };
    // hide what is typed: only the question itself is written
    out._writeToOutput = (s: string) => {
      if (s.includes(question)) out.output.write(s);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

const pw = await ask("New admin password (12+ characters): ");
if (pw.length < 12) {
  console.error("Too short: use 12 characters or more (a few random words works well).");
  process.exit(1);
}
if ((await ask("Same password again: ")) !== pw) {
  console.error("Those didn't match.");
  process.exit(1);
}
const N = 2 ** 15;
const salt = randomBytes(16);
const key: Buffer = await new Promise((res, rej) =>
  scrypt(pw, salt, 32, { N, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (e, k) => (e ? rej(e) : res(k))),
);
console.log("\nAdd these to the site's environment variables:\n");
console.log(`ADMIN_PASSWORD_HASH=scrypt:${N}:8:1:${salt.toString("base64url")}:${key.toString("base64url")}`);
console.log(`SESSION_SECRET=${randomBytes(32).toString("base64url")}`);
console.log("\nPaste them as they are: into .env.local, or into the host's environment settings.");
