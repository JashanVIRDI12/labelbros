import Link from "next/link";
import { CURRENCY, SHIPPING } from "@/lib/facts";
import { BULK_FROM } from "@/lib/options";
import { DEALS, LABEL_PRODUCTS, SAMPLE_PACK, STICKER_PRODUCTS } from "@/lib/products";
import { contactOr } from "@/lib/site";
import { Arrow } from "./Arrow";
import { Motion } from "./Motion";
import { Ph } from "./Ph";
import { ShipTo } from "./ShipTo";
import { Signup } from "./Signup";
import { MapleLeaf, PayMarks } from "./Trust";

/*
 * The close: one last ask on the blue band, every product and page, the email sign-up, how you
 * can pay, and the wordmark stuck across the bottom like a strip of label tape.
 */

const COLUMNS = [
  {
    title: "Labels",
    links: [...LABEL_PRODUCTS.map((p) => ({ label: p.name, href: `/shop/${p.slug}` })), { label: "All labels", href: "/labels" }],
  },
  {
    title: "Stickers",
    links: [
      ...STICKER_PRODUCTS.map((p) => ({ label: p.name, href: `/shop/${p.slug}` })),
      ...DEALS.slice(0, 1).map((p) => ({ label: "Sticker deals", href: `/shop/${p.slug}` })),
      ...(SAMPLE_PACK ? [{ label: "Sample pack", href: `/shop/${SAMPLE_PACK.slug}` }] : []),
    ],
  },
  {
    title: "Business",
    links: [
      { label: "Bulk pricing", href: "/business" },
      { label: "Pay by invoice", href: "/business#invoice" },
      { label: "Large orders", href: "/business#quote" },
      { label: "Roll labels", href: "/shop/roll-labels" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Questions", href: "/how-it-works#faq" },
      { label: "Track my order", href: "/track" },
      { label: "Shipping", href: "/shipping" },
      { label: "Reprints and refunds", href: "/reprints" },
      { label: "Contact us", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="ftr" data-motion-root>
      <Motion name="footer" />
      <section className="ftr-cta" aria-labelledby="ftr-cta-title">
        <h2 id="ftr-cta-title" className="display ftr-cta-title">
          Your labels, ready for the shelf.
        </h2>
        <p className="ftr-cta-lede">
          Type your size, upload your artwork (or let us design it) and approve a free proof. Ordering {BULK_FROM.toLocaleString("en-CA")} or more? Bulk prices are built in.
        </p>
        <div className="ftr-cta-btns">
          <Link href="/labels" className="btn btn-primary">
            Shop labels
            <Arrow />
          </Link>
          <Link href="/business" className="btn btn-light">
            Bulk pricing
          </Link>
        </div>
      </section>

      <div className="ftr-main">
        <div className="ftr-brand">
          <p className="ftr-made">
            <MapleLeaf className="ftr-leaf" />
            <span>
              Printed in Canada · <Ph text={contactOr("city")} />
            </span>
          </p>
          <Signup />
        </div>
        <nav aria-label="Footer" className="ftr-nav">
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <h3 className="ftr-h">{c.title}</h3>
              <ul>
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="ftr-link">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="ftr-base">
        <PayMarks className="ftr-pay" />
        <ShipTo className="ftr-ship" />
        <p>
          © 2026 Label Bros · {CURRENCY}. {SHIPPING}.
        </p>
      </div>

      <div className="ftr-tape" aria-hidden="true" data-tape>
        <span>Label Bros</span>
      </div>
    </footer>
  );
}
