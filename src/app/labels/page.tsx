import type { Metadata } from "next";
import { LabelWeb } from "@/components/labels-page/LabelWeb";
import { LabelsHero } from "@/components/labels-page/LabelsHero";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

export const metadata: Metadata = {
  title: "Product labels · Label Bros",
  description:
    "Custom product labels for bottles, jars, cans, tins and bags, on paper or vinyl, in any shape and size. Send your artwork or let our designers make it, and approve a free proof before we print.",
};

export default function LabelsPage() {
  return (
    <>
      <Header current="/labels" />
      <main id="main">
        <LabelsHero />
        <LabelWeb />
      </main>
      <Footer />
    </>
  );
}
