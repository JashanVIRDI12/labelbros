/** Artwork-derived cut lines, shared by the WebGL and SVG previews. Coordinates are 0–1. */
export type Point = [number, number];
export type Cutline = {
  points: Point[];
  aspect: number;
  crop: { x: number; y: number; w: number; h: number };
  inset: { x: number; y: number; w: number; h: number };
};
type Pixels = { width: number; height: number; data: Uint8ClampedArray };

/** Only remove a flat background when it dominates the perimeter, never an interior colour. */
function silhouette({ width: w, height: h, data }: Pixels) {
  const mask = new Uint8Array(w * h);
  let transparent = 0;
  for (let i = 0; i < mask.length; i++) {
    mask[i] = data[i * 4 + 3] > 24 ? 1 : 0;
    if (!mask[i]) transparent++;
  }
  if (transparent > mask.length * 0.005) return mask;

  const edge: number[] = [];
  for (let x = 0; x < w; x++) edge.push(x, (h - 1) * w + x);
  for (let y = 1; y < h - 1; y++) edge.push(y * w, y * w + w - 1);
  const bins = new Map<number, number[]>();
  for (const p of edge) {
    const i = p * 4;
    const key = (data[i] >> 4) * 256 + (data[i + 1] >> 4) * 16 + (data[i + 2] >> 4);
    const bin = bins.get(key) ?? [0, 0, 0, 0];
    for (let c = 0; c < 3; c++) bin[c] += data[i + c];
    bin[3]++;
    bins.set(key, bin);
  }
  const best = [...bins.values()].sort((a, b) => b[3] - a[3])[0];
  if (!best) return mask;
  const bg = best.slice(0, 3).map((v) => v / best[3]);
  const matches = (p: number) => bg.reduce((d, v, c) => d + (data[p * 4 + c] - v) ** 2, 0) < 28 ** 2;
  if (edge.filter(matches).length < edge.length * 0.85) return mask;

  const queue = new Int32Array(w * h);
  const exterior = new Uint8Array(w * h);
  let head = 0;
  let tail = 0;
  const visit = (p: number) => {
    if (!exterior[p] && matches(p)) {
      exterior[p] = 1;
      queue[tail++] = p;
    }
  };
  edge.forEach(visit);
  while (head < tail) {
    const p = queue[head++];
    if (p % w) visit(p - 1);
    if (p % w < w - 1) visit(p + 1);
    if (p >= w) visit(p - w);
    if (p < w * (h - 1)) visit(p + w);
  }
  // A blank file has no silhouette; keep its rectangular bounds as the honest fallback.
  if (tail < w * h * 0.995) for (let p = 0; p < mask.length; p++) if (exterior[p]) mask[p] = 0;
  return mask;
}

/** Join separate letters/details by the shortest raster bridges, so the result is one sticker. */
function joinIslands(mask: Uint8Array, w: number, h: number) {
  const owner = new Int32Array(mask.length).fill(-1);
  const parent = new Int32Array(mask.length).fill(-1);
  const queue = new Int32Array(mask.length);
  const roots: number[] = [];
  let tail = 0;
  const neighbours = (p: number) => [p % w ? p - 1 : -1, p % w < w - 1 ? p + 1 : -1, p >= w ? p - w : -1, p < w * (h - 1) ? p + w : -1];
  for (let p = 0; p < mask.length; p++) {
    if (!mask[p] || owner[p] !== -1) continue;
    const id = roots.length;
    roots.push(id);
    let head = tail;
    owner[p] = id;
    queue[tail++] = p;
    while (head < tail) for (const n of neighbours(queue[head++])) {
      if (n >= 0 && mask[n] && owner[n] === -1) {
        owner[n] = id;
        queue[tail++] = n;
      }
    }
  }
  const root = (id: number): number => {
    while (roots[id] !== id) {
      roots[id] = roots[roots[id]];
      id = roots[id];
    }
    return id;
  };
  let remaining = roots.length;
  for (let head = 0; head < tail && remaining > 1; head++) {
    const p = queue[head];
    for (const n of neighbours(p)) {
      if (n < 0) continue;
      if (owner[n] === -1) {
        owner[n] = owner[p];
        parent[n] = p;
        queue[tail++] = n;
      } else if (root(owner[n]) !== root(owner[p])) {
        roots[root(owner[n])] = root(owner[p]);
        remaining--;
        for (const start of [p, n]) for (let v = start; v !== -1; v = parent[v]) mask[v] = 1;
      }
    }
  }
}

/** Round outward offset via a two-pass distance field; no stripe/box-shaped dilation. */
function offset(mask: Uint8Array, w: number, h: number, radius: number) {
  const d = Float32Array.from(mask, (v) => v ? 0 : 1e6);
  const diag = Math.SQRT2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const p = y * w + x;
    if (x) d[p] = Math.min(d[p], d[p - 1] + 1);
    if (y) d[p] = Math.min(d[p], d[p - w] + 1);
    if (x && y) d[p] = Math.min(d[p], d[p - w - 1] + diag);
    if (x < w - 1 && y) d[p] = Math.min(d[p], d[p - w + 1] + diag);
  }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
    const p = y * w + x;
    if (x < w - 1) d[p] = Math.min(d[p], d[p + 1] + 1);
    if (y < h - 1) d[p] = Math.min(d[p], d[p + w] + 1);
    if (x < w - 1 && y < h - 1) d[p] = Math.min(d[p], d[p + w + 1] + diag);
    if (x && y < h - 1) d[p] = Math.min(d[p], d[p + w - 1] + diag);
  }
  return Uint8Array.from(d, (v) => v <= radius ? 1 : 0);
}

/** Follow exposed pixel edges. The largest loop is the exterior; enclosed holes stay on film. */
function contour(mask: Uint8Array, w: number, h: number): Point[] {
  const edges = new Map<number, number>();
  const stride = w + 1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const p = y * w + x;
    if (!mask[p]) continue;
    const tl = y * stride + x;
    if (!y || !mask[p - w]) edges.set(tl, tl + 1);
    if (x === w - 1 || !mask[p + 1]) edges.set(tl + 1, tl + 1 + stride);
    if (y === h - 1 || !mask[p + w]) edges.set(tl + 1 + stride, tl + stride);
    if (!x || !mask[p - 1]) edges.set(tl + stride, tl);
  }
  let best: Point[] = [];
  while (edges.size) {
    const start = edges.keys().next().value!;
    const loop: Point[] = [];
    let p: number | undefined = start;
    while (p !== undefined && edges.has(p)) {
      loop.push([p % stride, Math.floor(p / stride)]);
      const next: number | undefined = edges.get(p);
      edges.delete(p);
      p = next;
    }
    if (loop.length > best.length) best = loop;
  }
  return best;
}

function simplify(points: Point[], epsilon = 0.8): Point[] {
  if (points.length <= 2) return points;
  const [ax, ay] = points[0];
  const [bx, by] = points[points.length - 1];
  const dx = bx - ax;
  const dy = by - ay;
  let max = 0;
  let at = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
    const distance = Math.hypot(x - ax - t * dx, y - ay - t * dy);
    if (distance > max) { max = distance; at = i; }
  }
  return max > epsilon ? [...simplify(points.slice(0, at + 1), epsilon).slice(0, -1), ...simplify(points.slice(at), epsilon)] : [points[0], points[points.length - 1]];
}

/** Bounded pixel analysis: transparent silhouettes, or a border-connected flat background. */
export function traceArtwork(pixels: Pixels): { cutline: Cutline | null; alpha: Uint8Array } {
  const { width: w, height: h } = pixels;
  const alpha = silhouette(pixels);
  let left = w, top = h, right = -1, bottom = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (alpha[y * w + x]) {
    left = Math.min(left, x); top = Math.min(top, y);
    right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  if (right < left) return { cutline: null, alpha };
  const cw = right - left + 1, ch = bottom - top + 1;
  const border = Math.max(3, Math.round(Math.min(cw, ch) * 0.035));
  const pad = border + 2;
  const W = cw + pad * 2, H = ch + pad * 2;
  const mask = new Uint8Array(W * H);
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) mask[(y + pad) * W + x + pad] = alpha[(y + top) * w + x + left];
  joinIslands(mask, W, H);
  const points = contour(offset(mask, W, H, border), W, H);
  if (!points.length) return { cutline: null, alpha };
  const half = Math.floor(points.length / 2);
  const simple = [...simplify(points.slice(0, half + 1)).slice(0, -1), ...simplify([...points.slice(half), points[0]]).slice(0, -1)];
  // Trim the unused safety margin, so the cut line's outer bounds match the chosen inches.
  const minX = Math.min(...simple.map((p) => p[0])), maxX = Math.max(...simple.map((p) => p[0]));
  const minY = Math.min(...simple.map((p) => p[1])), maxY = Math.max(...simple.map((p) => p[1]));
  return {
    alpha,
    cutline: {
      aspect: (maxX - minX) / (maxY - minY),
      points: simple.map(([x, y]) => [(x - minX) / (maxX - minX), (y - minY) / (maxY - minY)]),
      crop: { x: left / w, y: top / h, w: cw / w, h: ch / h },
      inset: { x: (pad - minX) / (maxX - minX), y: (pad - minY) / (maxY - minY), w: cw / (maxX - minX), h: ch / (maxY - minY) },
    },
  };
}

/** A die-cut size is its longest side; the artwork determines the other dimension. */
export function artworkSize(longest: number, aspect: number) {
  const r2 = (v: number) => Math.max(0.01, Math.round(v * 100) / 100);
  return aspect >= 1 ? { w: longest, h: r2(longest / aspect) } : { w: r2(longest * aspect), h: longest };
}

/** Fit without stretching, including when a caller supplies a differently proportioned box. */
export function fitCutline(cutline: Cutline, w: number, h: number): Cutline {
  const boxAspect = w / h;
  const sx = Math.min(1, cutline.aspect / boxAspect);
  const sy = Math.min(1, boxAspect / cutline.aspect);
  const ox = (1 - sx) / 2, oy = (1 - sy) / 2;
  return {
    ...cutline,
    points: cutline.points.map(([x, y]) => [ox + x * sx, oy + y * sy]),
    inset: { x: ox + cutline.inset.x * sx, y: oy + cutline.inset.y * sy, w: cutline.inset.w * sx, h: cutline.inset.h * sy },
  };
}

/** Rounded quadratic corners preserve the traced concavities without jagged pixel steps. */
export function cutlinePath(cutline: Cutline, x: number, y: number, w: number, h: number) {
  const p = cutline.points.map(([u, v]) => [x + u * w, y + v * h]);
  const mid = (a: number[], b: number[]) => `${((a[0] + b[0]) / 2).toFixed(4)},${((a[1] + b[1]) / 2).toFixed(4)}`;
  let d = `M${mid(p[p.length - 1], p[0])}`;
  p.forEach((v, i) => { d += `Q${v[0].toFixed(4)},${v[1].toFixed(4)} ${mid(v, p[(i + 1) % p.length])}`; });
  return `${d}Z`;
}

export type PreparedArtwork = { img: HTMLImageElement; print: HTMLCanvasElement; cutline: Cutline | null };

export async function prepareArtwork(src: string): Promise<PreparedArtwork> {
  const img = new Image();
  img.decoding = "async";
  await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = reject; img.src = src; });
  const scale = Math.min(1, 320 / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const g = canvas.getContext("2d", { willReadFrequently: true })!;
  g.drawImage(img, 0, 0, canvas.width, canvas.height);
  const pixels = g.getImageData(0, 0, canvas.width, canvas.height);
  const { alpha, cutline } = traceArtwork(pixels);
  // Retain the artwork's colour and alpha detail; only the detected exterior drops out.
  for (let p = 0; p < alpha.length; p++) pixels.data[p * 4 + 3] = alpha[p] ? 255 : 0;
  g.putImageData(pixels, 0, 0);
  const print = document.createElement("canvas");
  const k = Math.min(1, 2048 / Math.max(img.naturalWidth, img.naturalHeight));
  print.width = Math.max(1, Math.round(img.naturalWidth * k));
  print.height = Math.max(1, Math.round(img.naturalHeight * k));
  const pg = print.getContext("2d")!;
  pg.drawImage(img, 0, 0, print.width, print.height);
  pg.globalCompositeOperation = "destination-in";
  pg.drawImage(canvas, 0, 0, print.width, print.height);
  return { img, print, cutline };
}
