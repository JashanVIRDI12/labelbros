import { z } from "zod";
<<<<<<< Updated upstream
import { FINISH_IDS, priceIn, type Finish } from "@/lib/facts";
=======
import { INVOICE_MIN } from "@/lib/facts";
import { BULK_FROM, FINISH_IDS, FORMAT_IDS, MATERIAL_IDS, SHAPE_IDS, sizeText, type FinishId, type FormatId, type MaterialId, type ShapeId } from "@/lib/options";
import { priceIn } from "@/lib/pricing";
>>>>>>> Stashed changes
import { checkLine, lineSummary, productBySlug, unitPriceUsd } from "@/lib/products";
import { env, ready } from "@/server/env";
import { createSubmission, setSession } from "@/server/inbox";
import { notifyShop, safely } from "@/server/mail";
import { clientIp, ipHash, rateLimit, reply, sameOrigin, siteOrigin } from "@/server/security";
import { createCheckout } from "@/server/stripe";
import { checkFile, cleanName, currencySchema, fieldErrors, person } from "@/server/validate";

/*
 * POST /api/checkout: the cart, as one order (multipart: the customer, the lines as JSON, and
 * each line's artwork as file_<line id>). Every line is checked against the product list and
 * priced here; the browser's prices are never used. Two ways to pay:
 *   card     one Stripe Checkout with a line per item (Stripe takes the address and phone)
 *   invoice  business orders over INVOICE_MIN: the order is saved as "Invoice requested" with the
 *            business's billing address and PO number; the shop checks the artwork and sends a
 *            Stripe invoice from the admin.
 */

const STRIPE_MAX = 99_999_999;
const PHONE = "We need a phone number to call you about your design.";

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .regex(/^[^\r\n]*$/)
    .optional()
    .transform((v) => v || undefined);
const required = (max: number, msg: string) => z.string({ error: msg }).trim().min(1, msg).max(max).regex(/^[^\r\n]*$/, msg);

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
  pay: z.enum(["card", "invoice"]).catch("card"),
});

const billingSchema = z.object({
  company: required(160, "Which business is it for?"),
  line1: required(200, "Add the street address."),
  line2: optional(200),
  city: required(120, "Add the city."),
  state: required(80, "Add the province or state."),
  postal_code: required(20, "Add the postal or ZIP code."),
  country: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "Pick the country."),
  po: optional(60),
});

const lineSchema = z.object({
  id: z.string().max(64),
  slug: z.string().max(80),
  shape: z.enum(SHAPE_IDS as [ShapeId, ...ShapeId[]]),
  w: z.number(),
  h: z.number(),
  material: z.enum(MATERIAL_IDS as [MaterialId, ...MaterialId[]]),
  finish: z.enum(FINISH_IDS as [FinishId, ...FinishId[]]),
  format: z.enum(FORMAT_IDS as [FormatId, ...FormatId[]]),
  qty: z.number().int(),
  packs: z.number().int(),
<<<<<<< Updated upstream
  artwork: z.enum(["upload", "design"]),
=======
  artwork: z.enum(["upload", "design", "later", "none"]),
>>>>>>> Stashed changes
  notes: z.string().trim().max(2000).optional(),
});

const ARTWORK = { design: "Design it for me", later: "Sending it after ordering", none: "Nothing to print" } as const;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return reply({ error: "forbidden" }, 403);
  if (!ready.db()) return reply({ error: "offline" }, 503);

  const maxBytes = env.maxUploadMb * 1_000_000;
  const tooBig = { error: "invalid", fields: { form: `Your artwork files add up to more than ${env.maxUploadMb} MB. Choose "Send it later" for the big ones and email them after ordering.` } };
  if (Number(req.headers.get("content-length") ?? 0) > maxBytes + 200_000) return reply(tooBig, 413);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return reply({ error: "invalid" }, 400);
  }
  if (form.get("website")) return reply({ ok: true, ref: null });

  const fields = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string"));
  const customer = customerSchema.safeParse(fields);
  if (!customer.success) return reply({ error: "invalid", fields: fieldErrors(customer.error) }, 422);
  const c = customer.data;
  const cur = c.currency;
  const invoice = c.pay === "invoice";
  if (!invoice && !ready.stripe()) return reply({ error: "offline" }, 503);
  const billing = invoice ? billingSchema.safeParse(fields) : null;
  if (billing && !billing.success) return reply({ error: "invalid", fields: fieldErrors(billing.error) }, 422);

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
    const artwork = p.noArtwork ? "none" : l.artwork === "none" ? "later" : l.artwork;
    if (artwork === "design" && (l.notes ?? "").length < 10)
      return reply({ error: "invalid", fields: { form: `Tell us your idea for “${p.name}” in its notes, or remove it.` } }, 422);
    const unit = priceIn(unitPriceUsd(p, choice), cur);
    const quantity = p.kind === "deal" ? choice.packs : 1;
    let fileName: string | undefined;
    const f = form.get(`file_${l.id}`);
    if (artwork === "upload" && f instanceof File && f.size > 0) {
      const problem = checkFile(f, maxBytes);
      if (problem) return reply({ error: "invalid", fields: { form: `${p.name}: ${problem}` } }, 422);
      bytes += f.size;
      if (bytes > maxBytes) return reply(tooBig, 413);
      fileName = `${i + 1}-${cleanName(f.name)}`;
      files.push({ name: fileName, bytes: new Uint8Array(await f.arrayBuffer()) });
    }
    lines.push({
      product: p.name,
      slug: p.slug,
      summary: lineSummary(p, choice),
      size: sizeText(choice.shape, choice.w, choice.h),
      shape: choice.shape,
      material: choice.material,
      finish: choice.finish,
<<<<<<< Updated upstream
      size: `${choice.size} in`,
=======
      format: choice.format,
>>>>>>> Stashed changes
      quantity: choice.qty,
      packs: quantity,
      unit_cents: unit * 100,
      cents: unit * 100 * quantity,
      artwork: artwork === "upload" ? (fileName ? `Their file: ${fileName}` : ARTWORK.later) : ARTWORK[artwork],
      design_for_them: artwork === "design" ? "yes" : undefined,
      bulk: p.kind === "custom" && choice.qty >= BULK_FROM ? "yes" : undefined,
      notes: l.notes || undefined,
    });
  }
  const total = lines.reduce((n, l) => n + l.cents, 0);
  if (total < 50 || total > STRIPE_MAX) return reply({ error: "invalid", fields: { form: "This order is too large to pay online. Contact us and we invoice you." } }, 422);
  if (invoice && total < INVOICE_MIN * 100)
    return reply({ error: "invalid", fields: { form: `Pay by invoice is for orders of $${INVOICE_MIN} or more. Pay by card instead.` } }, 422);

  const ip = ipHash(clientIp(req.headers));
  const limits = await Promise.all([rateLimit(`checkout:${ip}`, 10, 600), rateLimit("checkout:all", 150, 600)]);
  if (limits.includes(false)) return reply({ error: "busy" }, 429);

  const b = billing?.success ? billing.data : undefined;
  const summary = lines.length === 1 ? lines[0].summary : `${lines.length} items: ${lines.map((l) => l.product).join(", ")}`;
  const s = await createSubmission({
    kind: "order",
    status: invoice ? "invoice_requested" : undefined,
    name: c.name,
    email: c.email,
    phone: c.phone,
    company: b?.company ?? c.company,
    summary: summary.slice(0, 300),
    amountCents: total,
    currency: cur,
    ipHash: ip,
    files,
    details: {
      items: lines,
      needed_by: c.needed,
      design_for_them: lines.some((l) => l.design_for_them) ? "yes" : undefined,
      bulk: lines.some((l) => l.bulk) ? "yes" : undefined,
      payment: invoice ? "invoice" : "card",
      billing: b,
      source: "shop",
    },
  });

  if (invoice) {
    await safely(() =>
      notifyShop(s, {
        adminUrl: env.siteUrl ? `${env.siteUrl}/admin/${s.ref}` : undefined,
        headline: "Invoice requested",
        attachments: files,
      }),
    );
    return reply({ ok: true, ref: s.ref, url: `/order/requested?ref=${encodeURIComponent(s.ref)}` });
  }

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
