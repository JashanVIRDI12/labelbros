/*
 * "Peach Club": the sample sticker used by the proof and the pricing preview (not a customer).
 * Drawn in a 260 × 250 box, centred on (130, 125).
 */

export const HULL =
  "M98 34 C 121 22, 150 6, 196 8 C 226 10, 244 22, 232 42 C 226 52, 224 64, 226 80 C 228 96, 230 112, 230 126 C 244 128, 252 172, 246 188 C 238 218, 186 242, 130 242 C 82 242, 40 226, 24 214 C 12 206, 8 166, 18 156 C 24 150, 30 140, 32 122 C 32 96, 52 58, 98 34 Z";
export const BODY =
  "M130 76 C 104 58, 54 66, 48 124 C 42 184, 88 226, 130 226 C 172 226, 218 184, 212 124 C 206 66, 156 58, 130 76 Z";
export const LEAF = "M134 72 C 142 38, 180 24, 214 32 C 202 64, 168 82, 134 72 Z";
export const VEIN = "M140 68 C 160 56, 182 44, 206 36";
export const STEM = "M128 76 C 126 62, 122 52, 112 42";
export const CLEFT = "M131 80 C 119 110, 119 156, 133 204";
export const BANNER = "M38 150 H222 Q228 150 228 156 V188 Q228 194 222 194 H38 Q32 194 32 188 V156 Q32 150 38 150 Z";

/** The printed art, without its die-cut border. */
export function PeachArt() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d={STEM} fill="none" stroke="#5b3a1e" strokeWidth="8" />
      <path d={LEAF} fill="#2f9e62" stroke="#1d1a17" strokeWidth="3.5" />
      <path d={VEIN} fill="none" stroke="#1e6b41" strokeWidth="2.5" />
      <path d={BODY} fill="#ff8c61" stroke="#1d1a17" strokeWidth="3.5" />
      <path d={CLEFT} fill="none" stroke="#e0603a" strokeWidth="4" />
      <ellipse cx="88" cy="116" rx="12" ry="22" transform="rotate(20 88 116)" fill="#ffc4a3" />
      <g transform="rotate(-6 130 172)">
        <path d={BANNER} fill="#1d1a17" />
        <text
          x="130"
          y="182"
          textAnchor="middle"
          fill="#ffe1c6"
          fontSize="27"
          fontWeight="900"
          letterSpacing="-0.6"
          style={{ fontFamily: "var(--font-archivo)", fontStretch: "112%" }}
        >
          PEACH CLUB
        </text>
      </g>
    </g>
  );
}
