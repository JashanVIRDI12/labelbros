import "server-only";
import { z } from "zod";
import { QUANTITIES, CUSTOM_QTY, FINISHES, PRODUCTS, SHAPES, SIZES, CUSTOM } from "@/components/sections/pricing-model";
import { FILES } from "@/lib/facts";
import { RECT_RATIO } from "@/components/sheet/sizes";
import { CURRENCIES, priceIn, priceSize, quotePrice, SAMPLE_KIT, type Currency } from "@/lib/facts";
import { BUSINESS_KINDS, BUSINESS_OFTEN, BUSINESS_VOLUME, CONTACT_TOPICS } from "@/lib/forms";

/*
 * What each public form may send, checked on the server whatever the browser did. Text is
 * trimmed and capped; anything unexpected is rejected. Prices are never taken from the browser:
 * `priceQuote` works them out again from the choices.
 */

const text = (max: number) => z.string().trim().max(max);
const optional = (max: number) => text(max).optional().transform((v) => v || undefined);
// one line only: no line breaks (they could forge email headers)
const line = (max: number) => text(max).regex(/^[^\r\n]*$/, "One line only");

const ids = <T extends { id: string }>(list: readonly T[]) => list.map((x) => x.id) as [string, ...string[]];

export const person = {
  name: line(120).min(1, "Tell us your name."),
  email: z.string().trim().toLowerCase().max(200).pipe(z.email("We need a valid email.")),
  phone: line(40).optional().transform((v) => v || undefined),
  company: line(160).optional().transform((v) => v || undefined),
};

const link = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((v) => v || undefined)
  .refine((v) => !v || /^https?:\/\/\S+$/i.test(v), "Paste the whole link, starting with https://");

const date = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || undefined)
  .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Pick a date.");

/** The quote as the builder sends it (the same fields as its URL). */
export const quoteSchema = z
  .object({
    product: z.enum(ids(PRODUCTS)),
    shape: z.enum(ids(SHAPES)),
    finish: z.enum(ids(FINISHES)),
    artwork: z.enum(["upload", "design"]),
    size: z.coerce.number().optional(),
    w: z.coerce.number().optional(),
    h: z.coerce.number().optional(),
    qty: z.coerce.number().int(),
  })
  .superRefine((q, ctx) => {
    const custom = q.size === undefined;
    if (!custom && !SIZES.includes(q.size!)) ctx.addIssue({ code: "custom", message: "Unknown size", path: ["size"] });
    if (custom) {
      for (const k of ["w", "h"] as const) {
        const v = q[k];
        if (v === undefined || v < CUSTOM.min || v > CUSTOM.max)
          ctx.addIssue({ code: "custom", message: `Size must be ${CUSTOM.min} to ${CUSTOM.max} inches`, path: [k] });
      }
    }
    if (!QUANTITIES.includes(q.qty) && (q.qty < CUSTOM_QTY.min || q.qty > CUSTOM_QTY.max))
      ctx.addIssue({ code: "custom", message: "Quantity out of range", path: ["qty"] });
  });
export type QuoteInput = z.infer<typeof quoteSchema>;

const label = (list: readonly { id: string; label: string }[], id: string) => list.find((x) => x.id === id)?.label ?? id;
const inches = (n: number) => String(Math.round(n * 100) / 100);

export const currencySchema = z.enum(CURRENCIES as [Currency, ...Currency[]]).catch("cad");

/** The price in cents (in the order's currency) and a plain description, worked out on the server. */
export function priceQuote(q: QuoteInput, cur: Currency) {
  // the same rule as the builder; a preset rectangle is size × size·RECT_RATIO, the others a square
  const w = q.size ?? q.w!;
  const h = q.size ? (q.shape === "rectangle" ? q.size * RECT_RATIO : q.size) : q.h!;
  const longest = priceSize(q.shape, w, h);
  const { total } = quotePrice(q.qty, longest, q.finish as "gloss" | "matte" | "holo", cur);
  const size = q.size ? `${inches(q.size)} in (longest side)` : `${inches(q.w!)} × ${inches(q.h!)} in`;
  const thing = q.product === "labels" ? "labels" : "stickers";
  const summary = `${q.qty.toLocaleString("en-CA")} ${label(SHAPES, q.shape).toLowerCase()} ${thing}, ${size}, ${label(FINISHES, q.finish).toLowerCase()}`;
  return { cents: Math.round(total * 100), summary };
}

export const kitPrice = (cur: Currency) => priceIn(SAMPLE_KIT.usd, cur) * 100;

const PHONE_NEEDED = "We need a phone number to call you about your design.";

/** The order form on /quote (sent with the quote fields above, plus an optional file). */
export const orderSchema = z.object({
  ...person,
  // required for orders: the shop calls when a design needs changes
  phone: z
    .string({ error: PHONE_NEEDED })
    .trim()
    .max(40)
    .regex(/^[^\r\n]*$/, "One line only")
    .regex(/\d(?:\D*\d){6}/, PHONE_NEEDED),
  needed: date,
  link,
  notes: optional(3000),
  mode: z.enum(["pay", "quote"]),
  currency: currencySchema,
});

export const contactSchema = z.object({
  kind: z.literal("contact"),
  name: person.name,
  email: person.email,
  topic: z.enum(ids(CONTACT_TOPICS)),
  order: line(40).optional().transform((v) => v || undefined),
  message: text(5000).min(2, "What would you like to ask?"),
});

export const businessSchema = z.object({
  kind: z.literal("business"),
  ...person,
  company: line(160).min(1, "Which business is it for?"),
  labels: z.array(z.enum(ids(BUSINESS_KINDS))).max(BUSINESS_KINDS.length).default([]),
  volume: z.enum(ids(BUSINESS_VOLUME)).optional(),
  often: z.enum(ids(BUSINESS_OFTEN)).optional(),
  needed: date,
  message: text(5000).min(2, "Tell us a little about the labels."),
});

export const messageSchema = z.discriminatedUnion("kind", [contactSchema, businessSchema]);

/** Artwork: the file types the site lists, up to the size limit. */
const EXTENSIONS = ["pdf", "ai", "eps", "svg", "png", "jpg", "jpeg", "tif", "tiff", "psd", "zip"];
export function checkFile(file: File, maxBytes: number): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!EXTENSIONS.includes(ext)) return `We take ${FILES} files. Send other files as a link.`;
  if (file.size > maxBytes) return `That file is over ${Math.round(maxBytes / 1e6)} MB. Add it as a link instead.`;
  if (file.size === 0) return "That file is empty.";
  return null;
}

/** A safe file name for storage and downloads. */
export const cleanName = (name: string) =>
  name.replace(/[^\w.\- ]+/g, "_").replace(/\s+/g, " ").trim().slice(-120) || "artwork";

/** Zod's errors as { field: first message }. */
export function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
