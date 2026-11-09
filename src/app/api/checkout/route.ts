import { z } from "zod";
import { FINISH_IDS, priceIn, type Finish } from "@/lib/facts";
import { checkLine, lineSummary, productBySlug, unitPriceUsd } from "@/lib/products";
import { env, ready } from "@/server/env";
import { createSubmission, setSession } from "@/server/inbox";
import { clientIp, ipHash, rateLimit, reply, sameOrigin, siteOrigin } from "@/server/security";
import { createCheckout } from "@/server/stripe";
import { checkFile, cleanName, currencySchema, fieldErrors, person } from "@/server/validate";

/*
 * POST /api/checkout: the cart, paid in one Stripe Checkout (multipart: the customer, the lines
 * as JSON, and each line's artwork as file_<line id>). Every line is checked against the product
 * list and priced here; the browser's prices are never used. One order holds all the lines.
 */

const STRIPE_MAX = 99_999_999;
const PHONE = "We need a phone number to call you about your design.";

const customerSchema = z.object({
  ...person,
  phone: z.string({ error: PHONE }).trim().max(40).regex(/^[^\r\n]*$/).regex(/\d(?:\D*\d){6}/, PHONE),
  needed: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || undefined)
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Pick a date."),
  currency: currencySchema,
});

const lineSchema = z.object({
  id: z.string().max(64),
  slug: z.string().max(80),
  finish: z.enum(FINISH_IDS as [Finish, ...Finish[]]),
  size: z.number().optional(),
  qty: z.number().int().optional(),
  packs: z.number().int(),
  artwork: z.enum(["upload", "design"]),
  notes: z.string().trim().max(2000).optional(),
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return reply({ error: "forbidden" }, 403);
  if (!ready.db() || !ready.stripe()) return reply({ error: "offline" }, 503);

  const maxBytes = env.maxUploadMb * 1_000_000;
  if (Number(req.headers.get("content-length") ?? 0) > maxBytes + 200_000)
    return reply({ error: "invalid", fields: { form: `Your artwork files add up to more than ${env.maxUploadMb} MB. Send the big ones as a link in the notes.` } }, 413);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return reply({ error: "invalid" }, 400);
  }
  if (form.get("website")) return reply({ ok: true, ref: null });

  const customer = customerSchema.safeParse(Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")));
  if (!customer.success) return reply({ error: "invalid", fields: fieldErrors(customer.error) }, 422);
  const cur = customer.data.currency;

  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("lines") ?? "[]"));
  } catch {
    return reply({ error: "invalid" }, 400);
  }
  const parsed = z.array(lineSchema).min(1).max(20).safeParse(raw);
  if (!parsed.success) return reply({ error: "invalid", fields: { form: "Your cart changed. Check it and try again." } }, 422);

  // each line: a real product, possible choices, its price worked out here, its artwork
  const lines = [];
  const files: { name: string; bytes: Uint8Array }[] = [];
  let bytes = 0;
  for (const [i, l] of parsed.data.entries()) {
    const p = productBySlug(l.slug);
    const choice = p && checkLine(p, l);
    if (!p || !choice) return reply({ error: "invalid", fields: { form: "Something in your cart is no longer available. Remove it and try again." } }, 422);
    if (l.artwork === "design" && (l.notes ?? "").length < 10)
      return reply({ error: "invalid", fields: { form: `Tell us your idea for “${p.name}” in its notes, or remove it.` } }, 422);
    const unit = priceIn(unitPriceUsd(p, choice), cur);
    const quantity = p.kind === "deal" ? choice.packs : 1;
    let fileName: string | undefined;
    const f = form.get(`file_${l.id}`);
    if (l.artwork === "upload" && f instanceof File && f.size > 0) {
      const problem = checkFile(f, maxBytes);
      if (problem) return reply({ error: "invalid", fields: { form: `${p.name}: ${problem}` } }, 422);
      bytes += f.size;
      if (bytes > maxBytes) return reply({ error: "invalid", fields: { form: `Your artwork files add up to more than ${env.maxUploadMb} MB. Send the big ones as a link in the notes.` } }, 413);
      fileName = `${i + 1}-${cleanName(f.name)}`;
      files.push({ name: fileName, bytes: new Uint8Array(await f.arrayBuffer()) });
    }
    lines.push({
      product: p.name,
      slug: p.slug,
      summary: lineSummary(p, choice),
      finish: choice.finish,
      size: `${choice.size} in`,
      quantity: choice.qty,
      packs: quantity,
      unit_cents: unit * 100,
      cents: unit * 100 * quantity,
      artwork: l.artwork === "design" ? "Design it for me" : fileName ? `Their file: ${fileName}` : "Send it when we reply",
      design_for_them: l.artwork === "design" ? "yes" : undefined,
      notes: l.notes || undefined,
    });
  }
  const total = lines.reduce((n, l) => n + l.cents, 0);
  if (total < 50 || total > STRIPE_MAX) return reply({ error: "invalid", fields: { form: "This order is too large to pay online. Contact us and we invoice you." } }, 422);

  const ip = ipHash(clientIp(req.headers));
  const limits = await Promise.all([rateLimit(`checkout:${ip}`, 10, 600), rateLimit("checkout:all", 150, 600)]);
  if (limits.includes(false)) return reply({ error: "busy" }, 429);

  const c = customer.data;
  const summary = lines.length === 1 ? lines[0].summary : `${lines.length} items: ${lines.map((l) => l.product).join(", ")}`;
  const s = await createSubmission({
    kind: "order",
    name: c.name,
    email: c.email,
    phone: c.phone,
    company: c.company,
    summary: summary.slice(0, 300),
    amountCents: total,
    currency: cur,
    ipHash: ip,
    files,
    details: {
      items: lines,
      needed_by: c.needed,
      design_for_them: lines.some((l) => l.design_for_them) ? "yes" : undefined,
      source: "shop",
    },
  });

  try {
    const session = await createCheckout(
      s,
      lines.map((l) => ({ name: l.product, description: l.summary, cents: l.unit_cents, quantity: l.packs })),
      siteOrigin(req),
      {},
      { path: "/cart", hash: "" },
    );
    await setSession(s.id, session.id);
    return reply({ ok: true, ref: s.ref, url: session.url });
  } catch (err) {
    console.error("[checkout]", err instanceof Error ? err.message : err);
    return reply({ error: "payment" }, 502);
  }
}
