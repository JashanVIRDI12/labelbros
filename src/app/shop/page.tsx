import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Motion } from "@/components/site/Motion";
import { CategoryHero } from "@/components/store/CategoryHero";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ProductShowcase } from "@/components/store/ProductShowcase";
import { QuickPrice } from "@/components/store/QuickPrice";
import { PROOF, SHIPS } from "@/lib/facts";
import { pageMeta } from "@/lib/meta";
import { DEALS, LABEL_PRODUCTS, SAMPLE_PACK, STICKER_PRODUCTS } from "@/lib/products";
import { BRAND } from "@/lib/site";

export const metadata = pageMeta({
  title: `Shop labels and stickers · ${BRAND}`,
  description: "Every label and sticker we print: product labels on rolls and sheets, custom stickers and deals. Type your size and the price follows.",
  path: "/shop",
});

export default function ShopPage() {
  return (
    <>
      <Header />
      <main id="main" className="store" data-motion-root>
        <Motion name="reveal" />
        <CategoryHero trail={[{ name: "Shop", href: "/shop" }]} title="Shop everything." lede="Every label and sticker we print. Pick one, type your size in inches, and the price follows." facts={[PROOF, SHIPS]} aside={<QuickPrice />} />
        <ProductShowcase id="shop-labels" title="Labels." products={LABEL_PRODUCTS.filter((p) => p.group === "product")} />
        <ProductGrid id="shop-formats" title="Label formats." products={LABEL_PRODUCTS.filter((p) => p.group === "format")} cols={4} />
        <ProductGrid id="shop-stickers" title="Stickers." products={STICKER_PRODUCTS} cols={3} />
        <ProductGrid id="shop-deals" title="Deals and samples." products={[...DEALS, ...(SAMPLE_PACK ? [SAMPLE_PACK] : [])]} cols={3} />
      </main>
      <Footer />
    </>
  );
}
