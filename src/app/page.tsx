import { Hero } from "@/components/hero/Hero";
import { Pricing } from "@/components/sections/Pricing";
import { Process } from "@/components/sections/Process";
import { Products } from "@/components/sections/Products";
import { SampleKit } from "@/components/sections/SampleKit";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Products />
        <Process />
        <Pricing />
        <SampleKit />
      </main>
      <Footer />
    </>
  );
}
