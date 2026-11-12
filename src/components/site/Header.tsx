import Link from "next/link";
<<<<<<< Updated upstream
import { SERVICES, serviceArt, serviceHref } from "@/components/service/services";
import { ART } from "@/components/stickers-page/art";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { MobileMenu } from "./MobileMenu";
import { ServicesMenu, type MenuService } from "./ServicesMenu";

// what the services dropdown needs (only this reaches the browser, not the whole service pages)
// kiss-cut sheets get a sticker of their own (their hero shares the seal with packaging seals)
const THUMB: Partial<Record<string, MenuService["art"]>> = { "kiss-cut-sheets": ART["new-burst"] };
const MENU: MenuService[] = SERVICES.map((s) => ({
  slug: s.slug,
  name: s.name,
  short: s.short,
  href: serviceHref(s.slug),
  art: THUMB[s.slug] ?? serviceArt(s).art,
}));

// Absolute paths, so the same header works on every page (on the homepage they only scroll).
export const NAV = [
  { label: "Shop", href: "/shop" },
  { label: "Stickers", href: "/stickers" },
  { label: "Labels", href: "/labels" },
  { label: "Business", href: "/business" },
  { label: "Services", href: "/services" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Contact", href: "/contact" },
];

/** The wordmark is itself a die-cut sticker: yellow face, white cut border. */
=======
import { CartDrawer } from "@/components/store/CartDrawer";
import { ProductThumb } from "@/components/store/ProductMedia";
import { PROOF, SHIPPING } from "@/lib/facts";
import { BULK_FROM } from "@/lib/options";
import { DEALS, LABEL_PRODUCTS, SAMPLE_PACK, STICKER_PRODUCTS, type Product } from "@/lib/products";
import { Arrow } from "./Arrow";
import { HeaderScroll } from "./HeaderScroll";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";

/*
 * The shop's header: a line of promises, then the logo, Labels and Stickers (each a menu of
 * every product), Bulk & business, How it works, and on the right Track order, the cart and
 * "Shop labels". It sticks to the top, tucks away as you scroll down and returns as you scroll
 * up. Phones get the same menus in a full-screen panel.
 */

/** The wordmark is itself a die-cut label: yellow face, white cut border. */
>>>>>>> Stashed changes
export function Logo() {
  return (
    <span className="logo">
      <span>Label</span> <span>Bros</span>
    </span>
  );
}

const PROMISES = [PROOF, `Bulk pricing from ${BULK_FROM.toLocaleString("en-CA")} labels`, SHIPPING, "Pay by card or business invoice"];

function MenuLink({ p }: { p: Product }) {
  return (
    <li>
      <Link href={`/shop/${p.slug}`} className="mm-item">
        <ProductThumb p={p} />
        <span>
          <b>{p.name}</b>
          <small>{p.tagline}</small>
        </span>
      </Link>
    </li>
  );
}

const byProduct = LABEL_PRODUCTS.filter((p) => p.group === "product");
const byFormat = LABEL_PRODUCTS.filter((p) => p.group === "format");

function LabelsPanel() {
  return (
    <div className="mm-grid">
      <div>
        <p className="mm-title">Labels for your product</p>
        <ul className="mm-list">
          {byProduct.map((p) => (
            <MenuLink key={p.slug} p={p} />
          ))}
        </ul>
      </div>
      <div>
        <p className="mm-title">By format</p>
        <ul className="mm-list">
          {byFormat.map((p) => (
            <MenuLink key={p.slug} p={p} />
          ))}
        </ul>
        <Link href="/labels" className="text-link mm-all">
          All labels
          <Arrow />
        </Link>
      </div>
      <Link href="/business" className="mm-feature">
        <b>Bulk labels, {BULK_FROM.toLocaleString("en-CA")} to 50,000+</b>
        <span>Order straight from the shop at bulk prices, pay by card or invoice.</span>
        <span className="mm-feature-go">
          Bulk pricing
          <Arrow />
        </span>
      </Link>
    </div>
  );
}

function StickersPanel() {
  return (
    <div className="mm-grid">
      <div>
        <p className="mm-title">Stickers by material</p>
        <ul className="mm-list">
          {STICKER_PRODUCTS.map((p) => (
            <MenuLink key={p.slug} p={p} />
          ))}
        </ul>
      </div>
      <div>
        <p className="mm-title">Sticker deals</p>
        <ul className="mm-list">
          {DEALS.map((p) => (
            <MenuLink key={p.slug} p={p} />
          ))}
          {SAMPLE_PACK && <MenuLink p={SAMPLE_PACK} />}
        </ul>
        <Link href="/stickers" className="text-link mm-all">
          All stickers
          <Arrow />
        </Link>
      </div>
      <Link href="/labels" className="mm-feature mm-feature-alt">
        <b>Product labels</b>
        <span>For food, drinks, candles and cosmetics, on rolls or sheets.</span>
        <span className="mm-feature-go">
          Shop labels
          <Arrow />
        </span>
      </Link>
    </div>
  );
}

/** `current`: the path of the page being shown, so its nav link is marked. */
export function Header({ current }: { current?: string }) {
  return (
<<<<<<< Updated upstream
    <header className="absolute inset-x-0 top-0 z-40 flex h-[clamp(64px,9svh,84px)] items-center justify-between gap-6 px-[var(--gutter)]">
      <Link href="/" aria-label="Label Bros, home" className="logo-link rounded-[10px]">
        <Logo />
      </Link>

      <nav aria-label="Main" className="hidden items-center gap-[clamp(18px,2.2vw,34px)] md:flex">
        {NAV.map((item) =>
          item.href === "/services" ? (
            <ServicesMenu key={item.href} items={MENU} current={current} />
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
              aria-current={item.href === current ? "page" : undefined}
            >
              {item.label}
            </Link>
          ),
        )}
      </nav>

      <div className="flex items-center gap-3 md:gap-6">
        <CartDrawer />
        <Link href="/shop" className="btn btn-primary btn-sm">
          <span className="sm:hidden">Order</span>
          <span className="hidden sm:inline">Order now</span>
        </Link>
        <MobileMenu items={NAV} services={MENU} current={current} />
=======
    <>
      <div className="announce" role="region" aria-label="Store promises">
        <ul className="announce-track">
          {[...PROMISES, ...PROMISES].map((t, i) => (
            <li key={i} aria-hidden={i >= PROMISES.length || undefined}>
              {t}
            </li>
          ))}
        </ul>
>>>>>>> Stashed changes
      </div>
      <header className="hdr" data-header>
        <div className="hdr-in">
          <Link href="/" aria-label="Label Bros, home" className="logo-link">
            <Logo />
          </Link>

          <nav aria-label="Main" className="hdr-nav">
            <MegaMenu label="Labels" href="/labels" current={current === "/labels"}>
              <LabelsPanel />
            </MegaMenu>
            <MegaMenu label="Stickers" href="/stickers" current={current === "/stickers"}>
              <StickersPanel />
            </MegaMenu>
            <Link href="/business" className="hdr-link" aria-current={current === "/business" ? "page" : undefined}>
              Bulk &amp; business
            </Link>
            <Link href="/how-it-works" className="hdr-link" aria-current={current === "/how-it-works" ? "page" : undefined}>
              How it works
            </Link>
          </nav>

          <div className="hdr-tools">
            <Link href="/track" className="hdr-icon" aria-label="Track order" aria-current={current === "/track" ? "page" : undefined}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z M3.5 7.5 12 12l8.5-4.5M12 12v9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              </svg>
              <span className="hdr-icon-text">Track order</span>
            </Link>
            <CartDrawer />
            <Link href="/labels" className="btn btn-primary btn-sm hdr-cta">
              Shop labels
            </Link>
            <MobileMenu>
              <nav aria-label="Main" className="mob-nav">
                <details className="mob-group" open>
                  <summary>
                    <Link href="/labels">Labels</Link>
                  </summary>
                  <ul className="mm-list">
                    {[...byProduct, ...byFormat].map((p) => (
                      <MenuLink key={p.slug} p={p} />
                    ))}
                  </ul>
                </details>
                <details className="mob-group">
                  <summary>
                    <Link href="/stickers">Stickers</Link>
                  </summary>
                  <ul className="mm-list">
                    {[...STICKER_PRODUCTS, ...DEALS, ...(SAMPLE_PACK ? [SAMPLE_PACK] : [])].map((p) => (
                      <MenuLink key={p.slug} p={p} />
                    ))}
                  </ul>
                </details>
                <ul className="mob-links">
                  <li>
                    <Link href="/business">Bulk &amp; business</Link>
                  </li>
                  <li>
                    <Link href="/how-it-works">How it works</Link>
                  </li>
                  <li>
                    <Link href="/track">Track my order</Link>
                  </li>
                  <li>
                    <Link href="/contact">Contact us</Link>
                  </li>
                </ul>
                <Link href="/labels" className="btn btn-primary mob-cta">
                  Shop labels
                  <Arrow />
                </Link>
              </nav>
            </MobileMenu>
          </div>
        </div>
      </header>
      <HeaderScroll />
    </>
  );
}
