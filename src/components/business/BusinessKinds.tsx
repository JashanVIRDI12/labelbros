import type { ReactNode } from "react";
import { Ph } from "@/components/service/Ph";
import { Asset, Badge, Bin, Inspection, Shipping, Warning } from "./labels";

/*
 * Every kind of business label, each with its own words (for readers and for search) and a
 * sample that prints itself in, line by line, as it scrolls into view, and turns right over
 * when you point at it (page-motion.ts).
 */
const KINDS: { title: string; body: string; label: ReactNode }[] = [
  {
    title: "Shipping and address labels",
    body: "Your return address and your logo on every box that leaves, in a size that fits your mailers.",
    label: <Shipping />,
  },
  {
    title: "Asset tags",
    body: "Tags for laptops, tools and equipment, so you know what you own and where it is. Numbered in sequence, with a barcode or QR code if you need one.",
    label: <Asset n={143} />,
  },
  {
    title: "Warning and safety labels",
    body: "Clear warnings in the colours people already know, for machines, rooms and products.",
    label: <Warning />,
  },
  {
    title: "Inspection and QC labels",
    body: "Checked, passed, approved: a mark for every stage of the work, with space to sign and date.",
    label: <Inspection />,
  },
  {
    title: "Bin and shelf labels",
    body: "Big location codes for shelves, bins and racks, readable from the aisle and easy to scan.",
    label: <Bin />,
  },
  {
    title: "Name badges",
    body: "For events, teams and visitors. Print them blank to write on, or with every name already on.",
    label: <Badge />,
  },
];

export function BusinessKinds() {
  return (
    <section className="kinds" aria-labelledby="kinds-title">
      <div className="kinds-head">
        <h2 id="kinds-title" className="section-title">
          A label for every job.
        </h2>
        <p className="kinds-lede">
          Every business label we print starts with a free proof, so you can check the wording, the numbers and the size
          before anything is printed.
        </p>
      </div>
      <ul className="kinds-list">
        {KINDS.map((k) => (
          <li key={k.title} className="kind">
            <div className="kind-label" data-print>
              {/* tilt (CSS) > spin (GSAP, on hover) > the label, and its paper back */}
              <div className="kind-tilt">
                <div className="kind-spin" data-spin>
                  <div className="spin-front">{k.label}</div>
                  <span className="spin-back kind-back" aria-hidden="true" />
                </div>
              </div>
            </div>
            <h3 className="kind-title">{k.title}</h3>
            <p className="kind-body">
              <Ph text={k.body} />
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
