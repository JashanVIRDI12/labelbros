import type { Metadata } from "next";
import Link from "next/link";
import "../../order-process.css";
import { notFound } from "next/navigation";
import { BulkSlider } from "@/components/fx/BulkSlider";
import { LabelGallery } from "@/components/fx/LabelGallery";
import { StepStack } from "@/components/home/StepStack";
import { TapeMarquee } from "@/components/home/TapeMarquee";
import { Arrow } from "@/components/site/Arrow";
import { Crumbs } from "@/components/site/Crumbs";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { JsonLd } from "@/components/site/JsonLd";
import { Motion } from "@/components/site/Motion";
import { TrustStrip } from "@/components/site/Trust";
import { Configurator } from "@/components/store/Configurator";
import { ProductPhoto } from "@/components/store/ProductMedia";
import { pageMeta } from "@/lib/meta";
import { FINISHES, FORMATS, MATERIALS, SHAPES, SIZE_LIMITS, inch } from "@/lib/options";
import { priceIn } from "@/lib/pricing";
import { PRODUCTS, formatsOf, materialsOf, productBySlug, shapesOf, unitPriceUsd } from "@/lib/products";
import { BASE_URL, BRAND } from "@/lib/site";

/*
 * A product page, rebuilt 2026-11-12. The stage fits the photograph's proportions and stays
 * there while you choose: the photograph, or your label in 3D on an inch-grid liner, built from
 * every choice. The name, price and choices sit on the right, on a cream order sheet, and a buy
 * bar follows once they scroll away. Below: what it's for on running tape, what it is and its
 * specs, the bulk price slider (it sets the quantity above), how ordering works, and the rest of
 * the range on the curved shelf.
 */

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}
// every product page is built whole ahead of time (no loading placeholder that would shift the
// page), so a navigation waits for that page rather than streaming into a shell
export const instant = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = productBySlug((await params).slug);
  if (!p) return {};
  return pageMeta({ title: `${p.seo.title} · ${BRAND}`, description: p.seo.description, path: `/shop/${p.slug}`, image: p.image.src });
}

// The whole page is prerendered for every product (no loading placeholder, so nothing shifts).
export default async function ProductPage({ params }: { params: Params }) {
  return (
    <>
      <Header />
      <Product params={params} />
      <Footer />
    </>
  );
}

async function Product({ params }: { params: Params }) {
  const p = productBySlug((await params).slug);
  if (!p) notFound();
  const section = p.range === "labels" ? { name: "Labels", href: "/labels" } : { name: "Stickers", href: "/stickers" };
  const more = PRODUCTS.filter((x) => x.slug !== p.slug && x.range === p.range && x.kind === "custom");
  const lim = SIZE_LIMITS[p.range];
  const isDeal = p.kind === "deal";
  const finishes = [...new Set(materialsOf(p).flatMap((m) => MATERIALS[m].finishes))];
  const specs: [string, string][] = isDeal
    ? [
        ["Quantity", p.noArtwork ? "One pack" : `${p.defaults.qty} per pack`],
        ["Size", p.noArtwork ? "Assorted" : `${inch(p.defaults.w)} in`],
        ["Material", MATERIALS[p.defaults.material].label],
      ]
    : [
        ["Shapes", shapesOf(p).map((s) => SHAPES[s].label).join(", ")],
        ["Sizes", `Any width and height from ${inch(lim.min)} to ${inch(lim.max)} in`],
        ["Materials", materialsOf(p).map((m) => MATERIALS[m].label).join(", ")],
        ["Finishes", finishes.map((f) => FINISHES[f].label).join(", ")],
        ...(p.range === "labels" ? ([["Comes", formatsOf(p).map((f) => FORMATS[f].label).join(" or ")]] as [string, string][]) : []),
        ["Artwork", "Your file, our design, or send it after ordering"],
        ["Proof", "Free, checked by hand before every print"],
      ];
  // the running tape: what it's for, and what it comes on
  const on = isDeal
    ? []
    : [...materialsOf(p).map((m) => MATERIALS[m].label), ...finishes.map((f) => FINISHES[f].label), ...(p.range === "labels" ? formatsOf(p).map((f) => FORMATS[f].label) : []), "Any size"];
  const [lead, ...rest] = p.about;

  return (
    <>
      <main id="main" className="store pdp" data-motion-root>
        <Motion name="reveal" />
        <Motion name="magnet" />
        <section className="pdp-top" aria-labelledby="pdp-title">
          <Configurator
            p={p}
            media={<ProductPhoto p={p} priority sizes="(min-width: 1600px) 600px, (min-width: 1024px) 45vw, (min-width: 768px) 600px, 94vw" />}
            head={
              <div className="pdp-head">
                <Crumbs baseUrl={BASE_URL} trail={[section, { name: p.name, href: `/shop/${p.slug}` }]} />
                {p.badge && <p className="pdp-badge">{p.badge}</p>}
                <h1 id="pdp-title" className="pdp-title">
                  <span className="title-line">
                    <span>{p.name}</span>
                  </span>
                </h1>
                <p className="pdp-tagline">{p.tagline}</p>
              </div>
            }
          />
        </section>

        {on.length > 0 && <TapeMarquee a={p.uses} b={on} label={`${p.name} for ${p.uses.join(", ")}. ${on.join(", ")}.`} />}

        <section id="product-details" className="pdp-story" aria-labelledby="about-title">
          <h2 id="about-title" className="display sec-title" data-reveal>
            About {p.plural}.
          </h2>
          <div className="pdp-story-grid">
            <div className="pdp-story-copy">
              {lead && <p className="pdp-lead">{lead}</p>}
              {rest.map((t) => (
                <p key={t}>{t}</p>
              ))}
              {!on.length && (
                <ul className="pdp-made" aria-label="Made for">
                  {p.uses.map((u) => (
                    <li key={u}>{u}</li>
                  ))}
                </ul>
              )}
            </div>
            <dl className="pdp-specs">
              {specs.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {p.range === "labels" && p.kind === "custom" && <BulkSlider slug={p.slug} title="Need thousands? Bulk prices are built in." headingId="pdp-bulk-title" />}
        <StepStack
          title={p.noArtwork ? "Next, make it yours." : "How ordering works."}
          range={p.range}
          orderHref={p.noArtwork ? "/shop/custom-labels" : "#customize-order"}
          orderLabel={p.noArtwork ? "Start a custom order" : "Back to your order"}
        />
        <TrustStrip compact className="pdp-trust" />

        {more.length > 0 && (
          <section className="lg-sec pdp-more" aria-labelledby="more-title">
            <div className="lg-head">
              <h2 id="more-title" className="display lg-title" data-reveal>
                More {p.range}.
              </h2>
              <div className="lg-head-side">
                <p className="sec-lede">Drag the shelf, or pick one.</p>
                <Link href={section.href} className="text-link">
                  All {p.range}
                  <Arrow />
                </Link>
              </div>
            </div>
            <LabelGallery products={more} />
          </section>
        )}
      </main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          "@id": `${BASE_URL}/shop/${p.slug}#product`,
          url: `${BASE_URL}/shop/${p.slug}`,
          image: [new URL(p.image.src, BASE_URL).href, new URL(p.image.thumb, BASE_URL).href],
          sku: p.slug,
          category: section.name,
          description: p.seo.description,
          brand: { "@type": "Brand", name: BRAND },
          offers: {
            "@type": "Offer",
            priceCurrency: "CAD",
            price: priceIn(unitPriceUsd(p, p.defaults), "cad"),
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            url: `${BASE_URL}/shop/${p.slug}`,
          },
        }}
      />
    </>
  );
}
