import type { Metadata } from "next";
import { PolicyPage, type PolicySection } from "@/components/policy/PolicyPage";
import { pageMeta } from "@/lib/meta";
import { BRAND, contactOr } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: `Privacy policy · ${BRAND}`,
  description:
    "What Label Bros collects when you order or write to us, why, who helps us handle it, how long we keep it, and how to see, fix or delete it. Written for Canadian privacy law (PIPEDA).",
  path: "/privacy",
});

const SECTIONS: PolicySection[] = [
  {
    id: "who",
    title: "Who we are",
    blocks: [
      `${BRAND} (${contactOr("legalName")}) prints custom stickers and labels. This policy explains how we handle personal information, following Canada's Personal Information Protection and Electronic Documents Act (PIPEDA).`,
      `Our privacy officer is responsible for it and answers every question about your information: ${contactOr("privacyOfficer")}, ${contactOr("email")}, ${contactOr("address")}.`,
    ],
  },
  {
    id: "collect",
    title: "What we collect",
    blocks: [
      [
        "**When you order:** your name, email, phone number and shipping address. Stripe collects these on its checkout page and passes them to us.",
        "**Your order:** the products, sizes and finishes you chose, your artwork files and any notes.",
        "**When you write to us:** what you send through the contact and business forms.",
        "**If you sign up for our emails:** your email address, the words you agreed to, and when.",
        "**To keep the site safe:** a scrambled (hashed) form of your IP address, used to stop spam and abuse. We never store the address itself.",
      ],
      "**Payments:** cards, Apple Pay, Google Pay and Link are handled by Stripe on its own secure page. We never see or store your full card number.",
    ],
  },
  {
    id: "why",
    title: "Why we use it",
    blocks: [
      [
        "To make your order, send your proof, and call you if your design needs changes.",
        "To ship your order and tell you where it is.",
        "To answer your messages.",
        "To keep the records that tax law requires.",
        "To keep the site secure and stop fraud.",
        "To send you news and offers, only if you said yes.",
      ],
      "We only use your information for the reason you gave it to us, or one you'd reasonably expect.",
    ],
  },
  {
    id: "consent",
    title: "Your consent",
    blocks: [
      "When you order or write to us, you agree to us using your information for that purpose. Marketing emails need your express consent (Canada's anti-spam law, CASL), and every one has an unsubscribe link.",
      "You can withdraw your consent at any time. We then stop, except for records the law makes us keep, such as tax records.",
    ],
  },
  {
    id: "share",
    title: "Who helps us",
    blocks: [
      "We don't sell or rent your information. We share it only with the companies that help us run the shop, and only what each one needs:",
      [
        "**Stripe:** payments and fraud checks.",
        "**Vercel:** hosts this website.",
        "**Neon:** our order database.",
        "**[[EMAIL PROVIDER]]:** sends our emails.",
        "**[[CANADA CARRIERS]], UPS and FedEx:** deliver your order.",
      ],
      "Some of these companies store information outside Canada, mostly in the United States, where the courts and authorities there may be able to access it. We choose providers who protect it to a standard comparable to Canadian law.",
    ],
  },
  {
    id: "keep",
    title: "How long we keep it",
    blocks: [
      [
        "**Orders and payments:** as long as Canadian tax law requires (generally six years).",
        "**Artwork files:** [[ARTWORK RETENTION, e.g. 2 years]] after your order, so reorders are easy. Ask and we delete them sooner.",
        "**Messages:** [[MESSAGE RETENTION, e.g. 2 years]].",
        "**Email sign-ups:** until you unsubscribe. We keep a record that you did, so we never email you again by mistake.",
        "**Security records:** two days, then deleted.",
      ],
    ],
  },
  {
    id: "cookies",
    title: "Cookies and your browser",
    blocks: [
      [
        "**lb_cur:** remembers whether you see prices in Canadian or US dollars, for a year.",
        "**Your cart:** saved in your own browser, so it survives a reload. It stays on your device until you check out.",
        "**Our team's sign-in:** a cookie for the back office only.",
      ],
      "We don't use advertising or tracking cookies. Stripe's checkout page sets its own cookies to process payments safely; see [Stripe's privacy policy](https://stripe.com/privacy).",
    ],
  },
  {
    id: "rights",
    title: "See, fix or delete your information",
    blocks: [
      `Ask our privacy officer (${contactOr("email")}) for a copy of what we hold about you, to correct it, or to delete it. We answer within 30 days. If we have to keep something, for example a tax record, we tell you what and why.`,
    ],
  },
  {
    id: "safe",
    title: "How we protect it",
    blocks: [
      [
        "Encrypted connections (HTTPS) on every page.",
        "Payments on Stripe's own secure page.",
        "A password-protected back office that only our team can open; artwork files can only be downloaded there.",
      ],
      "If a breach of our safeguards creates a real risk of significant harm to you, we tell you and the Office of the Privacy Commissioner of Canada, as the law requires.",
    ],
  },
  {
    id: "concerns",
    title: "Concerns",
    blocks: [
      "Talk to us first and we'll do our best to fix it. If you're not satisfied, you can complain to the [Office of the Privacy Commissioner of Canada](https://www.priv.gc.ca).",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    blocks: ["When we change this policy we update the date at the top. If a change matters to how we use your information, we say so on the site."],
  },
];

export default function PrivacyPage() {
  return (
    <PolicyPage
      path="/privacy"
      name="Privacy"
      lines={["Your info,", "kept tight."]}
      lede="What we collect when you order or write to us, why, who helps us handle it, and how to see, fix or delete it. In plain English."
      facts={["Canadian privacy law (PIPEDA)", "We never see your card number", "No ad or tracking cookies"]}
      sections={SECTIONS}
    />
  );
}
