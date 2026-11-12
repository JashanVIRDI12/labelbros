import type { Metadata } from "next";
import { TrackForm } from "@/components/store/TrackForm";
import { PageHero } from "@/components/site/PageHero";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { PROOF, SHIPS } from "@/lib/facts";
import { pageMeta } from "@/lib/meta";
import { BRAND } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: `Track my order · ${BRAND}`,
  description: "Where's my order? Enter your Label Bros order number and email to see its step: proof, printing or shipped.",
  path: "/track",
});

export default function TrackPage() {
  return (
    <>
      <Header current="/track" />
      <main id="main" className="zone-field trackpage">
        <PageHero id="track-title" lines={["Where's my", "order?"]} lede="Your order number and email, and you see the step it's at." facts={[PROOF, SHIPS]} />
        <div className="trackpage-body">
          <TrackForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
