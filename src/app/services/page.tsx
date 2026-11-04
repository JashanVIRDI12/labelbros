import type { Metadata } from "next";
import { ServicesGrid } from "@/components/service/ServicesGrid";
import { Steps } from "@/components/service/Steps";
import { PageHero } from "@/components/sheet/PageHero";
import { quoteHref } from "@/components/sheet/quote";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Motion } from "@/components/site/Motion";
import { BRAND } from "@/lib/site";

const DESCRIPTION =
  "Custom die-cut stickers, holographic and glitter stickers, kiss-cut sheets, roll labels, packaging seals, business labels and custom design. Free proof before we print.";

export const metadata: Metadata = {
  title: `Services · ${BRAND}`,
  description: DESCRIPTION,
  openGraph: { title: `Services · ${BRAND}`, description: DESCRIPTION, type: "website" },
};

export default function ServicesPage() {
  return (
    <>
      <Header current="/services" />
      <main id="main" className="svc-page" data-motion-root>
        <Motion name="page" />
        <PageHero
          id="services-title"
          lines={["Everything", "we print."]}
          lede="Custom stickers cut to any shape, holographic foil and glitter, whole sticker sheets, labels by the roll, seals for your packaging, labels for the business, and designers who draw it for you. Every order starts with a free proof."
          priceHref={quoteHref("stickers", { shape: "die-cut" })}
          facts={[
            "Free proof before print",
            "From 10 stickers",
            "Ships in 2–4 business days",
          ]}
        />
        <ServicesGrid />
        <Steps />
      </main>
      <Footer />
    </>
  );
}
