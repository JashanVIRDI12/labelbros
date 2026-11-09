"use client";

import { useState } from "react";
import Link from "next/link";
import { DimInput } from "@/components/sheet/DimInput";
import { SizeMat } from "@/components/sheet/SizeMat";
import { CUSTOM, RECT_RATIO, SIZES } from "@/components/sheet/sizes";
import { Arrow } from "@/components/site/Arrow";
import { quoteHref } from "./art";

type Size = number | "custom";

/**
 * "Size it to your pack": the builder's sizes or any width × height (a rectangle label can take
 * any proportion), drawn to scale on an inch mat. The link carries the size into the builder.
 */
export function LabelSizeCell() {
  const [size, setSize] = useState<Size>(3);
  const [custom, setCustom] = useState({ w: 4, h: 2.5 });

  // presets are the longest side of the builder's rectangle (2:3)
  const dims = size === "custom" ? custom : { w: size, h: size * RECT_RATIO };
  const href =
    size === "custom"
      ? quoteHref({ shape: "rectangle", w: dims.w, h: dims.h })
      : quoteHref({ shape: "rectangle", size });

  const pick = (s: Size) => {
    if (s === "custom" && size !== "custom") setCustom({ w: dims.w, h: dims.h });
    setSize(s);
  };

  return (
    <>
      <div className="cell-copy size-copy">
        <h3 className="cell-title">Size it to your pack</h3>
        <fieldset className="size-pick">
          <legend className="sr-only">Label size</legend>
          <div className="mini-chips">
            {[...SIZES, "custom" as const].map((s) => (
              <label key={s} className="mini-chip">
                <input type="radio" name="label-size" value={s} checked={size === s} onChange={() => pick(s)} />
                <span>{s === "custom" ? "Custom" : `${s} in`}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {size === "custom" && (
          <div className="custom-size-fields">
            <DimInput
              id="label-w"
              label="Width"
              value={custom.w}
              {...CUSTOM}
              onChange={(w) => setCustom((c) => ({ ...c, w }))}
            />
            <span className="custom-x" aria-hidden="true">
              ×
            </span>
            <DimInput
              id="label-h"
              label="Height"
              value={custom.h}
              {...CUSTOM}
              onChange={(h) => setCustom((c) => ({ ...c, h }))}
            />
          </div>
        )}
        <Link href={href} className="text-link cell-link">
          Order this size
          <Arrow />
        </Link>
      </div>
      <div className="cell-art size-art" aria-hidden="true">
        <SizeMat w={dims.w} h={dims.h}>
          {/* a real label, cropped to whatever size is picked */}
          <span className="size-label" />
        </SizeMat>
        <p className="size-note">One square = one inch</p>
      </div>
    </>
  );
}
