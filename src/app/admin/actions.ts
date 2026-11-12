"use server";

import { randomBytes } from "node:crypto";
import { setTimeout as wait } from "node:timers/promises";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkPassword, endSession, requireAdmin, startSession } from "@/server/auth";
import { INVOICE_DAYS } from "@/lib/facts";
import { env, ready } from "@/server/env";
import { addEvent, createProof, getByRef, setInvoice, setNotes, setStatus } from "@/server/inbox";
import { sendProofEmail } from "@/server/mail";
import { clientIp, ipHash, rateLimit } from "@/server/security";
import { sendInvoice } from "@/server/stripe";
import { cleanName } from "@/server/validate";

/*
 * Everything the admin pages change. Each action checks the session again itself (an action
 * can be called directly, without its page), and Next.js refuses actions sent from other sites.
 */

const REF = /^LB-[A-Z0-9]{6}$/;

export type LoginState = { error?: string };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  if (!ready.admin()) return { error: "Sign-in isn't set up yet: add ADMIN_PASSWORD_HASH (or ADMIN_PASSWORD) and SESSION_SECRET." };
  if (!ready.db()) return { error: "The database isn't connected yet: add DATABASE_URL." };

  const ip = ipHash(clientIp(await headers()));
  const limits = await Promise.all([rateLimit(`login:${ip}`, 5, 900), rateLimit("login:all", 40, 900)]);
  if (limits.includes(false)) return { error: "Too many tries. Wait 15 minutes and try again." };

  const ok = await checkPassword(String(form.get("password") ?? ""));
  if (!ok) {
    await wait(400 + Math.random() * 400);
    return { error: "That password isn't right." };
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function changeStatus(form: FormData) {
  await requireAdmin();
  const ref = String(form.get("ref") ?? "");
  const status = String(form.get("status") ?? "");
  if (!REF.test(ref) || !/^[a-z_]{2,30}$/.test(status)) return;
  await setStatus(ref, status, "admin");
  revalidatePath("/admin", "layout"); // the board, the lists and the counts in the sidebar
}

export async function saveNotes(form: FormData) {
  await requireAdmin();
  const ref = String(form.get("ref") ?? "");
  if (!REF.test(ref)) return;
  await setNotes(ref, String(form.get("notes") ?? ""), "admin");
  revalidatePath(`/admin/${ref}`);
}

/* ---------- Proofs and invoices ---------- */

const PROOF_TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", pdf: "application/pdf" };

/** The site's own address, for links in emails. */
async function origin() {
  if (env.siteUrl) return env.siteUrl;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (env.isProd ? "https" : "http");
  return `${proto.split(",")[0]}://${host.split(",")[0]}`;
}

/**
 * Send a proof: save the file with a private link, move the order to "Proof sent" and email the
 * customer the link (or, without email set up, show the link to send by hand).
 */
export async function sendProof(form: FormData) {
  await requireAdmin();
  const ref = String(form.get("ref") ?? "");
  if (!REF.test(ref)) return;
  const file = form.get("proof");
  const message = String(form.get("message") ?? "").trim().slice(0, 3000);
  const ext = file instanceof File ? (file.name.split(".").pop() ?? "").toLowerCase() : "";
  if (!(file instanceof File) || !file.size || !PROOF_TYPES[ext]) redirect(`/admin/${ref}?proof=type#proofs`);
  if (file.size > env.maxUploadMb * 1_000_000) redirect(`/admin/${ref}?proof=big#proofs`);

  const token = randomBytes(24).toString("base64url");
  const proof = await createProof(ref, { token, name: cleanName(file.name), mime: PROOF_TYPES[ext], bytes: new Uint8Array(await file.arrayBuffer()), message }, "admin");
  if (!proof) redirect(`/admin/${ref}`);

  const s = await getByRef(ref);
  let emailed = false;
  if (s) {
    try {
      emailed = await sendProofEmail(s, { version: proof.version, link: `${await origin()}/proof/${token}`, message });
      if (emailed) await addEvent(s.id, "admin", "proof emailed", `Proof ${proof.version} to ${s.email}`);
    } catch (err) {
      console.error("[proof]", err instanceof Error ? err.message : err);
    }
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/${ref}?proof=${emailed ? "sent" : "link"}#proofs`);
}

/** Send the Stripe invoice for an order placed with "Pay by invoice". */
export async function sendOrderInvoice(form: FormData) {
  await requireAdmin();
  const ref = String(form.get("ref") ?? "");
  if (!REF.test(ref) || !ready.stripe()) return;
  const shipping = Math.round(Math.max(0, Number(form.get("shipping") ?? 0) || 0) * 100);
  const days = Math.min(90, Math.max(0, Math.round(Number(form.get("days") ?? INVOICE_DAYS)) || INVOICE_DAYS));
  const note = String(form.get("note") ?? "").trim().slice(0, 1500);

  const s = await getByRef(ref);
  if (!s || s.kind !== "order" || s.details.payment !== "invoice" || s.details.invoice || s.paid_at) redirect(`/admin/${ref}`);
  type Line = { product: string; summary: string; unit_cents: number; packs: number };
  const items = (Array.isArray(s.details.items) ? (s.details.items as Line[]) : []).map((l) => ({ name: l.product, description: l.summary, cents: l.unit_cents, quantity: l.packs }));
  const billing = (s.details.billing ?? {}) as Record<string, string | undefined>;
  let ok = false;
  try {
    const inv = await sendInvoice(s, items, { shippingCents: shipping, days, billing, note: note || undefined });
    await setInvoice(ref, inv, "admin");
    ok = true;
  } catch (err) {
    console.error("[invoice]", err instanceof Error ? err.message : err);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/${ref}?invoice=${ok ? "sent" : "error"}#invoice`);
}
