import type { ReactNode } from "react";

export type Tone = "liner" | "ink" | "deep" | "signal";

/**
 * One sticker on a sheet (or a label on a roll): a face that can tilt and lift, the shadow it
 * casts on the liner, and its corner folded back. Styles: `.cell*` in globals.css; motion:
 * sheet/cells.ts. `area` names the grid area (`.cell-<area>`).
 */
export function Cell({ area, tone, children }: { area: string; tone: Tone; children: ReactNode }) {
  return (
    <li className={`cell cell-${area}`} data-cell={area} data-tone={tone}>
      <div className="cell-shadow" aria-hidden="true" />
      <div className="cell-lift" data-lift>
        <div className="cell-body" data-body>
          <div className="cell-face">{children}</div>
          {/* the corner, folded back: its paper side */}
          <div className="cell-flap" aria-hidden="true">
            <i />
          </div>
        </div>
      </div>
    </li>
  );
}
