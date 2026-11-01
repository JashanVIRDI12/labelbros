/*
 * A flat label peeling off its stack, in plain 2D. The fold is a straight line that travels in
 * from the bottom-right corner along `d`. Everything on the corner side of the line is lifted:
 * it is cut from the face and shown again as the paper back, mirrored across the fold.
 * The same geometry as the peeling buttons, at card scale.
 */

export type Pt = [number, number];

export type PeelShape = {
  /** clip-path for the face (what is still stuck down) */
  face: string;
  /** clip-path for the flap, in the card's own coordinates (before the mirror) */
  flap: string;
  /** CSS matrix that mirrors the flap across the fold line */
  matrix: string;
  /** how far the fold can travel before the label is fully off */
  max: number;
};

const EMPTY = "polygon(0px 0px, 0px 0px, 0px 0px)";

function clipHalf(poly: Pt[], f: (p: Pt) => number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const fa = f(a);
    const fb = f(b);
    if (fa >= 0) out.push(a);
    if (fa >= 0 !== fb >= 0) {
      const t = fa / (fa - fb);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}

const poly = (pts: Pt[]) =>
  pts.length < 3 ? EMPTY : `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})`;

/**
 * @param w,h  card size in px
 * @param s    how far the fold has travelled from the corner, in px (0 = flat)
 * @param angle direction of travel in radians, measured from "straight left" towards "straight up"
 * @param pad  extra room around the card, so a cut never trims anti-aliased corners
 */
export function peelShape(w: number, h: number, s: number, angle: number, pad = 2): PeelShape {
  const dx = -Math.cos(angle);
  const dy = -Math.sin(angle);
  const cx = w;
  const cy = h;
  const max = -(w * dx + h * dy); // distance to the far (top-left) corner along d
  const rect: Pt[] = [
    [-pad, -pad],
    [w + pad, -pad],
    [w + pad, h + pad],
    [-pad, h + pad],
  ];
  const f = (p: Pt) => (p[0] - cx) * dx + (p[1] - cy) * dy - s;
  const face = s <= 0 ? "none" : poly(clipHalf(rect, f));
  const flap = s <= 0 ? EMPTY : poly(clipHalf(rect, (p) => -f(p)));
  // mirror across the fold: P' = (I - 2ddT) P + 2 (C.d + s) d
  const k = 2 * (cx * dx + cy * dy + s);
  const a = 1 - 2 * dx * dx;
  const b = -2 * dx * dy;
  const d = 1 - 2 * dy * dy;
  const matrix = `matrix(${a.toFixed(5)},${b.toFixed(5)},${b.toFixed(5)},${d.toFixed(5)},${(k * dx).toFixed(2)},${(k * dy).toFixed(2)})`;
  return { face, flap, matrix, max };
}
