import { BulkBand } from "@/components/home/BulkBand";
import { Faq } from "@/components/home/Faq";
import { Materials } from "@/components/home/Materials";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Motion } from "@/components/site/Motion";
import { CategoryHero } from "@/components/store/CategoryHero";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ProductShowcase } from "@/components/store/ProductShowcase";
import { QuickPrice } from "@/components/store/QuickPrice";
import { PROOF, SHIPS } from "@/lib/facts";
import { pageMeta } from "@/lib/meta";
import { BULK_FROM } from "@/lib/options";
import { LABEL_PRODUCTS } from "@/lib/products";
import { BRAND } from "@/lib/site";

export const metadata = pageMeta({
  title: `Custom product labels on rolls and sheets · ${BRAND}`,
  description: "Custom labels for food, drinks, candles, coffee and cosmetics. Any shape and size, waterproof BOPP, paper, kraft or metallic, on rolls or sheets. Bulk pricing from 500.",
  path: "/labels",
});

export default function LabelsPage() {
  return (
    <>
      <Header current="/labels" />
      <main id="main" className="store" data-motion-root>
        <Motion name="reveal" />
        <CategoryHero
          trail={[{ name: "Labels", href: "/labels" }]}
          title="Custom labels."
          lede="Labels for your products and packaging, printed to the size you type. Waterproof BOPP, paper, kraft or metallic, on rolls for your packing line or sheets for small batches."
          facts={[PROOF, SHIPS, `Bulk from ${BULK_FROM.toLocaleString("en-CA")}`]}
          aside={<QuickPrice />}
        />
        <ProductShowcase id="lbl-product" title="By product." lede="Every label, on the product it's made for." products={LABEL_PRODUCTS.filter((p) => p.group === "product")} />
        <ProductGrid id="lbl-format" title="By format." products={LABEL_PRODUCTS.filter((p) => p.group === "format")} cols={4} />
        <BulkBand />
        <Materials />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
