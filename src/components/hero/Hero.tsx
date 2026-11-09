import { Arrow } from "@/components/site/Arrow";
import { StickerControls } from "./StickerControls";
import { StickerTable } from "./StickerTable";
import { SecondAsk } from "@/components/site/SecondAsk";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="hero relative isolate h-[100svh] min-h-[680px] overflow-clip md:min-h-[640px]"
    >
      <div className="absolute inset-x-0 bottom-0 z-0 px-[var(--gutter)] pb-[clamp(20px,4.2svh,44px)]">
        <h1 id="hero-title" className="hero-title">
          <span className="title-line">
            <span data-keepout style={{ ["--i" as string]: 0 }}>
              Make your
            </span>
          </span>
{" "}
          <span className="title-line">
            <span data-keepout style={{ ["--i" as string]: 1 }}>
              brand stick.
            </span>
          </span>
        </h1>

        <div className="mt-[clamp(18px,3.2svh,36px)] flex flex-col gap-5 lg:flex-row lg:items-end lg:gap-[clamp(24px,3vw,56px)]">
          <p data-keepout className="hero-fade max-w-[34ch] text-16 leading-[1.45] md:text-18" style={{ ["--i" as string]: 0 }}>
            Custom stickers and product labels, cut to any shape. Upload your design or let us design it. We send a
            proof to approve and call you if anything needs changing.
          </p>
          <div data-keepout className="hero-fade flex flex-col gap-3 sm:flex-row" style={{ ["--i" as string]: 1 }}>
            <a href="#pricing" className="btn btn-primary">
              Upload your design
              <Arrow />
            </a>
            <SecondAsk />
          </div>
          {/* phones: the three reasons to trust the order, right under the buttons */}
          <ul data-keepout className="hero-fade hero-trust md:hidden" style={{ ["--i" as string]: 2 }}>
            <li>Free proof</li>
            <li>From 10 stickers</li>
            <li>Ships in 2–4 business days</li>
          </ul>
          <StickerControls />
        </div>
      </div>

      <StickerTable />
    </section>
  );
}
