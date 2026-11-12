import { z } from "zod";
import { ready } from "@/server/env";
import { getByRef } from "@/server/inbox";
import { clientIp, ipHash, rateLimit, reply, sameOrigin } from "@/server/security";
import { TRACK_STEPS, type TrackResult } from "@/lib/track";

/*
 * POST /api/track (JSON { ref, email }): where an order is. Both must match, and the answer is
 * the same "not found" for a wrong number or a wrong email, so nobody can probe for orders.
 * Rate limited per visitor. Shows only the order's summary and its step, nothing personal.
 */
const schema = z.object({
  ref: z
    .string()
    .trim()
    .toUpperCase()
    .transform((v) => (v.startsWith("LB-") ? v : `LB-${v}`))
    .pipe(z.string().regex(/^LB-[A-Z0-9]{6}$/)),
  email: z.string().trim().toLowerCase().max(200).pipe(z.email()),
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return reply({ error: "forbidden" }, 403);
  if (!ready.db()) return reply({ error: "offline" }, 503);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return reply({ error: "invalid", fields: { form: "Check the order number (it starts with LB-) and the email you ordered with." } }, 422);

  const ip = ipHash(clientIp(req.headers));
  const limits = await Promise.all([rateLimit(`track:${ip}`, 12, 600), rateLimit("track:all", 600, 600)]);
  if (limits.includes(false)) return reply({ error: "busy" }, 429);

  const s = await getByRef(parsed.data.ref);
  const found = s && (s.kind === "order" || s.kind === "sample_kit") && s.email.toLowerCase() === parsed.data.email;
  if (!found) return reply({ error: "invalid", fields: { form: "We couldn't find an order with that number and email. Check both, or contact us." } }, 404);

  const ids: string[] = TRACK_STEPS.map((t) => t.id);
  const status = s.status === "changes" ? "proof_sent" : s.status;
  const step = status === "done" ? ids.length - 1 : ids.indexOf(status);
  const state =
    s.status === "cancelled" || s.status === "refunded"
      ? s.status
      : s.status === "pending_payment" || s.status === "abandoned"
        ? "unpaid"
        : s.status === "invoice_requested" || s.status === "invoiced"
          ? "invoice"
          : undefined;
  const result: TrackResult = {
    ref: s.ref,
    summary: s.summary,
    step,
    state,
    placed: (s.paid_at ?? s.created_at).toISOString(),
  };
  return reply({ ok: true, ref: s.ref, order: result });
}
