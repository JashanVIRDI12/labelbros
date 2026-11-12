import { ready } from "@/server/env";
import { reply, sameOrigin } from "@/server/security";
import { unsubscribe } from "@/server/subscribers";

/*
 * POST /api/unsubscribe (JSON { token }): leave the email list. A POST from the unsubscribe page,
 * never a GET, so email scanners that open links can't unsubscribe anyone by accident.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return reply({ error: "forbidden" }, 403);
  if (!ready.db()) return reply({ error: "offline" }, 503);
  const body = (await req.json().catch(() => null)) as { token?: unknown } | null;
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return reply({ error: "invalid" }, 422);
  await unsubscribe(token);
  // the same answer whether or not the link was known: nothing to learn from trying tokens
  return reply({ ok: true, ref: null });
}
