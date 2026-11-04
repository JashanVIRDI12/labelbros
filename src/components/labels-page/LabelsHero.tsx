import { PageHero } from "@/components/sheet/PageHero";
import { quoteHref } from "./art";

/* The labels page's promise. Below it, each label is smoothed on as it scrolls in. */
export function LabelsHero() {
  return (
    <PageHero
      id="labels-title"
      lines={["Labels", "that sell."]}
      lede="Product labels for bottles, jars, cans, tins and bags, on paper or vinyl, cut to fit your packaging. Send your artwork or let our designers make it. You approve a free proof before we print."
      priceHref={quoteHref({ shape: "rectangle" })}
      facts={[
        "Free proof before print",
        "From 25 labels",
        "On rolls or sheets",
      ]}
    />
  );
}
