import type { CSSProperties } from "react";
import Link from "next/link";
import { Art } from "@/components/sheet/Art";
import { Arrow } from "@/components/site/Arrow";
import { SERVICES, serviceArt, serviceHref } from "./services";

/* The services index: one card per service (each a cream label whose corner peels on hover). */
export function ServicesGrid() {
  return (
    <section className="more svc-index" aria-labelledby="index-title">
      <h2 id="index-title" className="section-title more-title">
        What we print.
      </h2>
      <ul className="more-list index-list">
        {SERVICES.map((s, i) => {
          const p = serviceArt(s).art;
          return (
            <li key={s.slug}>
              <Link href={serviceHref(s.slug)} className="more-card" data-slap style={{ "--r": `${[-2, 1.5, -1, 2, -1.5, 1][i]}deg` } as CSSProperties}>
                <span className="more-art" aria-hidden="true">
                  <Art art={p} sizes="(max-width: 640px) 70vw, 280px" />
                </span>
                <span className="more-name">{s.name}</span>
                <span className="more-short">{s.short}</span>
                <span className="more-go">
                  See {s.name.toLowerCase()}
                  <Arrow />
                </span>
              </Link>
            </li>
          );
        })}
        <li>
          <Link href="/business" className="more-card more-card-alt" data-slap style={{ "--r": "-1deg" } as CSSProperties}>
            <span className="more-name">Business labels</span>
            <span className="more-short">Shipping labels, asset tags, warning signs, inspection stickers, shelf codes and name badges.</span>
            <span className="more-go">
              See business labels
              <Arrow />
            </span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
