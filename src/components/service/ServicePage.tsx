import type { Metadata } from "next";
import { Questions } from "@/components/sheet/Questions";
import { quoteHref } from "@/components/sheet/quote";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Motion } from "@/components/site/Motion";
import { BRAND } from "@/lib/site";
import { FactsPanel } from "./FactsPanel";
import { JsonLd, faqData } from "./JsonLd";
import { RelatedServices } from "./RelatedServices";
import { ServiceFinishes } from "./ServiceFinishes";
import { ServiceHero } from "./ServiceHero";
import { ServiceOverview } from "./ServiceOverview";
import { ServiceUses } from "./ServiceUses";
import { Steps } from "./Steps";
import { serviceBySlug, type ServiceSlug } from "./services";

export function serviceMetadata(slug: ServiceSlug): Metadata {
  const s = serviceBySlug(slug);
  const title = `${s.name} · ${BRAND}`;
  return { title, description: s.description, openGraph: { title, description: s.description, type: "website" } };
}

/*
 * One service, written to be read top to bottom: what it is, what it is made of, the finishes,
 * where it goes, the facts, how ordering works, questions, and the neighbours. All of it is in
 * the page as text (one H1, H2 per section). Motion: page-motion.ts, loaded after first paint.
 */
export function ServicePage({ slug }: { slug: ServiceSlug }) {
  const s = serviceBySlug(slug);
  const { product, ...params } = s.quote;
  const price = quoteHref(product, params);
  const faq = faqData(s.faqs);
  return (
    <>
      <Header current="/services" />
      <main id="main" className="svc-page" data-motion-root>
        <Motion name="page" />
        <ServiceHero service={s} />
        <ServiceOverview service={s} />
        <ServiceFinishes service={s} />
        <ServiceUses service={s} />
        <FactsPanel id="facts-title" name={s.name} panel={s.panel} priceHref={price} />
        <Steps />
        <Questions id="faq-title" items={s.faqs} priceHref={price} />
        <RelatedServices slugs={s.related} />
      </main>
      <Footer />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: s.name,
          serviceType: s.name,
          description: s.description,
          provider: { "@type": "Organization", name: BRAND },
        }}
      />
      {faq ? <JsonLd data={faq} /> : null}
    </>
  );
}
