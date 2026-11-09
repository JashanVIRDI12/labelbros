import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
import { Crumbs } from "@/components/service/Crumbs";
import { Arrow } from "@/components/site/Arrow";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { CURRENCY, PROOF, SHIPS } from "@/lib/facts";
import { PRODUCTS } from "@/lib/products";
import { BRAND } from "@/lib/site";

const DESCRIPTION = "Shop custom stickers and labels: ready-made packs at a fixed price, or pick your size and quantity. Upload your design or let us design it. Free proof before we print.";

export const metadata: Metadata = {
  title: `Shop custom stickers and labels · ${BRAND}`,
  description: DESCRIPTION,
  openGraph: { title: `Shop · ${BRAND}`, description: DESCRIPTION, type: "website" },
};

/* The shop: the packs first (a fixed price, the quickest buy), then everything you size yourself. */
export default function ShopPage() {
  const deals = PRODUCTS.filter((p) => p.kind === "deal");
  const custom = PRODUCTS.filter((p) => p.kind === "custom");
  return (
    <>
      <Header current="/shop" />
      <main id="main" className="shop">
        <section className="shop-hero" aria-labelledby="shop-title">
          <Crumbs trail={[{ name: "Shop", href: "/shop" }]} />
          <h1 id="shop-title" className="hero-title shop-title">
            <span className="title-line">
              <span style={{ ["--i" as string]: 0 }}>Shop</span>
            </span>{" "}
            <span className="title-line">
              <span style={{ ["--i" as string]: 1 }}>stickers.</span>
            </span>
          </h1>
          <ul className="shop-facts">
            <li>{PROOF}</li>
            <li>{SHIPS}</li>
            <li>{CURRENCY}</li>
          </ul>
        </section>

        <section className="shop-section" aria-labelledby="deals-title">
          <div className="shop-head">
            <h2 id="deals-title" className="shop-h2">
              Packs and deals
            </h2>
            <p>A fixed pack at one price. Pick the finish, add your design, done.</p>
          </div>
          <ul className="shop-grid">
            {deals.map((p) => (
              <li key={p.slug}>
                <ProductCard p={p} />
              </li>
            ))}
          </ul>
        </section>

        <section className="shop-section" aria-labelledby="custom-title">
          <div className="shop-head">
            <h2 id="custom-title" className="shop-h2">
              Build your own
            </h2>
            <p>Choose the shape, size, quantity and finish. The price follows every choice.</p>
          </div>
          <ul className="shop-grid">
            {custom.map((p) => (
              <li key={p.slug}>
                <ProductCard p={p} />
              </li>
            ))}
          </ul>
          <p className="shop-more">
            Need something else, like rolls, a custom shape or more than 1,000?{" "}
            <Link href="/quote#pricing" className="text-link">
              Use the full builder
              <Arrow />
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
