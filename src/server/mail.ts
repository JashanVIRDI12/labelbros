import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { CALL, PROOF } from "@/lib/facts";
import { BRAND } from "@/lib/site";
import { env, ready } from "./env";
import { KIND_LABEL, type Submission } from "./inbox";

/*
 * Email over SMTP, so it works with any mailbox: the GoDaddy/cPanel inbox, Google Workspace,
 * or a sending service (Resend, Postmark, SES all offer SMTP). The shop is told about every
 * order and message; customers get an email only once they have paid (a form that emails any
 * address it is given could be used to send spam).
 */

declare global {
  var __lbMail: Transporter | undefined;
}

function transport() {
  globalThis.__lbMail ??= nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    // encrypted unless the relay is on this machine (cPanel's own mail server, say)
    requireTLS: env.smtpPort !== 465 && !["localhost", "127.0.0.1"].includes(env.smtpHost),
    auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
  });
  return globalThis.__lbMail;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const money = (cents: number | null, cur = "cad") =>
  cents == null ? "" : `$${cents % 100 === 0 ? cents / 100 : (cents / 100).toFixed(2)} ${cur.toUpperCase()}`;

/** Rows of label: value, as plain text and as a simple HTML table. */
function body(intro: string, rows: [string, string | undefined | null][], outro = "") {
  const kept = rows.filter((r): r is [string, string] => Boolean(r[1]));
  const text = [intro, "", ...kept.map(([k, v]) => `${k}: ${v}`), "", outro].join("\n").trim();
  const html = `<div style="font:15px/1.5 Arial,sans-serif;color:#111">
<p>${esc(intro)}</p>
<table cellpadding="6" style="border-collapse:collapse">${kept
    .map(
      ([k, v]) =>
        `<tr><td style="color:#555;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`,
    )
    .join("")}</table>
${outro ? `<p>${esc(outro)}</p>` : ""}</div>`;
  return { text, html };
}

/** Details as rows, in a stable order, skipping empty ones. */
type Item = { product?: string; summary?: string; artwork?: string; notes?: string };

function detailRows(d: Record<string, unknown>): [string, string][] {
  return Object.entries(d)
    .filter(([k, v]) => k !== "source" && v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))
    .flatMap(([k, v]): [string, string][] => {
      // a shop order: one row per item
      if (k === "items" && Array.isArray(v))
        return (v as Item[]).map((it, i) => [
          `Item ${i + 1}`,
          [`${it.product}: ${it.summary}`, it.artwork, it.notes && `Notes: ${it.notes}`].filter(Boolean).join("\n"),
        ]);
      // an address or invoice: its parts on one line
      if (typeof v === "object" && !Array.isArray(v))
        return [[k.replace(/_/g, " "), Object.values(v as Record<string, unknown>).filter((x) => x !== undefined && x !== null && x !== "").join(", ")]];
      return [[k.replace(/_/g, " "), Array.isArray(v) ? v.join(", ") : String(v)]];
    });
}

/** Tell the shop about a new submission (with its artwork attached when there is one). */
export async function notifyShop(
  s: Submission,
  opts: { adminUrl?: string; attachment?: { name: string; bytes: Uint8Array }; attachments?: { name: string; bytes: Uint8Array }[]; headline?: string } = {},
) {
  if (!ready.mail()) return;
  const title = opts.headline ?? `New ${KIND_LABEL[s.kind].toLowerCase()}`;
  const { text, html } = body(
    `${title} from ${s.name}${s.company ? ` (${s.company})` : ""}.`,
    [
      ["Reference", s.ref],
      ["Name", s.name],
      ["Email", s.email],
      ["Phone", s.phone],
      ["Business", s.company],
      ["What", s.summary],
      ["Amount", money(s.amount_cents, s.currency)],
      ...detailRows(s.details),
    ],
    opts.adminUrl ? `Open it in the admin: ${opts.adminUrl}` : "",
  );
  await transport().sendMail({
    from: env.mailFrom,
    to: env.shopInbox,
    replyTo: { name: s.name, address: s.email },
    subject: `${title}: ${s.ref} · ${s.name}`.slice(0, 180),
    text,
    html,
    attachments: [...(opts.attachments ?? []), ...(opts.attachment ? [opts.attachment] : [])].map((a) => ({ filename: a.name, content: Buffer.from(a.bytes) })),
  });
}

/** Thank a customer who has paid, and tell them what happens next. */
export async function confirmToCustomer(s: Submission) {
  if (!ready.mail()) return;
  const first = s.name.split(" ")[0];
  const next =
    s.kind === "sample_kit"
      ? "We pack your sample kit and email you when it ships."
      : `${s.details.design_for_them ? "Our designer starts on your idea now. " : ""}${PROOF.replace("Free proof", "Your proof comes")}, by email, for you to approve. ${CALL}${s.phone ? ` on ${s.phone}` : ""}. Nothing prints until you say yes.`;
  const { text, html } = body(
    `Thanks, ${first}. Your payment went through and your order is with us.`,
    [
      ["Order", s.ref],
      ["What", s.summary],
      ["Paid", money(s.amount_cents, s.currency)],
    ],
    `${next} Questions? Reply to this email and quote ${s.ref}.`,
  );
  await transport().sendMail({
    from: env.mailFrom,
    to: { name: s.name, address: s.email },
    replyTo: env.shopInbox,
    subject: `${BRAND}: order ${s.ref} received`,
    text,
    html,
  });
}

/** Send the customer their proof: a private link to see it and approve it or ask for changes. */
export async function sendProofEmail(s: Submission, p: { version: number; link: string; message: string }) {
  if (!ready.mail()) return false;
  const first = s.name.split(" ")[0] || "there";
  const { text, html } = body(
    `Hi ${first}, your proof for order ${s.ref} is ready.`,
    [
      ["Order", s.ref],
      ["What", s.summary],
      ["Proof", `Version ${p.version}`],
      ["From us", p.message || undefined],
      ["See it", p.link],
    ],
    `Open the link to approve it, or tell us what to change. Nothing prints until you approve. Questions? Reply to this email and quote ${s.ref}.`,
  );
  await transport().sendMail({
    from: env.mailFrom,
    to: { name: s.name, address: s.email },
    replyTo: env.shopInbox,
    subject: `${BRAND}: your proof for ${s.ref} is ready`,
    text,
    html,
  });
  return true;
}

/** Tell the shop what the customer said about a proof. */
export async function proofAnswerToShop(ref: string, name: string, decision: "approved" | "changes", comment: string, adminUrl?: string) {
  if (!ready.mail()) return;
  const headline = decision === "approved" ? "Proof approved" : "Changes requested";
  const { text, html } = body(`${headline} by ${name} on ${ref}.`, [["Order", ref], ["What they said", comment || undefined]], adminUrl ? `Open it in the admin: ${adminUrl}` : "");
  await transport().sendMail({ from: env.mailFrom, to: env.shopInbox, subject: `${headline}: ${ref} · ${name}`.slice(0, 180), text, html });
}

/** Send, but never let an email problem fail the request that triggered it. */
export async function safely(task: () => Promise<unknown>) {
  try {
    await task();
  } catch (err) {
    console.error("[mail]", err instanceof Error ? err.message : err);
  }
}
