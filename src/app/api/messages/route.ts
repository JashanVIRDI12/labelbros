import { BUSINESS_KINDS, BUSINESS_OFTEN, BUSINESS_VOLUME, CONTACT_TOPICS, labelOf } from "@/lib/forms";
import { ready } from "@/server/env";
import { createSubmission } from "@/server/inbox";
import { notifyShop, safely } from "@/server/mail";
import { clientIp, ipHash, rateLimit, reply, sameOrigin, siteOrigin } from "@/server/security";
import { fieldErrors, messageSchema } from "@/server/validate";

/*
 * POST /api/messages (JSON): the contact form (kind "contact") and the business form (kind
 * "business"). Saved to the inbox and emailed to the shop. Bots that fill in the hidden field,
 * or send the form faster than a person could, get a "sent" and nothing is kept.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return reply({ error: "forbidden" }, 403);
  if (!ready.db()) return reply({ error: "offline" }, 503);
  if (Number(req.headers.get("content-length") ?? 0) > 50_000) return reply({ error: "invalid" }, 413);

  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return reply({ error: "invalid" }, 400);
  }
  if (!raw || typeof raw !== "object") return reply({ error: "invalid" }, 400);

  const started = Number(raw.t);
  if (raw.website || (Number.isFinite(started) && Date.now() - started < 2500)) return reply({ ok: true, ref: null });

  const parsed = messageSchema.safeParse(raw);
  if (!parsed.success) return reply({ error: "invalid", fields: fieldErrors(parsed.error) }, 422);

  const ip = ipHash(clientIp(req.headers));
  // per visitor, and a site-wide cap in case a visitor header is faked
  const limits = await Promise.all([rateLimit(`messages:${ip}`, 5, 600), rateLimit("messages:all", 120, 600)]);
  if (limits.includes(false)) return reply({ error: "busy" }, 429);

  const m = parsed.data;
  const page = typeof raw.page === "string" ? raw.page.slice(0, 300) : undefined;
  const s =
    m.kind === "contact"
      ? await createSubmission({
          kind: "contact",
          name: m.name,
          email: m.email,
          summary: `${labelOf(CONTACT_TOPICS, m.topic)}: ${m.message.slice(0, 120)}`,
          ipHash: ip,
          details: { topic: labelOf(CONTACT_TOPICS, m.topic), order_number: m.order, message: m.message, page },
        })
      : await createSubmission({
          kind: "business",
          name: m.name,
          email: m.email,
          phone: m.phone,
          company: m.company,
          summary: `${m.company}: ${m.labels.map((l) => labelOf(BUSINESS_KINDS, l)).join(", ") || "business labels"}`,
          ipHash: ip,
          details: {
            labels: m.labels.map((l) => labelOf(BUSINESS_KINDS, l)),
            how_many: labelOf(BUSINESS_VOLUME, m.volume),
            how_often: labelOf(BUSINESS_OFTEN, m.often),
            needed_by: m.needed,
            message: m.message,
            page,
          },
        });

  await safely(() =>
    notifyShop(s, {
      adminUrl: `${siteOrigin(req)}/admin/${s.ref}`,
      headline: m.kind === "business" ? "New business enquiry" : "New message",
    }),
  );
  return reply({ ok: true, ref: s.ref });
}
