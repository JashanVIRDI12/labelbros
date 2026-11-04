import type { Metadata } from "next";
import { Faq } from "@/components/how-page/Faq";
import { Journey } from "@/components/how-page/Journey";
import { PageHero } from "@/components/sheet/PageHero";
import { quoteHref } from "@/components/sheet/quote";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

export const metadata: Metadata = {
  title: "How it works · Label Bros",
  description:
    "Send your artwork or just an idea, approve a free proof, and we print, cut and send your stickers and labels. Nothing prints until you say yes.",
};

export default function HowItWorksPage() {
  return (
    <>
      <Header current="/how-it-works" />
      <main id="main">
        <PageHero
          id="how-title"
          lines={["From idea", "to your door."]}
          lede="Send your artwork or just an idea. We set it up and send you a free proof, and nothing prints until you say yes. Then it is printed, cut and on its way."
          priceHref={quoteHref("stickers", { shape: "die-cut" })}
          facts={[
            "Free proof before print",
            "Proof in 12–24 hours",
            "Ships in 2–4 business days",
          ]}
        />
        <Journey />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
