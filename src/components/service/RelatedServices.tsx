import type { CSSProperties } from "react";
import Link from "next/link";
import { Art } from "@/components/sheet/Art";
import { Arrow } from "@/components/site/Arrow";
import { SERVICES, serviceArt, serviceHref, type ServiceSlug } from "./services";

/* "More we print": the neighbours, each a cream label card whose corner peels on hover. */
export function RelatedServices({ slugs, title = "More we print." }: { slugs: ServiceSlug[]; title?: string }) {
  const list = slugs.map((s) => SERVICES.find((x) => x.slug === s)!).filter(Boolean);
  return (
    <section className="more" aria-labelledby="more-title">
      <h2 id="more-title" className="section-title more-title">
        {title}
      </h2>
      <ul className="more-list">
        {list.map((s, i) => {
          const p = serviceArt(s).art;
          return (
            <li key={s.slug}>
              <Link href={serviceHref(s.slug)} className="more-card" data-slap style={{ "--r": `${i % 2 ? 2 : -2}deg` } as CSSProperties}>
                <span className="more-art" aria-hidden="true">
                  <Art art={{ src: p.src, w: p.w, h: p.h }} sizes="(max-width: 640px) 70vw, 280px" />
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
      </ul>
    </section>
  );
}
