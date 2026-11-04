"use client";

import { useState } from "react";

type Props = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  className?: string;
  describedBy?: string;
  /** what the number counts; inches by default */
  unit?: { text: string; sr?: string };
  /** whole numbers only (a quantity) */
  whole?: boolean;
};

const tidy = (n: number) => String(Math.round(n * 100) / 100);

/**
 * A number you can type into: a size in inches, or a quantity (`whole`, with its own `unit`).
 * Valid numbers apply as you type (so a linked height can follow the width); a half-typed or
 * out-of-range value waits, and leaving the field tidies it.
 */
export function DimInput({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  className = "",
  describedBy,
  unit = { text: "in", sr: "ches" },
  whole = false,
}: Props) {
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <label className={`dim ${className}`} htmlFor={id}>
      <span className="dim-label">{label}</span>{" "}
      <span className="dim-field">
        <input
          id={id}
          type="number"
          inputMode={whole ? "numeric" : "decimal"}
          min={min}
          max={max}
          step={step}
          value={draft ?? tidy(value)}
          aria-describedby={describedBy}
          onChange={(e) => {
            setDraft(e.target.value);
            const n = whole ? Math.round(parseFloat(e.target.value)) : parseFloat(e.target.value);
            if (Number.isFinite(n) && n >= min && n <= max) onChange(n);
          }}
          onBlur={() => setDraft(null)}
        />
        <span className="dim-unit">
          {" "}
          {unit.text}
          {unit.sr ? <span className="sr-only">{unit.sr}</span> : null}
        </span>
      </span>
    </label>
  );
}
