import type { CSSProperties, ReactNode } from "react";
import { Crumbs, type Crumb } from "@/components/site/Crumbs";

/*
 * The top of a shop page: where you are, the H1 (it rises in CSS from partly visible, so it is
 * the first paint), one line about the range, and a few short facts. `aside`: something to sit
 * beside it on wide screens (the quick price bar).
 */
export function CategoryHero({ trail, title, lede, facts, aside }: { trail: Crumb[]; title: string; lede: string; facts?: string[]; aside?: ReactNode }) {
  return (
    <section className="cat-hero" aria-labelledby="cat-title">
      <div className="cat-hero-copy">
        <Crumbs trail={trail} />
        <h1 id="cat-title" className="display cat-title">
          <span className="title-line">
            <span style={{ "--i": 0 } as CSSProperties}>{title}</span>
          </span>
        </h1>
        <p className="cat-lede">
          {lede}
        </p>
        {facts && (
          <ul className="hero-facts hero-fade" style={{ "--i": 1 } as CSSProperties}>
            {facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
      </div>
      {aside && <div className="cat-hero-aside hero-fade" style={{ "--i": 2 } as CSSProperties}>{aside}</div>}
    </section>
  );
}
