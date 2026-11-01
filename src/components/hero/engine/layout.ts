/**
 * Where each sticker starts. x is a fraction of the hero width. y is a fraction of the sticker
 * band (from under the header to the top of the headline), or of the full hero height for items
 * in the "full" zone (the free space beside the headline). rot is in degrees.
 * The stage then nudges every start position clear of the text.
 */
export type Placement = { id: string; x: number; y: number; rot: number; zone?: "band" | "full"; minWidth?: number; minBand?: number };
export type Layout = {
  name: "desktop" | "mobile";
  scale: (w: number, h: number, band: number) => number;
  items: Placement[];
};

export const DESKTOP: Layout = {
  name: "desktop",
  scale: (w, h, band) => Math.min(1.35, Math.max(0.6, Math.min(w / 1440, h / 860, band / 390))),
  items: [
    { id: "fire-escape", x: 0.06, y: 0.42, rot: -12 },
    { id: "night-shift", x: 0.205, y: 0.38, rot: 8 },
    { id: "beeline", x: 0.36, y: 0.48, rot: -7 },
    { id: "label-bros", x: 0.53, y: 0.3, rot: -4 },
    { id: "thank-you", x: 0.675, y: 0.56, rot: 10 },
    { id: "hop-scotch", x: 0.81, y: 0.36, rot: -9 },
    { id: "new-burst", x: 0.955, y: 0.64, rot: 14 },
    { id: "fresh", x: 0.5, y: 0.8, rot: 4 },
    { id: "ember-oak", x: 0.83, y: 0.56, rot: -7, zone: "full" },
    { id: "caution", x: 0.92, y: 0.68, rot: 8, zone: "full", minWidth: 1024 },
    { id: "approved", x: 0.945, y: 0.88, rot: -10, zone: "full" },
  ],
};

export const MOBILE: Layout = {
  name: "mobile",
  scale: (w, _h, band) => Math.min(0.62, Math.max(0.34, Math.min((w / 390) * 0.5, (band / 350) * 0.5))),
  items: [
    { id: "fire-escape", x: 0.15, y: 0.3, rot: -12 },
    { id: "label-bros", x: 0.62, y: 0.22, rot: -5 },
    { id: "night-shift", x: 0.4, y: 0.66, rot: 8 },
    { id: "hop-scotch", x: 0.86, y: 0.62, rot: -9 },
    { id: "thank-you", x: 0.13, y: 0.8, rot: 10, minBand: 300 },
    { id: "new-burst", x: 0.66, y: 0.92, rot: 13 },
  ],
};

export function pickLayout(w: number): Layout {
  return w < 768 ? MOBILE : DESKTOP;
}
