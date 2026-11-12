import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/site/PageHero";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { pageMeta } from "@/lib/meta";
import { BRAND } from "@/lib/site";
import { UnsubscribeForm } from "./UnsubscribeForm";

export const metadata: Metadata = pageMeta({
  title: `Unsubscribe · ${BRAND}`,
  description: "Leave the Label Bros email list.",
  path: "/unsubscribe",
  noindex: true,
});

/** The link in every email lands here; one button leaves the list (a POST, so scanners can't). */
export default function UnsubscribePage() {
  return (
    <>
      <Header />
      <main id="main" className="zone-field pol-page">
        <PageHero id="unsub-title" lines={["Leaving", "the list?"]} lede="One click and we stop emailing you. Orders and proofs still reach you." facts={["No sign-in needed", "Takes effect right away"]} />
        <div className="pol">
          <div />
          <div className="pol-doc">
            <Suspense fallback={null}>
              <UnsubscribeForm />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
