import Link from "next/link";
import { quoteHref } from "@/components/sheet/quote";
import { Arrow } from "@/components/site/Arrow";
import { Crumbs } from "./Crumbs";
import { HeroArt } from "./HeroArt";
import { Ph } from "./Ph";
import type { Service } from "./services";

/* A service page's first screen: where it sits, what it is (the H1 names it), both asks, the product. */
export function ServiceHero({ service }: { service: Service }) {
  const { product, ...params } = service.quote;
  return (
    <section className="svc-hero" aria-labelledby="svc-title">
      <div className="svc-hero-copy">
        <Crumbs trail={[{ name: "Services", href: "/services" }, { name: service.name, href: `/services/${service.slug}` }]} />
        <h1 id="svc-title" className="hero-title svc-title">
          {service.h1.map((line, i) => (
            <span key={line} className="title-line">
              <span style={{ ["--i" as string]: i }}>{line}{i < service.h1.length - 1 ? " " : ""}</span>
            </span>
          ))}
        </h1>
        <p className="hero-fade svc-lede" style={{ ["--i" as string]: 0 }}>
          {service.lede}
        </p>
        <div className="hero-fade svc-ctas" style={{ ["--i" as string]: 1 }}>
          <Link href={quoteHref(product, params)} className="btn btn-primary">
            Get instant pricing
            <Arrow />
          </Link>
          <Link href="/#samples" className="btn btn-secondary">
            Order a sample kit
          </Link>
        </div>
        <ul className="hero-fade svc-facts" style={{ ["--i" as string]: 2 }}>
          {service.facts.map((f) => (
            <li key={f}>
              <Ph text={f} />
            </li>
          ))}
        </ul>
      </div>
      <HeroArt kind={service.hero.kind} art={service.hero.art} />
    </section>
  );
}
