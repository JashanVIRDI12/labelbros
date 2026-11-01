import Link from "next/link";
import { MobileMenu } from "./MobileMenu";

export const NAV = [
  { label: "Stickers", href: "#stickers" },
  { label: "Labels", href: "#labels" },
  { label: "Sample kit", href: "#samples" },
  { label: "How it works", href: "#process" },
];

/** The wordmark is itself a die-cut sticker: yellow face, white cut border. */
export function Logo() {
  return (
    <span className="logo">
      <span>Label</span> <span>Bros</span>
    </span>
  );
}

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-40 flex h-[clamp(64px,9svh,84px)] items-center justify-between gap-6 px-[var(--gutter)]">
      <Link href="/" aria-label="Label Bros, home" className="logo-link rounded-[10px]">
        <Logo />
      </Link>

      <nav aria-label="Main" className="hidden items-center gap-[clamp(18px,2.2vw,34px)] md:flex">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} className="nav-link">
            {item.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-3 md:gap-6">
        <a href="#signin" className="nav-link hidden lg:inline-block">
          Sign in
        </a>
        <a href="#pricing" className="btn btn-primary btn-sm">
          <span className="sm:hidden">Pricing</span>
          <span className="hidden sm:inline">Get instant pricing</span>
        </a>
        <MobileMenu items={NAV} />
      </div>
    </header>
  );
}
