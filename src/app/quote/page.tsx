import type { Metadata } from "next";
import { QuoteFlow } from "@/components/quote/QuoteFlow";
import { PageHero } from "@/components/sheet/PageHero";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { PROOF, SHIPS } from "@/lib/facts";

export const metadata: Metadata = {
  title: "Order custom stickers and labels · Label Bros",
  description:
    "Upload your design, pick a shape, size and finish, see your price and pay (CAD in Canada, USD everywhere else). Free proof in 12–24 hours before anything prints.",
};

export default function QuotePage() {
  return (
    <>
      <Header current="/quote" />
      <main id="main">
        <PageHero
          id="quote-title"
          lines={["Upload.", "Pay. Done."]}
          lede="Upload your design, pick a shape, size and finish, and pay. We check your artwork and email a free proof before anything prints. No file? We design it for you."
          facts={[PROOF, "CAD in Canada, USD elsewhere", SHIPS]}
        />
        <QuoteFlow />
      </main>
      <Footer />
    </>
  );
}
