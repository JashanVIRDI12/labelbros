import { SAMPLE_KIT } from "@/lib/facts";
import { ready } from "@/server/env";
import { createSubmission, setSession } from "@/server/inbox";
import { clientIp, ipHash, rateLimit, reply, sameOrigin, siteOrigin } from "@/server/security";
import { createCheckout } from "@/server/stripe";
import { currencySchema, kitPrice } from "@/server/validate";
import { SAMPLE_KIT_ON } from "@/lib/site";

/*
 * POST /api/sample-kit: straight to Stripe Checkout for the sample kit. Stripe's page asks for
 * the name, email, address and the sticker size, so there is no form on our side; the details
 * are filled in from Stripe once it is paid.
 */
export async function POST(req: Request) {
  if (!SAMPLE_KIT_ON) return reply({ error: "offline" }, 404); // switched off for now (src/lib/site.ts)
  if (!sameOrigin(req)) return reply({ error: "forbidden" }, 403);
  if (!ready.db() || !ready.stripe()) return reply({ error: "offline" }, 503);

  const ip = ipHash(clientIp(req.headers));
  const limits = await Promise.all([rateLimit(`kit:${ip}`, 6, 600), rateLimit("kit:all", 100, 600)]);
  if (limits.includes(false)) return reply({ error: "busy" }, 429);

  const body = (await req.json().catch(() => ({}))) as { currency?: unknown };
  const currency = currencySchema.parse(body?.currency);
  const cents = kitPrice(currency);
  const summary = `Sample kit: ${SAMPLE_KIT.count} sample stickers`;
  const s = await createSubmission({ kind: "sample_kit", name: "", email: "", summary, amountCents: cents, currency, ipHash: ip, details: {} });

  try {
    const session = await createCheckout(s, { name: "Sample kit", description: summary, cents }, siteOrigin(req), {
      customer_email: undefined,
      custom_fields: [
        {
          key: "size",
          label: { type: "custom", custom: "Sticker size" },
          type: "dropdown",
          dropdown: {
            options: [
              { label: "2 inches", value: "2in" },
              { label: "3 inches", value: "3in" },
              { label: "4 inches", value: "4in" },
            ],
          },
        },
      ],
    });
    await setSession(s.id, session.id);
    return reply({ ok: true, url: session.url });
  } catch (err) {
    console.error("[sample-kit] checkout", err instanceof Error ? err.message : err);
    return reply({ error: "payment" }, 502);
  }
}
