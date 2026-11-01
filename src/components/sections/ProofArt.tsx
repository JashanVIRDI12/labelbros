import { BANNER, BODY, CLEFT, HULL, LEAF, PeachArt, STEM, VEIN } from "./peach";

/*
 * The proof in "How it works", built around the Peach Club sample sticker.
 * Layers, bottom to top: printed copies, shadow, the die-cut sticker (white border + art),
 * the pencil sketch it started as, and the cut line, drawn through a mask so it can stay dashed.
 */

// where the printed copies land in the last step
export const COPIES = [
  { x: -26, y: 22, r: -9 },
  { x: 24, y: 16, r: 7 },
  { x: -6, y: 34, r: -3 },
];

export function ProofArt() {
  return (
    <svg className="proof-svg" viewBox="-30 -24 320 300" aria-hidden="true">
      <defs>
        <filter id="pc-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <mask id="pc-cut" maskUnits="userSpaceOnUse" x="-30" y="-24" width="320" height="300">
          <path data-cut-draw d={HULL} fill="none" stroke="#fff" strokeWidth="6" />
        </mask>
        <g id="pc-art">
          <PeachArt />
        </g>
        <g id="pc-sticker">
          <path d={HULL} fill="#fff" />
          <use href="#pc-art" />
        </g>
      </defs>

      {/* where the artwork goes, before there is any */}
      <rect data-drop x="20" y="20" width="220" height="220" rx="18" fill="none" stroke="#9a9384" strokeWidth="2" strokeDasharray="8 7" />

      <g data-copies>
        {COPIES.map((_, i) => (
          <use key={i} data-copy href="#pc-sticker" opacity="0" />
        ))}
      </g>
      <path data-shadow d={HULL} fill="#1a1630" opacity="0" filter="url(#pc-blur)" transform="translate(4 12)" />

      <g data-sticker>
        <g data-border>
          <path d={HULL} fill="#fff" />
        </g>
        <use data-art href="#pc-art" />
      </g>

      {/* the rough sketch it starts as */}
      <g data-sketch fill="none" stroke="#3a3f5c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(-1.5 130 140)">
        <path d={BODY} />
        <path d={LEAF} />
        <path d={VEIN} />
        <path d={STEM} />
        <path d={CLEFT} />
        <path d={BANNER} transform="rotate(-6 130 172)" />
        <path d="M58 176 C 80 168, 100 174, 122 166 S 168 164, 200 154" transform="rotate(-3 130 172)" />
      </g>

      {/* the cut line: dashed, revealed by a solid stroke drawn underneath it in the mask */}
      <path data-cut d={HULL} fill="none" stroke="#e6007e" strokeWidth="1.8" strokeDasharray="6 5" mask="url(#pc-cut)" />
      <g data-note fontSize="15" fill="#1d1a17" style={{ fontFamily: "var(--font-archivo)", fontWeight: 600 }}>
        <path d="M246 196 L258 210 H288" fill="none" stroke="#1d1a17" strokeWidth="1.2" />
        <text x="226" y="228">
          Cut line
        </text>
      </g>
    </svg>
  );
}
