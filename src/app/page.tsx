import Link from "next/link";
import { BulkSlider } from "@/components/fx/BulkSlider";
import { MaterialLab } from "@/components/fx/MaterialLab";
import { Hero } from "@/components/hero/Hero";
<<<<<<< Updated upstream
import { Labels } from "@/components/sections/Labels";
import { Pricing } from "@/components/sections/Pricing";
import { Process } from "@/components/sections/Process";
import { Products } from "@/components/sections/Products";
import { SampleKit } from "@/components/sections/SampleKit";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { SAMPLE_KIT_ON } from "@/lib/site";
=======
import { Faq } from "@/components/home/Faq";
import { FormatCards } from "@/components/home/FormatCards";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { StickerCards } from "@/components/home/StickerCards";
import { TapeMarquee } from "@/components/home/TapeMarquee";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Arrow } from "@/components/site/Arrow";
import { JsonLd } from "@/components/site/JsonLd";
import { Motion } from "@/components/site/Motion";
import { Reviews } from "@/components/site/Reviews";
import { TrustStrip } from "@/components/site/Trust";
import { ProductCard } from "@/components/store/ProductCard";
import { QuickPrice } from "@/components/store/QuickPrice";
import { LABEL_PRODUCTS, STICKER_PRODUCTS } from "@/lib/products";
import { BASE_URL, BRAND, CONTACT } from "@/lib/site";

// who we are, for search engines (only details the client has filled in)
const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND,
  url: BASE_URL,
  logo: `${BASE_URL}/icon.svg`,
  description: "Custom product labels on rolls and sheets for food, drinks, candles and cosmetics, and custom stickers. Bulk pricing for business. Printed in Canada.",
  areaServed: ["CA", "US"],
  ...(CONTACT.email ? { email: CONTACT.email } : {}),
  ...(CONTACT.phone ? { telephone: CONTACT.phone } : {}),
};
>>>>>>> Stashed changes

const byProduct = LABEL_PRODUCTS.filter((p) => p.group === "product");
const byFormat = LABEL_PRODUCTS.filter((p) => p.group === "format");

export default function Home() {
  return (
    <>
      <Header />
      <main id="main" className="store home" data-motion-root>
        <Motion name="reveal" />
        <Motion name="magnet" />
        <Hero />
<<<<<<< Updated upstream
        <Products />
        <Labels />
        <Process />
        <Pricing />
        {SAMPLE_KIT_ON && <SampleKit />}
=======
        <div className="qp-wrap">
          <QuickPrice />
        </div>
        <TapeMarquee />

        <section className="shelf-sec" aria-labelledby="by-product-title">
          <div className="sec-head">
            <h2 id="by-product-title" className="display sec-title" data-reveal>
              Labels for your product.
            </h2>
            <Link href="/labels" className="text-link">
              All labels
              <Arrow />
            </Link>
          </div>
          <ul className="grid-cards grid-cards-3">
            {byProduct.map((p) => (
              <li key={p.slug}>
                <ProductCard p={p} />
              </li>
            ))}
          </ul>
        </section>

        <FormatCards products={byFormat} />

        <MaterialLab />
        <BulkSlider />
        <ProcessSteps />
        <StickerCards products={STICKER_PRODUCTS} />

        <TrustStrip className="trust-home" />
        <Reviews />
        <Faq />
>>>>>>> Stashed changes
      </main>
      <Footer />
    </>
  );
}
