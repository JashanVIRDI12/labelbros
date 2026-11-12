/*
 * The site's public address, for structured data and canonical links. Set NEXT_PUBLIC_SITE_URL
 * when the domain is known; until then anything that needs an absolute URL is left out.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
export const BRAND = "Label Bros";

/**
 * The address canonical links and share cards are built on: NEXT_PUBLIC_SITE_URL when set, else
 * the production address Vercel provides, else the live Vercel site.
 */
export const BASE_URL =
  SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://labelbros.vercel.app");

/*
 * How to reach Label Bros. While a value is empty the site shows a visible [[PLACEHOLDER]] in its
 * place (client, 2026-11-09: the contact page, policies and trust strip name them); fill them in
 * here and every page follows.
 */
export const CONTACT = {
  legalName: "", // the registered business name, e.g. "Label Bros Printing Inc."
  email: "", // e.g. the shop's public inbox
  phone: "", // as it should be written, e.g. "604 555 0100"
  address: "", // street, city, province and postal code
  city: "Bolton", // where the stickers are printed (the "Printed in Canada" mark)
  province: "", // whose laws the terms follow, e.g. "British Columbia"
  hours: "", // e.g. "Monday to Friday, 9 am to 5 pm Pacific"
  privacyOfficer: "", // the person who answers privacy questions (PIPEDA)
};

const PH: Record<keyof typeof CONTACT, string> = {
  legalName: "LEGAL BUSINESS NAME",
  email: "EMAIL",
  phone: "PHONE",
  address: "ADDRESS",
  city: "CITY",
  province: "PROVINCE",
  hours: "BUSINESS HOURS",
  privacyOfficer: "PRIVACY OFFICER NAME",
};
/** A contact detail, or its [[PLACEHOLDER]] while it is still empty (render it with <Ph>). */
export const contactOr = (k: keyof typeof CONTACT) => CONTACT[k] || `[[${PH[k]}]]`;

/*
 * The sample kit is switched off for now (client, 2026-11-09): its section, buttons and links are
 * hidden and its checkout is closed. Set this to true to bring it all back.
 */
export const SAMPLE_KIT_ON = true;
