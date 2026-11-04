/*
 * Sending the quote and contact forms with EmailJS, straight from the browser (no server).
 * Set these in the environment (the values are public by design; the domain allowlist in the
 * EmailJS dashboard keeps them for this site):
 *   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY          Account > API keys > Public key
 *   NEXT_PUBLIC_EMAILJS_SERVICE_ID          Email Services > the service's ID
 *   NEXT_PUBLIC_EMAILJS_QUOTE_TEMPLATE_ID   the template for quote requests
 *   NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID the template for contact messages
 *   NEXT_PUBLIC_EMAILJS_ATTACHMENT_KB       optional: attach artwork up to this size (KB); the
 *                                           template needs a "Form file attachment" named
 *                                           "artwork", and the plan must allow attachments.
 *                                           Unset or 0: files are named in the email, not sent.
 * The template variables each form sends are listed in reference/EMAILJS.md.
 */

const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "";
const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "";
const TEMPLATES = {
  quote: process.env.NEXT_PUBLIC_EMAILJS_QUOTE_TEMPLATE_ID ?? "",
  contact: process.env.NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID ?? "",
};
/** The largest artwork file sent with a quote, in bytes (0: never attached). */
export const ATTACH_LIMIT = Math.max(0, Number(process.env.NEXT_PUBLIC_EMAILJS_ATTACHMENT_KB ?? 0) || 0) * 1024;

export type Template = keyof typeof TEMPLATES;

/** Is sending set up for this form? */
export const canSend = (template: Template) => Boolean(PUBLIC_KEY && SERVICE_ID && TEMPLATES[template]);

export class NotConnected extends Error {}

/** Send one email: the fields become the template's variables; `file` goes as "artwork". */
export async function sendEmail(template: Template, fields: Record<string, string>, file?: File | null) {
  if (!canSend(template)) throw new NotConnected("EmailJS is not configured");
  const body = new FormData();
  body.append("service_id", SERVICE_ID);
  body.append("template_id", TEMPLATES[template]);
  body.append("user_id", PUBLIC_KEY);
  for (const [k, v] of Object.entries(fields)) body.append(k, v);
  if (file) body.append("artwork", file, file.name);
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send-form", { method: "POST", body });
  if (!res.ok) throw new Error(`EmailJS ${res.status}: ${await res.text()}`);
}
