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
<<<<<<< Updated upstream
  city: "", // e.g. "Vancouver, BC"
=======
  address: "", // street, city, province and postal code
  city: "Bolton", // where the stickers are printed (the "Printed in Canada" mark)
  province: "", // whose laws the terms follow, e.g. "British Columbia"
  hours: "", // e.g. "Monday to Friday, 9 am to 5 pm Pacific"
  privacyOfficer: "", // the person who answers privacy questions (PIPEDA)
>>>>>>> Stashed changes
};

/*
 * The sample kit is switched off for now (client, 2026-11-09): its section, buttons and links are
 * hidden and its checkout is closed. Set this to true to bring it all back.
 */
export const SAMPLE_KIT_ON = true;
