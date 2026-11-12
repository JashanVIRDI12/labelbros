import type { Metadata } from "next";
import { PolicyPage, type PolicySection } from "@/components/policy/PolicyPage";
import { APPROVAL, CURRENCY, NO_REFUND, PROOF, RUSH, SHIPS_LONG } from "@/lib/facts";
import { pageMeta } from "@/lib/meta";
import { BRAND, contactOr } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: `Terms of sale · ${BRAND}`,
  description:
    "The terms for ordering custom stickers and labels from Label Bros: proofs and approval, your artwork, prices in CAD or USD, payment, production, delivery and cancellations.",
  path: "/terms",
});

const SECTIONS: PolicySection[] = [
  {
    id: "who",
    title: "Who you're dealing with",
    blocks: [
      `These terms are between you and ${BRAND} (${contactOr("legalName")}), ${contactOr("address")}. When you order, you agree to them and to our [Shipping policy](/shipping), [Reprints and refunds](/reprints) and [Privacy policy](/privacy).`,
    ],
  },
  {
    id: "ordering",
    title: "Ordering",
    blocks: [
      [
        "You order by checking out on this site. Payment is taken at checkout.",
        "Your order is confirmed when Stripe confirms your payment and we email you.",
        "We can refuse or cancel an order, with a full refund, if we can't print it: for example artwork you don't have the rights to, or content that is hateful or illegal.",
      ],
    ],
  },
  {
    id: "proofs",
    title: "Proofs and approval",
    blocks: [
      [
        `${PROOF}. Nothing prints until you approve it.`,
        `${APPROVAL}.`,
        "Check your proof carefully: spelling, colours, size and cut line. Once you approve it, it is final. Mistakes in a proof you approved don't count as defects.",
        "Colours on a screen and in print always differ a little. We match your colours as closely as the material allows.",
      ],
    ],
  },
  {
    id: "artwork",
    title: "Your artwork",
    blocks: [
      [
        "You confirm that you own, or have permission to use, everything you send us.",
        "You keep all rights to your artwork. You let us use it to make your order, and nothing else unless you say yes.",
        "If our designers make your artwork, design work is billed separately from printing, even if the design is not printed in the end. [[CONFIRM: who owns artwork our designers make]]",
      ],
    ],
  },
  {
    id: "prices",
    title: "Prices and currency",
    blocks: [
      `${CURRENCY}, in whole dollars. Tax (GST, HST or PST) and shipping are added at checkout.`,
      "Prices can change, but the price you paid at checkout is the price of your order.",
    ],
  },
  {
    id: "payment",
    title: "Payment",
    blocks: ["Payments are processed by Stripe: cards, Apple Pay, Google Pay and Link. We never see your full card number."],
  },
  {
    id: "production",
    title: "Production and delivery",
    blocks: [
      `${SHIPS_LONG}. ${RUSH}.`,
      "Delivery times and costs are on our [Shipping policy](/shipping). Dates are estimates, and we're not responsible for delays caused by carriers, customs or weather.",
    ],
  },
  {
    id: "changes-cancel",
    title: "Changing or cancelling",
    blocks: [
      [
        "Before you approve your proof, you can change your order or cancel it for a full refund. [[CONFIRM: design fee kept if we already designed it]]",
        `Once you approve your proof, production starts and the order can't be cancelled. ${NO_REFUND}.`,
      ],
    ],
  },
  {
    id: "problems",
    title: "If something's wrong",
    blocks: ["Our [reprint guarantee](/reprints) covers our mistakes and damage in transit."],
  },
  {
    id: "liability",
    title: "Our responsibility",
    blocks: [
      "If we make a mistake, we reprint your order or refund it. Beyond that, as far as the law allows, our responsibility is limited to the amount you paid for the order.",
      "Nothing in these terms takes away rights you have under the consumer protection laws of your province.",
    ],
  },
  {
    id: "law",
    title: "Law",
    blocks: [`These terms follow the laws of ${contactOr("province")} and of Canada.`],
  },
  {
    id: "updates",
    title: "Changes to these terms",
    blocks: ["When we change these terms we update the date at the top. The terms in place when you ordered apply to that order."],
  },
];

export default function TermsPage() {
  return (
    <PolicyPage
      path="/terms"
      name="Terms"
      lines={["The fine", "print."]}
      lede="What you can expect from us when you order, and what we ask of you: proofs, artwork, prices, payment, production and cancellations."
      facts={["Nothing prints until you approve", "CAD in Canada, USD elsewhere", "Plain English"]}
      sections={SECTIONS}
    />
  );
}
