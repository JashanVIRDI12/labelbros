import Link from "next/link";
import type { CSSProperties } from "react";
import { Arrow } from "@/components/site/Arrow";
import { BULK_FROM } from "@/lib/options";
import { StickerControls } from "./StickerControls";
import { StickerTable } from "./StickerTable";

/*
 * The first screen, as the client liked it (restored 2026-11-11): a table of real-feeling labels
 * and stickers you can peel, drag and throw (StickerTable, WebGL, loaded after first paint), the
 * headline along the bottom, and both ways into the shop. Every word and button is a keep-out:
 * the labels never land on them.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="hero-table relative isolate overflow-clip">
      <div className="relative z-0 px-[var(--gutter)] pb-[clamp(20px,4.2svh,44px)]">
        <h1 id="hero-title" className="hero-title">
          <span className="title-line">
            <span data-keepout style={{ "--i": 0 } as CSSProperties}>
              Make your
            </span>
          </span>{" "}
          <span className="title-line">
            <span data-keepout style={{ "--i": 1 } as CSSProperties}>
              brand stick.
            </span>
          </span>
        </h1>

        <div className="mt-[clamp(18px,3.2svh,36px)] flex flex-col gap-5 lg:flex-row lg:flex-wrap lg:items-end lg:gap-x-[clamp(24px,3vw,56px)] xl:flex-nowrap">
          <p data-keepout="hard" className="max-w-[40ch] text-16 leading-[1.45] md:text-18 lg:flex-[1_1_34ch]">
            Custom product labels and stickers in any shape and size, on rolls or sheets. Type your size, upload your design or let us design it, and approve a free proof before we print.
          </p>
          <div data-keepout="hard" className="hero-fade flex flex-col gap-3 sm:flex-row" style={{ "--i": 1 } as CSSProperties}>
            <Link href="/labels" className="btn btn-primary">
              Shop labels
              <Arrow />
            </Link>
            <Link href="/business" className="btn btn-ghost">
              Bulk pricing from {BULK_FROM}
            </Link>
          </div>
          {/* phones: the three reasons to trust the order, right under the buttons */}
          <ul data-keepout className="hero-fade hero-trust md:hidden" style={{ "--i": 2 } as CSSProperties}>
            <li>Free proof</li>
            <li>Bulk from {BULK_FROM}</li>
            <li>Ships in 2–4 business days</li>
          </ul>
          <StickerControls />
        </div>
      </div>

      <StickerTable />
    </section>
  );
}
