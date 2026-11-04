import type { Metadata } from "next";
import { BusinessHero } from "@/components/business/BusinessHero";
import { BusinessKinds } from "@/components/business/BusinessKinds";
import { FactsPanel } from "@/components/service/FactsPanel";
import { JsonLd, faqData } from "@/components/service/JsonLd";
import { RelatedServices } from "@/components/service/RelatedServices";
import { Steps } from "@/components/service/Steps";
import { Questions } from "@/components/sheet/Questions";
import { quoteHref } from "@/components/sheet/quote";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Motion } from "@/components/site/Motion";
import { BRAND } from "@/lib/site";

const DESCRIPTION =
  "Custom business labels: shipping and address labels, asset tags, warning and safety labels, inspection labels, bin labels and name badges. Free proof before we print.";

export const metadata: Metadata = {
  title: `Business labels · ${BRAND}`,
  description: DESCRIPTION,
  openGraph: { title: `Business labels · ${BRAND}`, description: DESCRIPTION, type: "website" },
};

const FACTS = {
  title: "Label Facts",
  rows: [
    ["Labels", "Shipping, asset, warning, inspection, bin and ID"],
    ["Materials", "Paper, white vinyl or clear film"],
    ["Adhesive", "Permanent or removable"],
    ["Numbering", "Numbers, barcodes and QR codes"],
    ["Sizes", "1 to 24 inches"],
    ["Quantity", "From 25"],
    ["Proof", "Free, before we print"],
  ] as [string, string][],
  foot: "Prices depend on size, material and quantity. See yours in the pricing builder.",
};

const FAQS = [
  { q: "Can every label have its own number or barcode?", a: "Yes. Send a start number, or a list of the numbers or codes you need, and every label prints with its own. You check them on your proof first." },
  { q: "Will they last on machines and outdoors?", a: "Laminated vinyl labels are waterproof, scratch-resistant and UV-resistant, made to last 4 years or more outdoors." },
  { q: "Do you print safety labels to a standard?", a: "We print your safety labels exactly as you send or approve them, in the colours and symbols you choose. Check that the wording and symbols meet the rules for your industry before you approve the proof." },
  { q: "Can you match our brand colours?", a: "Send your colours with your artwork and check them on your free proof before anything prints." },
  { q: "Can we reorder the same labels later?", a: "Yes. We keep your artwork on file, so a reorder is the same labels with a new quantity." },
];

export default function BusinessPage() {
  const price = quoteHref("labels", { shape: "rectangle" });
  const faq = faqData(FAQS);
  return (
    <>
      <Header current="/business" />
      <main id="main" className="svc-page" data-motion-root>
        <Motion name="page" />
        <BusinessHero />
        <BusinessKinds />
        <FactsPanel id="facts-title" name="Business labels" panel={FACTS} priceHref={price} />
        <Steps />
        <Questions id="faq-title" items={FAQS} priceHref={price} />
        <RelatedServices slugs={["roll-labels", "kiss-cut-sheets", "custom-design"]} />
      </main>
      <Footer />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Business labels",
          serviceType: "Business labels",
          description: DESCRIPTION,
          provider: { "@type": "Organization", name: BRAND },
        }}
      />
      {faq ? <JsonLd data={faq} /> : null}
    </>
  );
}
