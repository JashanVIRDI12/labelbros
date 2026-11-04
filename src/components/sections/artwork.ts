"use client";

import { CX, CY, SPAN, rounded, type Art } from "./pricing-model";

/*
 * An uploaded design, made ready for the pricing mat, all in the browser (the file is not sent
 * anywhere): drawn down to a light preview image and given a die-cut line traced round it, like
 * the white border a cutter leaves. Transparent artwork is traced round its own shape (holes
 * filled; pieces that stay apart are joined by a wider border, or failing that one line round
 * them all); a photo or a flat background gets a rounded rectangle. Files a browser cannot draw
 * (PDF, AI, EPS, PSD, most TIFs) get no preview: `prepare` returns null.
 */

export const ACCEPT = ".pdf,.ai,.eps,.svg,.png,.jpg,.jpeg,.tif,.tiff,.psd";
const KINDS = ["pdf", "ai", "eps", "svg", "png", "jpg", "jpeg", "tif", "tiff", "psd"];
export const extOf = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";
export const accepted = (file: File) => KINDS.includes(extOf(file.name));

const PREVIEW = 1200; // px, the preview image's longest side
const TRACE = 220; // px, the longest side the outline is traced at
const BORDER = 0.05; // the white border, as a share of the longest side

type Pt = [number, number];

export async function prepare(file: File): Promise<Art | null> {
  const src = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = src;
    await img.decode();
    const nw = img.naturalWidth || 512;
    const nh = img.naturalHeight || 512;

    // the preview: a light copy, so a 6000 px file does not slow the mat down
    const ps = Math.min(1, PREVIEW / Math.max(nw, nh));
    const pc = canvas(Math.round(nw * ps), Math.round(nh * ps));
    pc.getContext("2d")!.drawImage(img, 0, 0, pc.width, pc.height);
    const blob = await new Promise<Blob | null>((done) => pc.toBlob(done, "image/png"));
    if (!blob) return null;
    const href = URL.createObjectURL(blob);

    // the outline: traced on a small copy with room round it for the border
    const ts = TRACE / Math.max(nw, nh);
    const iw = Math.max(1, Math.round(nw * ts));
    const ih = Math.max(1, Math.round(nh * ts));
    const b = Math.max(3, Math.round(TRACE * BORDER));
    const pad = Math.ceil(b * 2.6) + 2;
    const W = iw + pad * 2;
    const H = ih + pad * 2;
    const tc = canvas(W, H);
    const g = tc.getContext("2d", { willReadFrequently: true })!;
    g.drawImage(img, pad, pad, iw, ih);
    const px = g.getImageData(0, 0, W, H).data;

    const mask = new Uint8Array(W * H);
    let clear = 0;
    let ink = 0;
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const a = px[(y * W + x) * 4 + 3];
        const inside = x >= pad && x < pad + iw && y >= pad && y < pad + ih;
        if (inside && a < 16) clear++;
        if (a > 60) {
          mask[y * W + x] = 1;
          ink++;
        }
      }
    const opaque = clear / (iw * ih) < 0.03 || ink === 0;

    if (opaque) {
      const bounds = { x0: pad - b, y0: pad - b, x1: pad + iw + b, y1: pad + ih + b };
      const p = place(bounds, pad, iw, ih);
      const w = (bounds.x1 - bounds.x0) * p.s;
      const h = (bounds.y1 - bounds.y0) * p.s;
      return { href, box: p.box, cut: rounded(w, h, Math.min(w, h) * 0.1), ratio: p.ratio, opaque: true };
    }

    // grow the ink by the border until it is one piece; trace round that
    let outline: Pt[] | null = null;
    for (const r of [b, b * 1.7, b * 2.5]) {
      const shape = fillHoles(dilate(mask, W, H, r), W, H);
      if (onePiece(shape, W, H)) {
        outline = smooth(simplify(trace(shape, W, H), 0.8), 2);
        break;
      }
    }
    if (!outline) outline = smooth(hull(dilate(mask, W, H, b), W, H), 2);
    if (outline.length < 3) return null;

    const bounds = boundsOf(outline);
    const p = place(bounds, pad, iw, ih);
    const cut = `M${outline.map(([x, y]) => p.map(x, y).map((v) => v.toFixed(1)).join(" ")).join("L")}Z`;
    return { href, box: p.box, cut, ratio: p.ratio, opaque: false };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(src);
  }
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, w);
  c.height = Math.max(1, h);
  return c;
}

/** Fit the traced outline into the mat's art space: longest side SPAN, centred on (CX, CY). */
function place(bounds: { x0: number; y0: number; x1: number; y1: number }, pad: number, iw: number, ih: number) {
  const bw = bounds.x1 - bounds.x0;
  const bh = bounds.y1 - bounds.y0;
  const s = SPAN / Math.max(bw, bh);
  const mx = (bounds.x0 + bounds.x1) / 2;
  const my = (bounds.y0 + bounds.y1) / 2;
  return {
    s,
    ratio: bh / bw,
    map: (x: number, y: number): Pt => [CX + (x - mx) * s, CY + (y - my) * s],
    box: { x: CX + (pad - mx) * s, y: CY + (pad - my) * s, w: iw * s, h: ih * s },
  };
}

function boundsOf(pts: Pt[]) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) {
    if (x < x0) x0 = x;
    if (y < y0) y0 = y;
    if (x > x1) x1 = x;
    if (y > y1) y1 = y;
  }
  return { x0, y0, x1, y1 };
}

/** Every pixel within `r` of the ink (a two-pass chamfer distance). */
function dilate(mask: Uint8Array, W: number, H: number, r: number) {
  const d = new Float32Array(W * H);
  for (let i = 0; i < d.length; i++) d[i] = mask[i] ? 0 : 1e9;
  const D = Math.SQRT2;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      let v = d[i];
      if (v === 0) continue;
      if (x > 0) v = Math.min(v, d[i - 1] + 1);
      if (y > 0) {
        v = Math.min(v, d[i - W] + 1);
        if (x > 0) v = Math.min(v, d[i - W - 1] + D);
        if (x < W - 1) v = Math.min(v, d[i - W + 1] + D);
      }
      d[i] = v;
    }
  for (let y = H - 1; y >= 0; y--)
    for (let x = W - 1; x >= 0; x--) {
      const i = y * W + x;
      let v = d[i];
      if (v === 0) continue;
      if (x < W - 1) v = Math.min(v, d[i + 1] + 1);
      if (y < H - 1) {
        v = Math.min(v, d[i + W] + 1);
        if (x < W - 1) v = Math.min(v, d[i + W + 1] + D);
        if (x > 0) v = Math.min(v, d[i + W - 1] + D);
      }
      d[i] = v;
    }
  const out = new Uint8Array(W * H);
  for (let i = 0; i < d.length; i++) out[i] = d[i] <= r ? 1 : 0;
  return out;
}

/** Fill the holes: everything the outside cannot reach is part of the sticker. */
function fillHoles(mask: Uint8Array, W: number, H: number) {
  const outside = new Uint8Array(W * H);
  const stack: number[] = [];
  const push = (i: number) => {
    if (!mask[i] && !outside[i]) {
      outside[i] = 1;
      stack.push(i);
    }
  };
  for (let x = 0; x < W; x++) {
    push(x);
    push((H - 1) * W + x);
  }
  for (let y = 0; y < H; y++) {
    push(y * W);
    push(y * W + W - 1);
  }
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % W;
    if (x > 0) push(i - 1);
    if (x < W - 1) push(i + 1);
    if (i >= W) push(i - W);
    if (i < W * (H - 1)) push(i + W);
  }
  const out = new Uint8Array(W * H);
  for (let i = 0; i < out.length; i++) out[i] = outside[i] ? 0 : 1;
  return out;
}

/** Is the shape one connected piece (8-connected)? */
function onePiece(mask: Uint8Array, W: number, H: number) {
  const seen = new Uint8Array(W * H);
  let pieces = 0;
  for (let s = 0; s < mask.length; s++) {
    if (!mask[s] || seen[s]) continue;
    if (++pieces > 1) return false;
    const stack = [s];
    seen[s] = 1;
    while (stack.length) {
      const i = stack.pop()!;
      const x = i % W;
      const y = (i - x) / W;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const j = ny * W + nx;
          if (mask[j] && !seen[j]) {
            seen[j] = 1;
            stack.push(j);
          }
        }
    }
  }
  return pieces === 1;
}

// the eight neighbours, clockwise from the west (y runs down)
const RING: Pt[] = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]];

/** The outer boundary of a one-piece shape, walked clockwise (Moore neighbourhood tracing). */
function trace(mask: Uint8Array, W: number, H: number): Pt[] {
  const on = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && mask[y * W + x] === 1;
  let start = -1;
  for (let i = 0; i < mask.length; i++)
    if (mask[i]) {
      start = i;
      break;
    }
  if (start < 0) return [];
  const sx = start % W;
  const sy = (start - sx) / W;
  const pts: Pt[] = [];
  let x = sx;
  let y = sy;
  let back = 0; // came in from the west: everything before the first pixel is background
  for (let guard = 0; guard < W * H * 4; guard++) {
    pts.push([x + 0.5, y + 0.5]);
    let moved = false;
    for (let k = 1; k <= 8; k++) {
      const dir = (back + k) % 8;
      const nx = x + RING[dir][0];
      const ny = y + RING[dir][1];
      if (!on(nx, ny)) continue;
      // the last background pixel checked becomes the new backtrack, seen from the new pixel
      const prev = (back + k - 1) % 8;
      const bx = x + RING[prev][0];
      const by = y + RING[prev][1];
      x = nx;
      y = ny;
      back = Math.max(0, RING.findIndex(([dx, dy]) => x + dx === bx && y + dy === by));
      moved = true;
      break;
    }
    if (!moved || (x === sx && y === sy)) break;
  }
  return pts;
}

/** Ramer–Douglas–Peucker: drop the points within `eps` px of the line through their neighbours. */
function simplify(pts: Pt[], eps: number): Pt[] {
  if (pts.length < 4) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack: [number, number][] = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, z] = stack.pop()!;
    const [ax, ay] = pts[a];
    const [zx, zy] = pts[z];
    const len = Math.hypot(zx - ax, zy - ay) || 1;
    let far = -1;
    let best = eps;
    for (let i = a + 1; i < z; i++) {
      const dist = Math.abs((zx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (zy - ay)) / len;
      if (dist > best) {
        best = dist;
        far = i;
      }
    }
    if (far > 0) {
      keep[far] = 1;
      stack.push([a, far], [far, z]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

/** Chaikin's corner cutting on a closed outline: rounds the pixel steps into a cutter's curve. */
function smooth(pts: Pt[], rounds: number): Pt[] {
  let out = pts;
  for (let r = 0; r < rounds; r++) {
    const next: Pt[] = [];
    for (let i = 0; i < out.length; i++) {
      const [ax, ay] = out[i];
      const [bx, by] = out[(i + 1) % out.length];
      next.push([ax * 0.75 + bx * 0.25, ay * 0.75 + by * 0.25], [ax * 0.25 + bx * 0.75, ay * 0.25 + by * 0.75]);
    }
    out = next;
  }
  return out;
}

/** One line round all the pieces: the convex hull of each row's ends (monotone chain). */
function hull(mask: Uint8Array, W: number, H: number): Pt[] {
  const pts: Pt[] = [];
  for (let y = 0; y < H; y++) {
    let first = -1;
    let last = -1;
    for (let x = 0; x < W; x++)
      if (mask[y * W + x]) {
        if (first < 0) first = x;
        last = x;
      }
    if (first >= 0) pts.push([first + 0.5, y + 0.5], [last + 0.5, y + 0.5]);
  }
  pts.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Pt[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Pt[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}
