import Link from "next/link";
import { Crumbs } from "@/components/service/Crumbs";
import { quoteHref } from "@/components/sheet/quote";
import { Arrow } from "@/components/site/Arrow";
import { Asset, Inspection, Warning } from "./labels";
import { SecondAsk } from "@/components/site/SecondAsk";

/*
 * Business labels, first screen: the H1 names it, both asks, and three labels fanned out that
 * print themselves in as the page opens (CSS, so it works before any script), then follow the
 * pointer (page-motion.ts).
 */
export function BusinessHero() {
  return (
    <section className="svc-hero" aria-labelledby="business-title">
      <div className="svc-hero-copy">
        <Crumbs trail={[{ name: "Business labels", href: "/business" }]} />
        <h1 id="business-title" className="hero-title svc-title">
          <span className="title-line">
            <span style={{ ["--i" as string]: 0 }}>Business</span>
          </span>
{" "}
          <span className="title-line">
            <span style={{ ["--i" as string]: 1 }}>labels.</span>
          </span>
        </h1>
        <p className="hero-fade svc-lede" style={{ ["--i" as string]: 0 }}>
          The labels a business runs on: shipping and address labels, asset tags, warning and safety labels, inspection
          stickers, shelf codes and name badges. Printed on the stock that suits the job, with a free proof before we
          print.
        </p>
        <div className="hero-fade svc-ctas" style={{ ["--i" as string]: 1 }}>
          <Link href={quoteHref("labels", { shape: "rectangle" })} className="btn btn-primary">
            Upload your design
            <Arrow />
          </Link>
          <SecondAsk />
        </div>
        <ul className="hero-fade svc-facts" style={{ ["--i" as string]: 2 }}>
          <li>Free proof before print</li>
          <li>From 25 labels</li>
          <li>Ships in 2–4 business days</li>
        </ul>
      </div>
      <div className="hero-art" data-hero-art data-kind="fan" aria-hidden="true">
        <span className="ha-pos" style={{ ["--x" as string]: "34%", ["--y" as string]: "30%", ["--w" as string]: "62%", ["--r" as string]: "-8deg" }}>
          <span className="ha-move ha-print" data-piece={0} style={{ ["--d" as string]: 0.6 }}>
            <Warning />
          </span>
        </span>
        <span className="ha-pos" style={{ ["--x" as string]: "62%", ["--y" as string]: "54%", ["--w" as string]: "64%", ["--r" as string]: "5deg" }}>
          <span className="ha-move ha-print" data-piece={1} style={{ ["--d" as string]: 0.95 }}>
            <Asset n={142} />
          </span>
        </span>
        <span className="ha-pos" style={{ ["--x" as string]: "40%", ["--y" as string]: "78%", ["--w" as string]: "58%", ["--r" as string]: "-3deg" }}>
          <span className="ha-move ha-print" data-piece={2} style={{ ["--d" as string]: 1.3 }}>
            <Inspection />
          </span>
        </span>
      </div>
    </section>
  );
}
