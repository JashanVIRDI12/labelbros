import { PageHero } from "@/components/sheet/PageHero";
import { quoteHref } from "./art";

/* The stickers page's promise. The sheet below starts lying back on the table and stands up. */
export function StickersHero() {
  return (
    <PageHero
      id="stickers-title"
      lines={["Stickers", "people keep."]}
      lede="Die-cut to the shape of your art, in gloss, matte, holographic or glitter. Send your artwork or let our designers make it. You approve a free proof before we print."
      priceHref={quoteHref({ shape: "die-cut" })}
      facts={[
        "Free proof before print",
        "From 10 stickers",
        "Ships in 2–4 business days",
      ]}
    />
  );
}
