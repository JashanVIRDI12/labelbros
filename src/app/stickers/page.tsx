import { Faq } from "@/components/home/Faq";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Motion } from "@/components/site/Motion";
import { CategoryHero } from "@/components/store/CategoryHero";
import { ProductGrid } from "@/components/store/ProductGrid";
import { PROOF, SHIPS } from "@/lib/facts";
import { pageMeta } from "@/lib/meta";
import { DEALS, SAMPLE_PACK, STICKER_PRODUCTS } from "@/lib/products";
import { BRAND } from "@/lib/site";

export const metadata = pageMeta({
  title: `Custom stickers · ${BRAND}`,
  description: "Custom stickers by material: waterproof vinyl, clear, holographic, glitter, kraft paper, silver and gold. Any shape and size. Free proof before we print.",
  path: "/stickers",
});

export default function StickersPage() {
  return (
    <>
      <Header current="/stickers" />
      <main id="main" className="store" data-motion-root>
        <Motion name="reveal" />
        <CategoryHero
          trail={[{ name: "Stickers", href: "/stickers" }]}
          title="Custom stickers."
          lede="Stickers for merch, events and packaging, by material: vinyl, clear, holographic, glitter, kraft paper, silver and gold. Any shape, any size from 1 to 24 inches."
          facts={[PROOF, SHIPS, "From 10 stickers"]}
        />
        <ProductGrid id="stk-all" title="By material." lede="Pick what it's printed on. Every material comes in any shape (cut round your design, circle, square or rounded) and any size." products={STICKER_PRODUCTS} />
        <ProductGrid id="stk-deals" title="Sticker deals." lede="Fixed packs at one price. Pick the finish and add your artwork." products={[...DEALS, ...(SAMPLE_PACK ? [SAMPLE_PACK] : [])]} />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
