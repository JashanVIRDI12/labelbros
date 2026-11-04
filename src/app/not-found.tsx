import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/site/Arrow";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

export const metadata: Metadata = {
  title: "Page not found · Label Bros",
};

/* A page that is not there: said plainly, with the ways back in. */
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main">
        <section aria-labelledby="nf-title" className="sh nf">
          <h1 id="nf-title" className="hero-title sh-title">
            <span className="title-line">
              <span style={{ ["--i" as string]: 0 }}>This one</span>
            </span>
{" "}
            <span className="title-line">
              <span style={{ ["--i" as string]: 1 }}>peeled off.</span>
            </span>
          </h1>
          <div className="sh-row">
            <p className="hero-fade sh-lede" style={{ ["--i" as string]: 0 }}>
              We could not find that page. It may have moved, or the link has a typo.
            </p>
            <div className="hero-fade flex flex-col gap-3 sm:flex-row" style={{ ["--i" as string]: 1 }}>
              <Link href="/" className="btn btn-primary">
                Back to the homepage
                <Arrow />
              </Link>
              <Link href="/services" className="btn btn-secondary">
                See everything we print
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
