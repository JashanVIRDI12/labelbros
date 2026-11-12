import type { Metadata } from "next";
import { PolicyPage, type PolicySection } from "@/components/policy/PolicyPage";
import { NO_REFUND, PROOF, REPRINT_WINDOW } from "@/lib/facts";
import { pageMeta } from "@/lib/meta";
import { BRAND } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: `Reprints and refunds · ${BRAND}`,
  description: `Label Bros' reprint guarantee: if your stickers or labels arrive misprinted, miscut or damaged, tell us within ${REPRINT_WINDOW} and we reprint them free. What's covered, and how refunds work.`,
  path: "/reprints",
});

const SECTIONS: PolicySection[] = [
  {
    id: "promise",
    title: "Our reprint guarantee",
    blocks: [
      "If your stickers or labels arrive misprinted, miscut, damaged, or different from the proof you approved, we reprint them free. If we can't make it right, we refund you. [[CONFIRM: refund when a reprint can't fix it]]",
    ],
  },
  {
    id: "how",
    title: "How to ask for a reprint",
    blocks: [
      {
        steps: [
          `Within ${REPRINT_WINDOW} of delivery, [contact us](/contact) with your order number (it starts with LB-).`,
          "Add a few photos that show the problem.",
          "We reply within [[RESPONSE TIME, e.g. one business day]] and, if it's on us, reprint it free.",
        ],
      },
    ],
  },
  {
    id: "covered",
    title: "What's covered",
    blocks: [
      [
        "Printing defects: streaks, smudges, or colours far from your approved proof.",
        "Cutting errors: cut through your design, or in the wrong shape.",
        "Damage in transit.",
        "The wrong product, size, finish or quantity.",
      ],
    ],
  },
  {
    id: "not-covered",
    title: "What isn't",
    blocks: [
      [
        "Mistakes in a proof you approved: spelling, colours, layout or size.",
        "The small colour differences between screens and print.",
        "Problems reported more than " + REPRINT_WINDOW + " after delivery.",
        "Wear from using a sticker or label somewhere its material isn't made for. [[CONFIRM]]",
      ],
      `That's why every order starts with a proof: ${PROOF.toLowerCase()}, and nothing prints until you approve it.`,
    ],
  },
  {
    id: "refunds",
    title: "Refunds and cancellations",
    blocks: [
      [
        "**Before you approve your proof:** cancel any time for a full refund. [[CONFIRM: design fee kept if we already designed it]]",
        `**Once production starts:** ${NO_REFUND.toLowerCase()}, because they're made for you alone. The guarantee above still covers our mistakes.`,
        "Refunds go back to the card or wallet you paid with, through Stripe. They usually appear within 5–10 business days.",
      ],
    ],
  },
];

export default function ReprintsPage() {
  return (
    <PolicyPage
      path="/reprints"
      name="Reprints and refunds"
      lines={["We get it", "right."]}
      lede="If your order arrives wrong, we make it right: a free reprint for our mistakes and for damage in transit."
      facts={[`Tell us within ${REPRINT_WINDOW}`, "Free reprint for our mistakes", "Free proof before every print"]}
      sections={SECTIONS}
    />
  );
}
