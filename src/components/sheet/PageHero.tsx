import type { ReactNode } from "react";
import Link from "next/link";
import { Arrow } from "@/components/site/Arrow";

type Props = {
  id: string;
  /** the H1, one string per line (lines wrap on phones) */
  lines: [string, string];
  lede: string;
  /** where "Get instant pricing" goes; leave it out on pages that are themselves the ask */
  priceHref?: string;
  facts: ReactNode[];
};

/*
 * A product page opens on the promise, at poster scale, with both asks in reach (`.sh` in
 * globals.css). The H1 rises in pure CSS from partly visible, so it paints on the first frame and
 * stays the LCP even with the page's first stickers on screen.
 */
export function PageHero({ id, lines, lede, priceHref, facts }: Props) {
  return (
    <section aria-labelledby={id} className={priceHref ? "sh" : "sh sh-short"}>
      <h1 id={id} className="hero-title sh-title">
        {lines.map((line, i) => (
          <span key={line} className="title-line">
            <span style={{ ["--i" as string]: i }}>{line}{i < lines.length - 1 ? " " : ""}</span>
          </span>
        ))}
      </h1>

      <div className="sh-row">
        <p className="hero-fade sh-lede" style={{ ["--i" as string]: 0 }}>
          {lede}
        </p>
        {priceHref && (
          <div className="hero-fade flex flex-col gap-3 sm:flex-row" style={{ ["--i" as string]: 1 }}>
            <Link href={priceHref} className="btn btn-primary">
              Get instant pricing
              <Arrow />
            </Link>
            <Link href="/#samples" className="btn btn-secondary">
              Order a sample kit
            </Link>
          </div>
        )}
        <ul className="hero-fade sh-facts" style={{ ["--i" as string]: 2 }}>
          {facts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
