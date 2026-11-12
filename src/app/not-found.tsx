import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
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
      <main id="main" className="store">
        <section aria-labelledby="nf-title" className="cat-hero cat-hero-page nf">
          <div className="cat-hero-copy">
            <h1 id="nf-title" className="display cat-title">
              <span className="title-line">
                <span style={{ "--i": 0 } as CSSProperties}>This one</span>
              </span>{" "}
              <span className="title-line">
                <span style={{ "--i": 1 } as CSSProperties}>peeled off.</span>
              </span>
            </h1>
            <p className="cat-lede">
              We could not find that page. It may have moved, or the link has a typo.
            </p>
            <div className="hero-btns hero-fade" style={{ "--i": 1 } as CSSProperties}>
              <Link href="/labels" className="btn btn-primary">
                Shop labels
                <Arrow />
              </Link>
              <Link href="/" className="btn btn-ghost">
                Back to the homepage
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
