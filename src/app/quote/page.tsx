import type { Metadata } from "next";
import { QuoteFlow } from "@/components/quote/QuoteFlow";
import { PageHero } from "@/components/sheet/PageHero";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { PROOF, SHIPS } from "@/lib/facts";

export const metadata: Metadata = {
  title: "Get a quote · Label Bros",
  description:
    "Price custom stickers and labels in Canadian dollars as you build them, then send the quote with your artwork, or ask us to design it. Free proof in 12–24 hours.",
};

export default function QuotePage() {
  return (
    <>
      <Header current="/quote" />
      <main id="main">
        <PageHero
          id="quote-title"
          lines={["Get your", "quote."]}
          lede="Build it and see the price as you go, in Canadian dollars. Then send it to us with your artwork, or ask us to design it."
          facts={[PROOF, "Prices in Canadian dollars", SHIPS]}
        />
        <QuoteFlow />
      </main>
      <Footer />
    </>
  );
}
