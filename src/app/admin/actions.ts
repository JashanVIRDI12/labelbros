"use server";

import { setTimeout as wait } from "node:timers/promises";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkPassword, endSession, requireAdmin, startSession } from "@/server/auth";
import { ready } from "@/server/env";
import { setNotes, setStatus } from "@/server/inbox";
import { clientIp, ipHash, rateLimit } from "@/server/security";

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
