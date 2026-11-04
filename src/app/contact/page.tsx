import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHero } from "@/components/sheet/PageHero";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { CONTACT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact · Label Bros",
  description:
    "Ask Label Bros about a file, a size, a finish or an order. Send a message and a person writes back by email, or get a quote in a minute.",
};

// the quickest answers, before writing to us
const SHORTCUTS = [
  { href: "/quote", title: "Get a quote", body: "Price it, add your artwork and send it in one go." },
  { href: "/how-it-works#faq", title: "Questions, answered", body: "Files, proofs, timing, shipping and reprints." },
  { href: "/#samples", title: "Order a sample kit", body: "Feel the finishes before you choose." },
  { href: "/services/custom-design", title: "Ask a designer", body: "No artwork yet? We draw it for you." },
];

export default function ContactPage() {
  const ways = [
    CONTACT.email && { label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    CONTACT.phone && { label: "Phone", value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/[^\d+]/g, "")}` },
    CONTACT.city && { label: "Studio", value: CONTACT.city },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  return (
    <>
      <Header current="/contact" />
      <main id="main">
        <PageHero
          id="contact-title"
          lines={["Talk to", "a person."]}
          lede="A question about a file, a size, a finish or an order? Send it here and a person writes back by email."
          facts={["Free proof before print", "Proof in 12–24 hours", "Prices in Canadian dollars"]}
        />
        <section aria-label="Contact us" className="cp">
          <div className="cp-card form-card">
            <h2 className="cp-title">Send a message</h2>
            <ContactForm />
          </div>
          <aside className="cp-aside" aria-labelledby="cp-faster">
            <h2 id="cp-faster" className="cp-aside-title">
              Faster answers
            </h2>
            <ul className="cp-links">
              {SHORTCUTS.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="cp-link">
                    <b>{s.title}</b>
                    <span>{s.body}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {ways.length > 0 && (
              <dl className="cp-ways">
                {ways.map((w) => (
                  <div key={w.label}>
                    <dt>{w.label}</dt>
                    <dd>{w.href ? <a href={w.href}>{w.value}</a> : w.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}
