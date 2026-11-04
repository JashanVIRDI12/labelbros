import type { CSSProperties, ReactNode } from "react";
import { inches } from "./sizes";

/**
 * A cutting mat, one square to the inch, with something on it at a real size (w × h inches).
 * Big sizes zoom the mat out (more squares), so a square is always an inch. Decorative: the
 * controls beside it say the size in words.
 */
export function SizeMat({ w, h, children }: { w: number; h: number; children: ReactNode }) {
  // squares across: room for the item plus a margin, never fewer than 6; the mat is 3:2
  const n = Math.max(6, Math.ceil(w) + 1, Math.ceil((Math.ceil(h) + 1) * 1.5));
  const rows = n / 1.5;
  const step = n > 9 ? 2 : 1;
  const style = { "--n": n, "--rows": rows } as CSSProperties;

  return (
    <div className="size-mat" style={style} aria-hidden="true">
      <span className="size-ruler">
        {Array.from({ length: n - 1 }, (_, i) => i + 1)
          .filter((i) => i % step === 0)
          .map((i) => (
            <span key={i} style={{ "--i": i } as CSSProperties}>
              {i}
            </span>
          ))}
      </span>
      <div className="size-item" style={{ width: `${(w / n) * 100}%`, height: `${(h / rows) * 100}%` }}>
        {children}
      </div>
      <span className="size-dims">
        {inches(w)} × {inches(h)} in
      </span>
    </div>
  );
}
