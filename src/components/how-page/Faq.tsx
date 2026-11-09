import Link from "next/link";
import { quoteHref } from "@/components/sheet/quote";
import { Arrow } from "@/components/site/Arrow";
import { SecondAsk } from "@/components/site/SecondAsk";
import { SAMPLE_KIT_ON } from "@/lib/site";

/*
 * "Questions, answered": the doubts people have before they order, each a cream label you open
 * (native <details>). Prices and terms follow src/lib/facts.ts.
 */

const QUESTIONS: { q: string; a: React.ReactNode }[] = [
  {
    q: "How much will it cost?",
    a: (
      <>
        Upload your design, pick a shape, size, quantity and finish, and you see the price straight away.{" "}
        <Link href={quoteHref("stickers", { shape: "die-cut" })} className="faq-link">
          Upload your design
        </Link>
      </>
    ),
  },
  {
    q: "Do I see it before you print?",
    a: "Yes. You get a free proof to check, and nothing prints until you approve it.",
  },
  {
    q: "Can I change the proof?",
    a: (
      <>
        Yes. Tell us what to change and we send a new proof, and if we spot something in your design that needs fixing,
        we call you to talk it through. Ask for changes until you are happy with it.
      </>
    ),
  },
  {
    q: "I only have an idea. Can you design it?",
    a: (
      <>
        Yes. Send a sketch or a few words and our designers make the artwork. Design work is billed separately from
        printing, even if the design is not printed in the end.
      </>
    ),
  },
  {
    q: "What files can I send?",
    a: "PDF, AI, EPS, SVG, PNG, JPG, TIF or PSD. Vector files print sharpest; for photos and pixel art, send 300 dpi at the size you want. Several designs? Put them in one ZIP file.",
  },
  {
    q: "How long does it take?",
    a: (
      <>
        Your free proof arrives in 12–24 hours. Once you approve it, your order is printed and shipped in 2–4
        business days. In a hurry? Next-day production is available.
      </>
    ),
  },
  {
    q: "Where do you ship, and what does it cost?",
    a: "Shipping is free in Canada on orders over $100. We also ship to the US and worldwide, by UPS or FedEx, at an extra charge.",
  },
  {
    q: "What if something is wrong when it arrives?",
    a: "Tell us within 72 hours of delivery, with your order number and photos, and we reprint it free. Custom prints cannot be refunded once production starts, and errors in artwork you approved on the proof are not counted as defects.",
  },
  ...(SAMPLE_KIT_ON
    ? [
        {
          q: "Can I feel the materials first?",
          a: (
            <>
              Yes. Order a sample kit: real stickers and labels in our finishes, sent to your door.{" "}
              <Link href="/#samples" className="faq-link">
                Order a sample kit
              </Link>
            </>
          ),
        },
      ]
    : []),
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="faq">
      <div className="faq-intro">
        <h2 id="faq-title" className="section-title">
          Questions, answered.
        </h2>
        <p className="faq-lede">Still not sure? Upload your design and see your price in a minute, or let us design it for you.</p>
        <div className="faq-ctas">
          <Link href={quoteHref("stickers", { shape: "die-cut" })} className="btn btn-primary">
            Upload your design
            <Arrow />
          </Link>
          <SecondAsk />
        </div>
      </div>
      <div className="faq-list">
        {QUESTIONS.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>
              <span>{item.q}</span>
              <i className="faq-mark" aria-hidden="true" />
            </summary>
            <div className="faq-answer">
              <p>{item.a}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
