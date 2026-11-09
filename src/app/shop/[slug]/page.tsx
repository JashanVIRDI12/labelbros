import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductArt } from "@/components/shop/ProductArt";
import { ProductBuy } from "@/components/shop/ProductBuy";
import { ProductCard } from "@/components/shop/ProductCard";
import { Crumbs } from "@/components/service/Crumbs";
import { JsonLd } from "@/components/service/JsonLd";
import { Steps } from "@/components/service/Steps";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { fromPriceUsd, PRODUCTS, productBySlug } from "@/lib/products";
import { priceIn } from "@/lib/facts";
import { BRAND, SITE_URL } from "@/lib/site";

/*
 * A product page, shop style: the picture on the left (it stays in view on wide screens), the
 * name and the buy panel on the right, then what's included, how ordering works and more packs.
 */

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = productBySlug((await params).slug);
  if (!p) return {};
  return {
    title: `${p.name} · ${BRAND}`,
    description: `${p.tagline} ${p.about[1] ?? ""}`.trim(),
    openGraph: { title: `${p.name} · ${BRAND}`, description: p.tagline, type: "website" },
  };
}

export default function ProductPage({ params }: { params: Params }) {
  // the address is read inside the boundary (Partial Prefetching): header and footer stay instant
  return (
    <>
      <Header current="/shop" />
      <Suspense fallback={<main id="main" className="prod prod-loading" />}>
        <Product params={params} />
      </Suspense>
      <Footer />
    </>
  );
}

async function Product({ params }: { params: Params }) {
  const p = productBySlug((await params).slug);
  if (!p) notFound();
  const more = PRODUCTS.filter((x) => x.slug !== p.slug && (x.kind === p.kind || x.product === p.product)).slice(0, 4);

  return (
    <>
      <main id="main" className="prod">
        <div className="prod-crumbs">
          <Crumbs trail={[{ name: "Shop", href: "/shop" }, { name: p.name, href: `/shop/${p.slug}` }]} />
        </div>
        <section className="prod-top" aria-labelledby="prod-title">
          <div className="prod-media">
            <ProductArt p={p} large />
          </div>
          <div className="prod-panel">
            {p.badge && <p className="prod-badge">{p.badge}</p>}
            <h1 id="prod-title" className="prod-title">
              {p.name}
            </h1>
            <p className="prod-tagline">{p.tagline}</p>
            <ProductBuy p={p} />
          </div>
        </section>

        <section className="prod-about" aria-labelledby="about-title">
          <div>
            <h2 id="about-title" className="section-title">
              What you get.
            </h2>
            {p.about.map((t) => (
              <p key={t} className="prod-para">
                {t}
              </p>
            ))}
          </div>
          <ul className="prod-facts">
            {p.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>

        <Steps />

        {more.length > 0 && (
          <section className="shop-section prod-more" aria-labelledby="more-title">
            <div className="shop-head">
              <h2 id="more-title" className="shop-h2">
                You might also like
              </h2>
            </div>
            <ul className="shop-grid">
              {more.map((x) => (
                <li key={x.slug}>
                  <ProductCard p={x} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          description: p.tagline,
          brand: { "@type": "Brand", name: BRAND },
          offers: {
            "@type": "Offer",
            priceCurrency: "CAD",
            price: priceIn(fromPriceUsd(p), "cad"),
            availability: "https://schema.org/InStock",
            ...(SITE_URL ? { url: `${SITE_URL}/shop/${p.slug}` } : {}),
          },
        }}
      />
    </>
  );
}
