import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Arrow } from "./Arrow";

type Props = {
  id: string;
  /** the H1, one string per line (lines wrap on phones) */
  lines: [string, string] | string[];
  lede: string;
  /** a "Shop" button, for pages that aren't themselves the ask */
  priceHref?: string;
  facts: ReactNode[];
};

/*
 * The top of a text page (about, contact, track, policies): the H1 at poster scale, one line, and
 * a few short facts. The H1 rises in pure CSS from partly visible, so it paints on the first
 * frame and stays the LCP.
 */
export function PageHero({ id, lines, lede, priceHref, facts }: Props) {
  return (
    <section aria-labelledby={id} className="cat-hero cat-hero-page">
      <div className="cat-hero-copy">
        <h1 id={id} className="display cat-title">
          {lines.map((line, i) => (
            <span key={line} className="title-line">
              <span style={{ "--i": i } as CSSProperties}>
                {line}
                {i < lines.length - 1 ? " " : ""}
              </span>
            </span>
          ))}
        </h1>
        <p className="cat-lede">
          {lede}
        </p>
        {priceHref && (
          <div className="hero-btns hero-fade" style={{ "--i": 1 } as CSSProperties}>
            <Link href={priceHref} className="btn btn-primary">
              Shop labels
              <Arrow />
            </Link>
            <Link href="/business" className="btn btn-ghost">
              Bulk pricing
            </Link>
          </div>
        )}
        <ul className="hero-facts hero-fade" style={{ "--i": 2 } as CSSProperties}>
          {facts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
