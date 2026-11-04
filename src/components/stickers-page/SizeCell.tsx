"use client";

import { useState } from "react";
import Link from "next/link";
import { DimInput } from "@/components/sheet/DimInput";
import { SizeMat } from "@/components/sheet/SizeMat";
import { CUSTOM, DIE_RATIO, SIZES, clampSize } from "@/components/sheet/sizes";
import { Arrow } from "@/components/site/Arrow";
import { quoteHref } from "./art";
import { Sticker } from "./Sticker";

type Size = number | "custom";

/**
 * "Pick your size": the builder's sizes or a custom width × height, shown on an inch mat with the
 * house die-cut sticker (Liftoff), the same sticker and proportions the builder draws, so the
 * link arrives with exactly this size. Width and height are linked: a die-cut keeps its shape.
 */
export function SizeCell() {
  const [size, setSize] = useState<Size>(3);
  const [custom, setCustom] = useState({ w: 2.5, h: 2.5 * DIE_RATIO });

  // presets are the longest side, which for this sticker is its height
  const dims = size === "custom" ? custom : { w: size / DIE_RATIO, h: size };
  const href = size === "custom" ? quoteHref({ shape: "die-cut", w: dims.w, h: dims.h }) : quoteHref({ shape: "die-cut", size });

  const pick = (s: Size) => {
    // going custom starts from the size on the mat
    if (s === "custom" && size !== "custom") setCustom({ w: dims.w, h: dims.h });
    setSize(s);
  };
  const type = (changed: "w" | "h", n: number) =>
    setCustom(() => {
      if (changed === "w") {
        const w = clampSize(Math.min(n, CUSTOM.max / DIE_RATIO));
        return { w, h: w * DIE_RATIO };
      }
      const h = clampSize(n);
      return { w: h / DIE_RATIO, h };
    });

  return (
    <>
      <div className="cell-copy size-copy">
        <h3 className="cell-title">Pick your size</h3>
        <fieldset className="size-pick">
          <legend className="sr-only">Size, the longest side</legend>
          <div className="mini-chips">
            {[...SIZES, "custom" as const].map((s) => (
              <label key={s} className="mini-chip">
                <input type="radio" name="sheet-size" value={s} checked={size === s} onChange={() => pick(s)} />
                <span>{s === "custom" ? "Custom" : `${s} in`}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {size === "custom" && (
          <div className="custom-size-fields">
            <DimInput id="sheet-w" label="Width" value={custom.w} {...CUSTOM} onChange={(n) => type("w", n)} />
            <span className="custom-x" aria-hidden="true">
              ×
            </span>
            <DimInput id="sheet-h" label="Height" value={custom.h} {...CUSTOM} onChange={(n) => type("h", n)} />
          </div>
        )}
        <Link href={href} className="text-link cell-link">
          Price this size
          <Arrow />
        </Link>
      </div>
      <div className="cell-art size-art" aria-hidden="true">
        <SizeMat w={dims.w} h={dims.h}>
          <Sticker id="liftoff" />
        </SizeMat>
        <p className="size-note">One square = one inch</p>
      </div>
    </>
  );
}
