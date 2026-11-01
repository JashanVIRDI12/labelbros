import { Hero } from "@/components/hero/Hero";
import { Header } from "@/components/site/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
      </main>
    </>
  );
}
