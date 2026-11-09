import Link from "next/link";
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
export function Logo() {
  return (
    <span className="logo">
      <span>Label</span> <span>Bros</span>
    </span>
  );
}

/** `current`: the path of the page being shown, so its nav link is marked. */
export function Header({ current }: { current?: string }) {
  return (
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
      </div>
    </header>
  );
}
