import Link from "next/link";
import { BulkBand } from "@/components/home/BulkBand";
import { Faq } from "@/components/home/Faq";
import { Steps } from "@/components/home/Steps";
import { Arrow } from "@/components/site/Arrow";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Motion } from "@/components/site/Motion";
import { BulkPacks } from "@/components/store/BulkPacks";
import { CategoryHero } from "@/components/store/CategoryHero";
import { ProductGrid } from "@/components/store/ProductGrid";
import { QuoteForm } from "@/components/store/QuoteForm";
import { INVOICE_DAYS, INVOICE_MIN, PROOF } from "@/lib/facts";
import { pageMeta } from "@/lib/meta";
import { BULK_FROM, MAX_QTY } from "@/lib/options";
import { LABEL_PRODUCTS } from "@/lib/products";
import { BRAND } from "@/lib/site";

export const metadata = pageMeta({
  title: `Bulk labels for business · ${BRAND}`,
  description: `Bulk custom labels from ${BULK_FROM} to ${MAX_QTY.toLocaleString("en-CA")}, bought straight from the shop at bulk prices. Pay by card or invoice. Free proof on every design.`,
  path: "/business",
});

export default function BusinessPage() {
  return (
    <>
      <Header current="/business" />
      <main id="main" className="store biz" data-motion-root>
        <Motion name="reveal" />
        <CategoryHero
          trail={[{ name: "Bulk & business", href: "/business" }]}
          title="Bulk labels for business."
          lede={`Order ${BULK_FROM.toLocaleString("en-CA")} to ${MAX_QTY.toLocaleString("en-CA")} labels straight from the shop, at bulk prices you can see before you buy. Pay by card, or by invoice on orders over $${INVOICE_MIN}.`}
          facts={["No setup or plate fees", PROOF, "Pay by card or invoice"]}
          aside={
            <div className="biz-ask">
              <p className="biz-ask-title">Buying in bulk</p>
              <ol className="biz-ask-list">
                <li>Pick a label below, or any label in the shop.</li>
                <li>Choose “Bulk {BULK_FROM.toLocaleString("en-CA")}+” and your quantity.</li>
                <li>Upload your artwork and check out by card or invoice.</li>
              </ol>
              <a href="#packs" className="btn btn-primary">
                See bulk prices
                <Arrow />
              </a>
            </div>
          }
        />

        <section className="shelf-sec" id="packs" aria-labelledby="packs-title">
          <div className="sec-head">
            <h2 id="packs-title" className="display sec-title" data-reveal>
              Popular bulk orders.
            </h2>
            <p className="sec-lede">Priced on the spot. Open one to change the size, material or quantity, add your artwork and buy.</p>
          </div>
          <BulkPacks />
        </section>

        <BulkBand title="The more you order, the less each label costs." />

        <ProductGrid id="biz-all" title="Every label, in bulk." lede={`Every label comes in bulk from ${BULK_FROM.toLocaleString("en-CA")}. Open one and choose “Bulk”.`} products={LABEL_PRODUCTS} />

        <section className="invoice" id="invoice" aria-labelledby="invoice-title">
          <div className="invoice-copy">
            <h2 id="invoice-title" className="display sec-title" data-reveal>
              Pay by invoice.
            </h2>
            <p className="sec-lede">For business orders of ${INVOICE_MIN} or more. Choose “Pay by invoice” at checkout and add your billing address and PO number.</p>
            <Link href="/cart" className="text-link">
              Go to your cart
              <Arrow />
            </Link>
          </div>
          <ol className="invoice-steps">
            <li>
              <b>You order.</b> Nothing is charged at checkout. Your artwork comes with the order.
            </li>
            <li>
              <b>We check and invoice.</b> We check your file by hand and email your proof, and an invoice from Stripe due in {INVOICE_DAYS} days.
            </li>
            <li>
              <b>You approve and pay.</b> Pay the invoice online. We print once your proof is approved and the invoice is paid.
            </li>
          </ol>
        </section>

        <Steps title="How a bulk order works." />

        <section className="quote" id="quote" aria-labelledby="quote-title">
          <div className="quote-copy">
            <h2 id="quote-title" className="display sec-title" data-reveal>
              Bigger than the shop?
            </h2>
            <p className="sec-lede">Over {MAX_QTY.toLocaleString("en-CA")} labels, many designs or versions, a custom material, or deliveries on a schedule? Tell us and we send a quote.</p>
            <ul className="quote-points">
              <li>A quote by email, from a person</li>
              <li>Free proof for every design</li>
              <li>Pay by card or invoice</li>
            </ul>
          </div>
          <QuoteForm />
        </section>

        <Faq />
      </main>
      <Footer />
    </>
  );
}
