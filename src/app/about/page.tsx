import type { Metadata } from "next";
import Link from "next/link";
import { Rich } from "@/components/policy/Rich";
import { Ph } from "@/components/site/Ph";
import { PageHero } from "@/components/site/PageHero";
import { Arrow } from "@/components/site/Arrow";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MapleLeaf, TrustStrip } from "@/components/site/Trust";
import { CALL, PROOF, REPRINT_WINDOW, SHIPPING, SHIPS } from "@/lib/facts";
import { pageMeta } from "@/lib/meta";
import { BRAND, contactOr } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: `About us · ${BRAND}`,
  description:
    "Label Bros prints custom product labels, and stickers, in Canada for businesses and brands. Free proof before every print, and a reprint if we get it wrong.",
  path: "/about",
});

// every promise here is one the shop already makes elsewhere (facts.ts)
const PROMISES = [
  { title: "A proof before anything prints", body: `${PROOF}. Nothing prints until you say yes.` },
  { title: "A person on the phone", body: `${CALL}. No ticket queues.` },
  { title: "Fast out the door", body: `${SHIPS} after you approve.` },
  { title: "We fix our mistakes", body: `Wrong or damaged? Tell us within ${REPRINT_WINDOW} and we reprint it free.` },
  { title: "Canadian prices", body: `Prices in Canadian dollars. ${SHIPPING}.` },
  { title: "Your art, or ours", body: "Send your artwork, or an idea and our designers draw it." },
];

const TEAM = [0, 1, 2];

export default function AboutPage() {
  return (
    <>
      <Header current="/about" />
      <main id="main" className="zone-field pol-page">
        <PageHero
          id="about-title"
          lines={["Labels for", "your business."]}
          lede="Label Bros prints custom product labels, and stickers, for businesses and brands across Canada, from a first run of 50 to orders of 100,000, and ships them everywhere else too."
          priceHref="/labels"
          facts={["Printed in Canada", "Free proof before print", "Reprint guarantee"]}
        />
        <div className="ab">
          <section className="ab-split" aria-labelledby="ab-story">
            <div>
              <h2 id="ab-story" className="ab-title">
                Our story
              </h2>
              <p className="ab-sub">How Label Bros started, and why.</p>
            </div>
            <div className="pol-doc pol-sec">
              <p>
                <Rich text="[[STORY: how Label Bros started, who started it and why, in two or three short paragraphs]]" />
              </p>
              <p>
                <Rich text="[[WHAT MAKES US DIFFERENT: the press, the materials, the people]]" />
              </p>
            </div>
          </section>

          <section aria-labelledby="ab-promises" className="grid gap-8">
            <h2 id="ab-promises" className="ab-title">
              What you can count on
            </h2>
            <ul className="ab-promises">
              {PROMISES.map((p) => (
                <li key={p.title} className="ab-promise">
                  <b>{p.title}</b>
                  <span>{p.body}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="ab-team" className="grid gap-8">
            <div>
              <h2 id="ab-team" className="ab-title">
                The bros
              </h2>
              <p className="ab-sub">The people who print, cut and pack your order.</p>
            </div>
            <ul className="ab-team">
              {TEAM.map((i) => (
                <li key={i} className="ab-person">
                  <div className="ab-photo">
                    <Ph text="[[TEAM PHOTO]]" />
                  </div>
                  <b>
                    <Ph text="[[NAME]]" />
                  </b>
                  <span>
                    <Ph text="[[ROLE]]" />
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="ab-made" className="ab-made">
            <span className="ab-leaf" aria-hidden="true">
              <MapleLeaf />
            </span>
            <div>
              <h2 id="ab-made" className="ab-title">
                Printed in Canada
              </h2>
              <dl>
                <div>
                  <dt>Where we print</dt>
                  <dd>
                    <Ph text={contactOr("city")} />
                  </dd>
                </div>
                <div>
                  <dt>Mailing address</dt>
                  <dd>
                    <Ph text={contactOr("address")} />
                  </dd>
                </div>
              </dl>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/labels" className="btn btn-primary">
                  Shop labels
                  <Arrow />
                </Link>
                <Link href="/contact" className="btn btn-secondary">
                  Contact us
                </Link>
              </div>
            </div>
          </section>

          <TrustStrip />
        </div>
      </main>
      <Footer />
    </>
  );
}
