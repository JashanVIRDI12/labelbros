import type { ReactNode } from "react";
import Link from "next/link";
import { Crumbs } from "@/components/site/Crumbs";
import { PageHero } from "@/components/site/PageHero";
import { Arrow } from "@/components/site/Arrow";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { LEGAL_UPDATED } from "@/lib/facts";
import { PolicyToc } from "./PolicyToc";
import { Rich } from "./Rich";

/** A paragraph (a string) or a bulleted list (an array of strings); both may use Rich's marks. */
export type Block = string | string[] | { steps: string[] };
export type PolicySection = { id: string; title: string; blocks: Block[] };

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (typeof b === "string")
          return (
            <p key={i}>
              <Rich text={b} />
            </p>
          );
        const items = Array.isArray(b) ? b : b.steps;
        const List = Array.isArray(b) ? "ul" : "ol";
        return (
          <List key={i}>
            {items.map((t, j) => (
              <li key={j}>
                <Rich text={t} />
              </li>
            ))}
          </List>
        );
      })}
    </>
  );
}

/*
 * The policy pages (privacy, terms, shipping, reprints): the poster H1, then the text on a cream
 * liner sheet with "On this page" beside it. Text-first, for reading and for search engines.
 * They are drafts in plain English until the client has them reviewed (the [[DRAFT]] mark).
 */
export function PolicyPage({
  path,
  name,
  lines,
  lede,
  facts,
  sections,
  draft = true,
  after,
}: {
  path: string;
  name: string;
  lines: [string, string];
  lede: string;
  facts: ReactNode[];
  sections: PolicySection[];
  draft?: boolean;
  after?: ReactNode;
}) {
  return (
    <>
      <Header current={path} />
      <main id="main" className="zone-field pol-page">
        <PageHero id="pol-title" lines={lines} lede={lede} facts={facts} />
        <div className="pol">
          <PolicyToc items={sections.map(({ id, title }) => ({ id, title }))} />
          <article className="pol-doc" aria-labelledby="pol-title">
            <Crumbs trail={[{ name, href: path }]} />
            <p className="pol-meta">
              Last updated {LEGAL_UPDATED}
              {draft && (
                <>
                  {" · "}
                  <span className="ph">[[DRAFT: have a lawyer review before launch]]</span>
                </>
              )}
            </p>
            {sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="pol-sec">
                <h2 id={`${s.id}-h`}>{s.title}</h2>
                <Blocks blocks={s.blocks} />
              </section>
            ))}
            {after}
            <aside className="pol-ask" aria-label="Questions">
              <p>
                <b>Still have a question?</b> A person answers, by email.
              </p>
              <Link href="/contact" className="btn btn-primary btn-sm">
                Contact us
                <Arrow />
              </Link>
            </aside>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
