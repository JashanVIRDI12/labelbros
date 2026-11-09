import { env, ready } from "@/server/env";
import { createSubmission, setSession } from "@/server/inbox";
import { notifyShop, safely } from "@/server/mail";
import { clientIp, ipHash, rateLimit, reply, sameOrigin, siteOrigin } from "@/server/security";
import { createCheckout } from "@/server/stripe";
import { checkFile, cleanName, fieldErrors, orderSchema, priceQuote, quoteSchema } from "@/server/validate";

/*
 * POST /api/orders: the quote page's form (multipart, with an optional artwork file).
 *   mode=pay   saves the order and returns a Stripe Checkout URL; the shop hears once it is paid.
 *   mode=quote saves the quote and tells the shop now, no payment.
 * The price is always worked out here from the choices, never taken from the browser.
 */

const STRIPE_MAX = 99_999_999; // Stripe's largest single charge, in cents

export async function POST(req: Request) {
  if (!sameOrigin(req)) return reply({ error: "forbidden" }, 403);
  if (!ready.db()) return reply({ error: "offline" }, 503);

  const maxBytes = env.maxUploadMb * 1_000_000;
  if (Number(req.headers.get("content-length") ?? 0) > maxBytes + 200_000)
    return reply({ error: "invalid", fields: { artwork: `That file is over ${env.maxUploadMb} MB. Add it as a link instead.` } }, 413);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return reply({ error: "invalid" }, 400);
  }
  const get = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v : undefined;
  };

  // a bot filled in the hidden field: say yes, keep nothing
  if (get("website")) return reply({ ok: true, ref: null });

  const order = orderSchema.safeParse(Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")));
  const quote = quoteSchema.safeParse({
    product: get("product"),
    shape: get("shape"),
    finish: get("finish"),
    artwork: get("artwork_choice"),
    size: get("size") || undefined,
    w: get("w") || undefined,
    h: get("h") || undefined,
    qty: get("qty"),
  });
  if (!order.success) return reply({ error: "invalid", fields: fieldErrors(order.error) }, 422);
  if (!quote.success) return reply({ error: "invalid", fields: { quote: "Your quote changed. Check it and try again." } }, 422);
  if (quote.data.artwork === "design" && (order.data.notes ?? "").length < 10)
    return reply({ error: "invalid", fields: { notes: "Tell us your idea: what it says and shows, colours, style." } }, 422);

  const pay = order.data.mode === "pay";
  if (pay && !ready.stripe()) return reply({ error: "offline" }, 503);

  const file = form.get("artwork");
  let upload: { name: string; bytes: Uint8Array } | undefined;
  if (file instanceof File && file.size > 0) {
    const problem = checkFile(file, maxBytes);
    if (problem) return reply({ error: "invalid", fields: { artwork: problem } }, 422);
    upload = { name: cleanName(file.name), bytes: new Uint8Array(await file.arrayBuffer()) };
  }

  const ip = ipHash(clientIp(req.headers));
  const limits = await Promise.all([rateLimit(`orders:${ip}`, 10, 600), rateLimit("orders:all", 150, 600)]);
  if (limits.includes(false)) return reply({ error: "busy" }, 429);

  const currency = order.data.currency;
  const { cents, summary } = priceQuote(quote.data, currency);
  if (pay && (cents < 50 || cents > STRIPE_MAX)) return reply({ error: "invalid", fields: { quote: "This order is too large to pay online. Send it as a quote." } }, 422);

  const o = order.data;
  const q = quote.data;
  const s = await createSubmission({
    kind: pay ? "order" : "quote",
    name: o.name,
    email: o.email,
    phone: o.phone,
    company: o.company,
    summary,
    amountCents: cents,
    currency,
    ipHash: ip,
    file: upload,
    details: {
      product: q.product,
      shape: q.shape,
      finish: q.finish,
      size: q.size ? `${q.size} in` : `${q.w} × ${q.h} in`,
      quantity: q.qty,
      artwork: q.artwork === "design" ? "Design it for me" : upload ? `Their file: ${upload.name}` : "No file yet",
      design_for_them: q.artwork === "design" ? "yes" : undefined,
      artwork_link: o.link,
      needed_by: o.needed,
      notes: o.notes,
      as_shown: get("summary")?.slice(0, 300),
    },
  });

  if (!pay) {
    await safely(() => notifyShop(s, { adminUrl: `${siteOrigin(req)}/admin/${s.ref}`, attachment: upload, headline: "New quote request" }));
    return reply({ ok: true, ref: s.ref });
  }

  try {
    const session = await createCheckout(s, { name: `Custom ${q.product}`, description: summary, cents }, siteOrigin(req));
    await setSession(s.id, session.id);
    return reply({ ok: true, ref: s.ref, url: session.url });
  } catch (err) {
    console.error("[orders] checkout", err instanceof Error ? err.message : err);
    return reply({ error: "payment" }, 502);
  }
}
