import { StickerControls } from "./StickerControls";
import { StickerTable } from "./StickerTable";

function Arrow() {
  return (
    <svg className="arrow" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M3 9h11M10 4.5 14.5 9 10 13.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
    </svg>
  );
}

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
          <span className="title-line">
            <span data-keepout style={{ ["--i" as string]: 1 }}>
              brand stick.
            </span>
          </span>
        </h1>

        <div className="mt-[clamp(18px,3.2svh,36px)] flex flex-col gap-5 lg:flex-row lg:items-end lg:gap-[clamp(24px,3vw,56px)]">
          <p data-keepout className="hero-fade max-w-[34ch] text-16 leading-[1.45] md:text-18" style={{ ["--i" as string]: 0 }}>
            Custom stickers and product labels, cut to any shape. Send your artwork or let our designers make
            it. You approve a free proof before we print.
          </p>
          <div data-keepout className="hero-fade flex flex-col gap-3 sm:flex-row" style={{ ["--i" as string]: 1 }}>
            <a href="#pricing" className="btn btn-primary">
              Get instant pricing
              <Arrow />
            </a>
            <a href="#samples" className="btn btn-secondary">
              Order a sample kit
            </a>
          </div>
          <StickerControls />
        </div>
      </div>

      <StickerTable />
    </section>
  );
}
