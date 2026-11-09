import Link from "next/link";
import { CURRENCY, SHIPPING } from "@/lib/facts";
import { Arrow } from "./Arrow";
import { BuyBar } from "./BuyBar";
import { Motion } from "./Motion";
import { SecondAsk } from "@/components/site/SecondAsk";
import { SAMPLE_KIT_ON } from "@/lib/site";

const COLUMNS = [
  {
    title: "Products",
    links: [
      { label: "Die-cut stickers", href: "/services/die-cut-stickers" },
      { label: "Holographic and glitter", href: "/services/holographic-glitter" },
      { label: "Kiss-cut sheets", href: "/services/kiss-cut-sheets" },
      { label: "Packaging seals", href: "/services/packaging-seals" },
      { label: "Roll labels", href: "/services/roll-labels" },
      { label: "Product labels", href: "/labels" },
      { label: "Business labels", href: "/business" },
    ],
  },
  {
    title: "Ordering",
    links: [
      { label: "Shop", href: "/shop" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Custom design", href: "/services/custom-design" },
      { label: "All services", href: "/services" },
      { label: "Order now", href: "/quote#pricing" },
      ...(SAMPLE_KIT_ON ? [{ label: "Sample kit", href: "/#samples" }] : []),
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Artwork guide", href: "/how-it-works#faq" },
      { label: "Questions", href: "/how-it-works#faq" },
      { label: "Contact us", href: "/contact" },
    ],
  },
];

/** The close: one more ask, the site map, and the wordmark stuck across the bottom. */
export function Footer() {
  return (
    <footer className="site-footer" data-motion-root>
      <Motion name="footer" />
      <div className="footer-top">
        <div>
          <h2 className="section-title max-w-[12ch]">Got something to stick?</h2>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/quote#pricing" className="btn btn-primary">
              Upload your design
              <Arrow />
            </Link>
            <SecondAsk />
          </div>
        </div>
        <nav aria-label="Footer" className="footer-nav">
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <h3 className="text-14 font-semibold text-liner-soft">{c.title}</h3>
              <ul className="mt-3 grid gap-1">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="nav-link inline-block">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="footer-mark" aria-hidden="true">
        <span className="footer-logo">Label Bros</span>
      </div>

      <div className="footer-legal text-14 text-liner-soft">
        <p>© 2026 Label Bros</p>
        <p>
          {CURRENCY}. {SHIPPING}.
        </p>
      </div>
      <BuyBar />
    </footer>
  );
}
