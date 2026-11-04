import Link from "next/link";
import { Arrow } from "@/components/site/Arrow";
import { Ph } from "./Ph";

type Props = {
  id: string;
  name: string; // what the panel is for ("Die-cut stickers")
  panel: { title: string; rows: [string, string][]; foot: string };
  priceHref: string;
};

/*
 * "The details": the specs as a facts panel, the way a product label states what is in the jar.
 * A cream label stuck on the page (an object: it casts a shadow), its corner peeling on hover.
 */
export function FactsPanel({ id, name, panel, priceHref }: Props) {
  return (
    <section className="facts" aria-labelledby={id}>
      <div className="facts-intro">
        <h2 id={id} className="section-title">
          The details.
        </h2>
        <p className="facts-lede">
          Everything you choose when you order. You see it all on your free proof before anything prints.
        </p>
        <div className="facts-ctas">
          <Link href={priceHref} className="btn btn-primary">
            Get instant pricing
            <Arrow />
          </Link>
          <Link href="/how-it-works" className="text-link">
            How ordering works
            <Arrow />
          </Link>
        </div>
      </div>
      <div className="facts-label" data-slap>
        <p className="facts-title">{panel.title}</p>
        <p className="facts-for">{name}</p>
        <dl className="facts-rows" data-rules>
          {panel.rows.map(([k, v]) => (
            <div key={k} className="facts-row">
              <dt>{k}</dt>
              <dd>
                <Ph text={v} />
              </dd>
            </div>
          ))}
        </dl>
        <p className="facts-foot">{panel.foot}</p>
      </div>
    </section>
  );
}
