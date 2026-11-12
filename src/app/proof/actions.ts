"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { env, ready } from "@/server/env";
import { decideProof, getProof } from "@/server/inbox";
import { proofAnswerToShop, safely } from "@/server/mail";
import { clientIp, ipHash, rateLimit } from "@/server/security";

/*
 * The customer's answer to a proof, from its private link: approve it, or ask for changes with
 * what to change. Each proof can be answered once; the shop is told by email either way.
 */

const TOKEN = /^[A-Za-z0-9_-]{32}$/;

async function answer(form: FormData, decision: "approved" | "changes") {
  const token = String(form.get("token") ?? "");
  if (!TOKEN.test(token) || !ready.db()) redirect("/");
  const comment = String(form.get("comment") ?? "").trim().slice(0, 4000);
  if (decision === "changes" && comment.length < 3) redirect(`/proof/${token}?need=comment#changes`);

  const ip = ipHash(clientIp(await headers()));
  if (!(await rateLimit(`proof:${ip}`, 20, 600))) redirect(`/proof/${token}?busy=1`);

  const proof = await getProof(token);
  if (!proof) redirect("/");
  const done = await decideProof(token, decision, comment);
  if (done?.ref) {
    const adminUrl = env.siteUrl ? `${env.siteUrl}/admin/${done.ref}` : undefined;
    await safely(() => proofAnswerToShop(done.ref, proof.name_on_order, decision, comment, adminUrl));
  }
  revalidatePath(`/proof/${token}`);
  revalidatePath("/admin", "layout");
  redirect(`/proof/${token}?answered=1`);
}

export async function approveProof(form: FormData) {
  await answer(form, "approved");
}

export async function requestChanges(form: FormData) {
  await answer(form, "changes");
}
