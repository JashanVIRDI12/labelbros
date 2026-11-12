import { z } from "zod";
import { ready } from "@/server/env";
import { clientIp, ipHash, rateLimit, reply, sameOrigin } from "@/server/security";
import { subscribe } from "@/server/subscribers";

/*
 * POST /api/subscribe (JSON): the footer's email sign-up. CASL needs express consent, so the
 * box must be ticked (`consent: true`), never assumed. Bots (hidden field filled, or sent in
 * under two seconds) get an "ok" and nothing is kept.
 */
const schema = z.object({
  email: z.string().trim().toLowerCase().max(200).pipe(z.email("We need a valid email.")),
  consent: z.literal(true, { error: "Tick the box to say yes to our emails." }),
  source: z.string().trim().max(120).regex(/^[^\r\n]*$/).optional(),
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return reply({ error: "forbidden" }, 403);
  if (!ready.db()) return reply({ error: "offline" }, 503);
  if (Number(req.headers.get("content-length") ?? 0) > 5_000) return reply({ error: "invalid" }, 413);

  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return reply({ error: "invalid" }, 400);
  }
  if (!raw || typeof raw !== "object") return reply({ error: "invalid" }, 400);
  const started = Number(raw.t);
  if (raw.website || (Number.isFinite(started) && Date.now() - started < 2000)) return reply({ ok: true, ref: null });

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[String(issue.path[0])] ??= issue.message;
    return reply({ error: "invalid", fields }, 422);
  }

  const ip = ipHash(clientIp(req.headers));
  const limits = await Promise.all([rateLimit(`subscribe:${ip}`, 5, 600), rateLimit("subscribe:all", 200, 600)]);
  if (limits.includes(false)) return reply({ error: "busy" }, 429);

  await subscribe(parsed.data.email, parsed.data.source ?? "", ip);
  return reply({ ok: true, ref: null });
}
