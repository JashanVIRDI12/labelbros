import Link from "next/link";
import "../order-process.css";
import { Faq } from "@/components/home/Faq";
import { StepStack } from "@/components/home/StepStack";
import { Arrow } from "@/components/site/Arrow";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Motion } from "@/components/site/Motion";
import { CategoryHero } from "@/components/store/CategoryHero";
import { CALL, PROOF, SHIPS } from "@/lib/facts";
import { pageMeta } from "@/lib/meta";
import { BRAND } from "@/lib/site";

export const metadata = pageMeta({
  title: `How ordering works · ${BRAND}`,
  description: "Pick your label, type your size, upload your artwork or let us design it, approve a free proof, and we print and ship. Every file is checked by hand.",
  path: "/how-it-works",
});

const CHECKS = [
  { t: "It fits", b: "Your artwork matches the size and shape you ordered, with room for the cut." },
  { t: "It’s sharp", b: "Photos and logos have enough detail to print crisp at your size." },
  { t: "It reads", b: "Small print, ingredients and barcodes stay readable once printed." },
  { t: "The cut is right", b: "The cut line sits where it should, with nothing important near the edge." },
];

export default function HowPage() {
  return (
    <>
      <Header current="/how-it-works" />
      <main id="main" className="store" data-motion-root>
        <Motion name="reveal" />
        <CategoryHero
          trail={[{ name: "How it works", href: "/how-it-works" }]}
          title="How ordering works."
          lede="Pick a label and type your size, send your artwork or let us design it, approve a free proof, and we print and ship. You see the price before you pay."
          facts={[PROOF, SHIPS, "Every file checked by hand"]}
        />
        <StepStack title="Your label starts here." more={false} />

        <section className="checks" aria-labelledby="checks-title">
          <div className="sec-head">
            <h2 id="checks-title" className="display sec-title" data-reveal>
              What we check on every file.
            </h2>
            <p className="sec-lede">A person looks at every file before it goes to print. {CALL}, and nothing prints until you approve the proof.</p>
          </div>
          <ul className="checks-list">
            {CHECKS.map((c) => (
              <li key={c.t}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <b>{c.t}</b>
                <span>{c.b}</span>
              </li>
            ))}
          </ul>
          <div className="checks-cta">
            <Link href="/labels" className="btn btn-primary">
              Shop labels
              <Arrow />
            </Link>
            <Link href="/business" className="btn btn-ghost">
              Bulk pricing
            </Link>
          </div>
        </section>

        <Faq />
      </main>
      <Footer />
    </>
  );
}
