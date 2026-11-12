import type { Metadata } from "next";
import { PolicyPage, type PolicySection } from "@/components/policy/PolicyPage";
import { FREE_SHIPPING, PROOF, REPRINT_WINDOW, RUSH, SHIPPING, SHIPS, WORLD_CARRIERS } from "@/lib/facts";
import { pageMeta } from "@/lib/meta";
import { BRAND } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: `Shipping · ${BRAND}`,
  description: `When your stickers ship, how they travel and what it costs. ${SHIPPING}; US and worldwide by ${WORLD_CARRIERS}, with a note on duties.`,
  path: "/shipping",
});

const SECTIONS: PolicySection[] = [
  {
    id: "when",
    title: "When it ships",
    blocks: [
      `${PROOF}. Once you approve it, we print, cut and ship in 2–4 business days.`,
      `In a hurry? ${RUSH}: ask us before you order. [[CONFIRM: rush fee]]`,
    ],
  },
  {
    id: "canada",
    title: "Shipping in Canada",
    blocks: [
      [
        `**Free** on orders over $${FREE_SHIPPING} CAD (the order total before tax).`,
        "Under that, a flat rate that you see in your cart and at checkout.",
        "Carriers: [[CANADA CARRIERS, e.g. Canada Post, UPS or Purolator]].",
        "Delivery after it ships: [[DELIVERY TIMES BY REGION, e.g. 1–3 business days in your province, 3–7 elsewhere]].",
      ],
    ],
  },
  {
    id: "world",
    title: "United States and worldwide",
    blocks: [
      [
        `We ship to the US and worldwide by ${WORLD_CARRIERS}. Prices and shipping are in US dollars, shown at checkout.`,
        "Delivery after it ships: [[US AND WORLDWIDE DELIVERY TIMES]].",
        "**Duties and import taxes:** your country may charge duties, taxes or brokerage fees when the parcel arrives. They aren't included in our prices, and the carrier may collect them from you on delivery. In the US this can apply to parcels of any value.",
      ],
    ],
  },
  {
    id: "tracking",
    title: "Tracking",
    blocks: ["When your order ships we email you [[CONFIRM: the tracking number]]. You can check your order's status any time on [Track my order](/track)."],
  },
  {
    id: "address",
    title: "Your address",
    blocks: ["Check your shipping address at checkout. If a parcel comes back because the address was wrong, we send it again at the cost of the new shipping. [[CONFIRM]]"],
  },
  {
    id: "damaged",
    title: "Lost or damaged parcels",
    blocks: [
      `If your parcel arrives damaged, tell us within ${REPRINT_WINDOW} of delivery, with your order number and photos, and we reprint it free. If it doesn't arrive, [contact us](/contact) and we track it down with the carrier. [[CONFIRM: how long to report a lost parcel]]`,
      "See our [reprint guarantee](/reprints) for everything it covers.",
    ],
  },
];

export default function ShippingPage() {
  return (
    <PolicyPage
      path="/shipping"
      name="Shipping"
      lines={["Out the", "door fast."]}
      lede="When your order ships, how it travels, what it costs, and what to know if you're outside Canada."
      facts={[SHIPPING, SHIPS, "US and worldwide in USD"]}
      sections={SECTIONS}
    />
  );
}
