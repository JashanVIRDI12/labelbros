import Link from "next/link";
import { JsonLd, faqData } from "@/components/site/JsonLd";
import { CALL, FILES, INVOICE_MIN, PROOF, REPRINT, SHIPPING } from "@/lib/facts";
import { BULK_FROM, MIN_QTY, SIZE_LIMITS, inch } from "@/lib/options";
import { FaqBoard, type FaqItem } from "./FaqBoard";

/*
 * The questions people ask before a first order, answered once and used across the shop, shown as
 * an answer board (FaqBoard.tsx). Each may point to where to act on it. Answers with no
 * [[placeholders]] also go to search engines as FAQ data.
 */
export const FAQ: FaqItem[] = [
  {
    q: "How do I measure my label?",
    a: `Measure the flat area of your product where the label goes, width then height, in inches. Labels go from ${inch(SIZE_LIMITS.labels.min)} to ${inch(SIZE_LIMITS.labels.max)} inches. Type the size on the product page and the price follows; we check the fit when we send your proof.`,
    href: "/shop/custom-labels",
    link: "Type your size",
  },
  {
    q: "Roll labels or sheet labels?",
    a: "Rolls are fastest when you label a lot of products, by hand or with a label applicator; we confirm the core size and the direction they come off the roll with your proof. Sheets are tidy for small batches and peeling by hand. Both cost the same.",
    href: "/shop/roll-labels",
    link: "Shop roll labels",
  },
  {
    q: "Which material should I choose?",
    a: "White BOPP film is waterproof and wipes clean, so it suits food, drinks, the fridge and the bathroom. Clear BOPP gives the no-label look on glass. Paper and kraft suit dry goods, and uncoated paper takes a pen. Labels for the freezer, or for wet or curved surfaces? Say so in the notes and we confirm the right material with your proof.",
    href: "/shop/custom-labels",
    link: "Choose a material",
  },
  {
    q: "I don’t have a design. Can you make one?",
    a: `Yes. Choose “Design it for me” and tell us your idea: words, colours, style. A designer draws it and sends you a proof. ${CALL}.`,
    href: "/shop/custom-labels",
    link: "Start with “Design it for me”",
  },
  {
    q: "How is the price worked out?",
    a: "From three things: the size of the label, how many you order and the material. The more you order, the less each label costs. There are no setup fees or plate charges, and every order includes a free proof.",
    href: "/business",
    link: "See bulk prices",
  },
  {
    q: "Do you do bulk orders for businesses?",
    a: `Yes. Every label has bulk prices from ${BULK_FROM.toLocaleString("en-CA")}, and you can order up to 100,000 straight from the shop. Orders over $${INVOICE_MIN} can be paid by invoice. Bigger, or need many versions? Ask us for a quote.`,
    href: "/business",
    link: "Bulk & business",
  },
  {
    q: "How long does it take?",
    a: `${PROOF}. Your labels are then printed and shipped 2–4 business days after you approve it. ${SHIPPING}.`,
    href: "/how-it-works",
    link: "How it works",
  },
  {
    q: "What files can I send?",
    a: `${FILES}, up to 4 MB on the site. Bigger files? Choose “Send it later” and email them after ordering. We check every file by hand before it prints.`,
    href: "/how-it-works",
    link: "How it works",
  },
  {
    q: "What’s the smallest order?",
    a: `${MIN_QTY.labels} labels, or ${MIN_QTY.stickers} stickers.`,
    href: "/labels",
    link: "Shop labels",
  },
  {
    q: "What if something’s wrong?",
    a: `${REPRINT}.`,
    href: "/reprints",
    link: "Our reprint guarantee",
  },
];

export function Faq({ title = "Questions, answered." }: { title?: string }) {
  const data = faqData(FAQ);
  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <div className="fq-head">
        <h2 id="faq-title" className="display sec-title" data-reveal>
          {title}
        </h2>
        <p className="fq-lede">
          Still stuck? <Link href="/contact">Ask us</Link> and a person answers.
        </p>
      </div>
      <FaqBoard items={FAQ} />
      {data && <JsonLd data={data} />}
    </section>
  );
}
