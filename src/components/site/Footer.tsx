import { Arrow } from "./Arrow";
import { Motion } from "./Motion";

const COLUMNS = [
  {
    title: "Products",
    links: [
      { label: "Die-cut stickers", href: "#stickers" },
      { label: "Holographic and glitter", href: "#stickers" },
      { label: "Packaging seals", href: "#stickers" },
      { label: "Product labels", href: "#labels" },
      { label: "Business labels", href: "#product-labels" },
    ],
  },
  {
    title: "Ordering",
    links: [
      { label: "How it works", href: "#process" },
      { label: "Instant pricing", href: "#pricing" },
      { label: "Sample kit", href: "#samples" },
      { label: "Artwork guide", href: "#[[ARTWORK_GUIDE_URL]]" },
      { label: "Questions", href: "#[[FAQ_URL]]" },
    ],
  },
  {
    title: "Label Bros",
    links: [
      { label: "About", href: "#[[ABOUT_URL]]" },
      { label: "Contact", href: "#[[CONTACT_URL]]" },
      { label: "Sign in", href: "#signin" },
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
            <a href="#pricing" className="btn btn-primary">
              Get instant pricing
              <Arrow />
            </a>
            <a href="#samples" className="btn btn-secondary">
              Order a sample kit
            </a>
          </div>
        </div>
        <nav aria-label="Footer" className="footer-nav">
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <h3 className="text-14 font-semibold text-liner-soft">{c.title}</h3>
              <ul className="mt-3 grid gap-1">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="nav-link inline-block">
                      {l.label}
                    </a>
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
        <p className="ph">[[Company address]]</p>
        <p>
          <a href="#[[PRIVACY_URL]]" className="underline underline-offset-4">
            Privacy
          </a>
          {" · "}
          <a href="#[[TERMS_URL]]" className="underline underline-offset-4">
            Terms
          </a>
        </p>
      </div>
    </footer>
  );
}
