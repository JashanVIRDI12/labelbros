/*
 * The site's public address, for structured data and canonical links. Set NEXT_PUBLIC_SITE_URL
 * when the domain is known; until then anything that needs an absolute URL is left out.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
export const BRAND = "Label Bros";

/*
 * How to reach Label Bros. Leave a value empty and the site leaves that line out (nothing is
 * shown as a placeholder); fill them in and they appear on the contact page and in the footer.
 */
export const CONTACT = {
  email: "", // e.g. the shop's public inbox
  phone: "", // as it should be written, e.g. "604 555 0100"
  city: "", // e.g. "Vancouver, BC"
};
