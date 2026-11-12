import "server-only";
import { z } from "zod";
import { FILES } from "@/lib/facts";
import { CURRENCIES, type Currency } from "@/lib/facts";
import { BUSINESS_KINDS, BUSINESS_OFTEN, BUSINESS_VOLUME, CONTACT_TOPICS } from "@/lib/forms";

/*
 * What each public form may send, checked on the server whatever the browser did. Text is
 * trimmed and capped; anything unexpected is rejected. Prices are never taken from the browser
 * (the cart is priced again in /api/checkout from lib/products.ts).
 */

const text = (max: number) => z.string().trim().max(max);
// one line only: no line breaks (they could forge email headers)
const line = (max: number) => text(max).regex(/^[^\r\n]*$/, "One line only");

const ids = <T extends { id: string }>(list: readonly T[]) => list.map((x) => x.id) as [string, ...string[]];

export const person = {
  name: line(120).min(1, "Tell us your name."),
  email: z.string().trim().toLowerCase().max(200).pipe(z.email("We need a valid email.")),
  phone: line(40).optional().transform((v) => v || undefined),
  company: line(160).optional().transform((v) => v || undefined),
};

const date = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || undefined)
  .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Pick a date.");

export const currencySchema = z.enum(CURRENCIES as [Currency, ...Currency[]]).catch("cad");

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
