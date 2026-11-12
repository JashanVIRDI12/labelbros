/**
 * Where each sticker starts. x is a fraction of the hero width. y is a fraction of the sticker
 * band (from under the header to the top of the headline), or of the full hero height for items
 * in the "full" zone (the free space beside the headline). rot is in degrees.
 * The stage then nudges every start position clear of the text.
 */
export type Placement = {
  id: string;
  x: number;
  y: number;
  rot: number;
  /** size multiplier for this placement (1 = the layout scale) */
  s?: number;
  zone?: "band" | "full";
  minWidth?: number;
  minBand?: number;
};
export type Layout = {
  name: "desktop" | "laptop" | "mobile";
  scale: (w: number, h: number, band: number) => number;
  items: Placement[];
};

// Product labels first (Label Bros is a label shop), stickers between them, in two loose rows
// above the headline and a column beside it (client, 2026-11-11: bigger, a few more, but not
// piled up). The stage spaces them out further for each screen (spread() in stage.ts).
// Wide screens: one wavy row of labels and stickers across the top, accents tucked under it,
// and a column beside the headline. Extras join as the screen widens.
export const DESKTOP: Layout = {
  name: "desktop",
  scale: (w, h, band) => Math.min(1.35, Math.max(0.8, Math.min(w / 1440, h / 860, band / 390))),
  items: [
    { id: "fire-escape", x: 0.065, y: 0.42, rot: -12 },
    { id: "old-harbor", x: 0.175, y: 0.62, rot: 7, s: 0.92 },
    { id: "sunday-jam", x: 0.275, y: 0.34, rot: -6 },
    { id: "beeline", x: 0.355, y: 0.82, rot: -6, s: 0.78, minWidth: 1600 },
    { id: "label-bros", x: 0.45, y: 0.3, rot: -4 },
    { id: "new-burst", x: 0.47, y: 0.86, rot: 6, s: 0.8 },
    { id: "tidewater", x: 0.61, y: 0.6, rot: 5 },
    { id: "fresh", x: 0.68, y: 0.92, rot: 4, s: 0.72, minWidth: 1600 },
    { id: "night-shift", x: 0.74, y: 0.36, rot: -8 },
    { id: "thank-you", x: 0.85, y: 0.64, rot: 10, s: 0.85 },
    { id: "wild-fern", x: 0.945, y: 0.36, rot: -9, s: 0.9 },
    { id: "ember-oak", x: 0.89, y: 0.57, rot: -7, zone: "full" },
    { id: "caution", x: 0.9, y: 0.73, rot: 8, zone: "full", s: 0.8, minWidth: 1380 },
    { id: "approved", x: 0.95, y: 0.9, rot: -10, zone: "full", s: 0.88 },
  ],
};

// Laptops (768-1279): a shorter table, so one loose row and a column beside the headline.
export const LAPTOP: Layout = {
  name: "laptop",
  scale: (w, h, band) => Math.min(1, Math.max(0.7, Math.min(w / 1440, h / 860, band / 390))),
  items: [
    { id: "fire-escape", x: 0.08, y: 0.42, rot: -12, s: 0.95 },
    { id: "old-harbor", x: 0.17, y: 0.78, rot: 7, s: 0.85 },
    { id: "sunday-jam", x: 0.26, y: 0.36, rot: -6 },
    { id: "new-burst", x: 0.34, y: 0.86, rot: 6, s: 0.75 },
    { id: "label-bros", x: 0.47, y: 0.32, rot: -4 },
    { id: "tidewater", x: 0.63, y: 0.68, rot: 5, s: 0.9 },
    { id: "night-shift", x: 0.78, y: 0.38, rot: -8, s: 0.95 },
    { id: "wild-fern", x: 0.945, y: 0.4, rot: -9, s: 0.85 },
    { id: "ember-oak", x: 0.87, y: 0.56, rot: -7, zone: "full", s: 0.95 },
    { id: "thank-you", x: 0.9, y: 0.76, rot: 10, zone: "full", s: 0.8, minWidth: 900 },
    { id: "approved", x: 0.955, y: 0.92, rot: -10, zone: "full", s: 0.82, minWidth: 1024 },
  ],
};

export const MOBILE: Layout = {
  name: "mobile",
  scale: (w, _h, band) => Math.min(0.72, Math.max(0.4, Math.min((w / 390) * 0.56, (band / 350) * 0.56))),
  items: [
    { id: "sunday-jam", x: 0.15, y: 0.24, rot: -10 },
    { id: "label-bros", x: 0.6, y: 0.16, rot: -5 },
    { id: "old-harbor", x: 0.38, y: 0.62, rot: 8 },
    { id: "tidewater", x: 0.8, y: 0.52, rot: -7 },
    { id: "night-shift", x: 0.1, y: 0.78, rot: 9, minBand: 260 },
    { id: "thank-you", x: 0.64, y: 0.92, rot: 12 },
    { id: "new-burst", x: 0.92, y: 0.9, rot: 12, minBand: 280 },
  ],
};

export function pickLayout(w: number): Layout {
  return w < 768 ? MOBILE : w < 1280 ? LAPTOP : DESKTOP;
}
