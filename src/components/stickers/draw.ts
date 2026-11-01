"use client";

import { DESIGNS, renderSticker, stickerSize, yieldToMain, type StickerDesign } from "@/components/hero/engine/art";

/*
 * Draws a sample sticker into a page canvas. The hero's WebGL shader animates foil and
 * glitter; here the finish is baked into the pixels, and CSS (hue-rotate) moves the foil.
 */

function hsl(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

/** Silver areas become rainbow foil; black print and the white border stay as they are. */
function bakeHolo(c: HTMLCanvasElement) {
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  const { width: w, height: h } = c;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3] < 8) continue;
      const max = Math.max(d[i], d[i + 1], d[i + 2]);
      const min = Math.min(d[i], d[i + 1], d[i + 2]);
      if (max - min > 22 || max < 150 || max > 246) continue;
      const t = (x / w) * 0.85 + (y / h) * 0.55;
      const band = 0.5 + 0.5 * Math.sin((x / w) * 9 + (y / h) * 4);
      const [r, g, b] = hsl((t * 420 + band * 40) % 360, 0.8, 0.76);
      const shade = (max - 150) / 96; // keep the art's own light and dark
      const m = 0.82 + 0.18 * shade;
      d[i] = r * m;
      d[i + 1] = g * m;
      d[i + 2] = b * m;
    }
  }
  ctx.putImageData(img, 0, 0);
}

/** Flecks of light over the coloured face. */
function bakeGlitter(c: HTMLCanvasElement, scale: number) {
  const ctx = c.getContext("2d")!;
  let s = 1234567;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  const n = Math.round((c.width * c.height) / (90 * scale * scale));
  for (let i = 0; i < n; i++) {
    const x = rnd() * c.width;
    const y = rnd() * c.height;
    const r = (0.6 + rnd() * 1.3) * scale;
    ctx.fillStyle = rnd() > 0.5 ? `rgba(255,255,255,${0.35 + rnd() * 0.5})` : `rgba(255,190,225,${0.3 + rnd() * 0.4})`;
    ctx.fillRect(x, y, r, r);
  }
  ctx.restore();
}

async function paint(canvas: HTMLCanvasElement, design: StickerDesign) {
  const cssW = canvas.getBoundingClientRect().width || canvas.clientWidth || 200;
  const { width } = stickerSize(design);
  const scale = Math.min(3, Math.max(1, (cssW / width) * (window.devicePixelRatio || 1)));
  const r = await renderSticker(design, scale, { mask: false });
  await yieldToMain();
  // the finished artwork already shows its finish; only the drawn version needs it baked in
  if (!design.image && design.finish === "holo") bakeHolo(r.canvas);
  if (!design.image && design.finish === "glitter") bakeGlitter(r.canvas, scale);
  canvas.width = r.canvas.width;
  canvas.height = r.canvas.height;
  canvas.getContext("2d")!.drawImage(r.canvas, 0, 0);
  canvas.dataset.ready = "true";
}

export async function drawSticker(canvas: HTMLCanvasElement, id: string, isCancelled: () => boolean) {
  const design = DESIGNS.find((d) => d.id === id);
  if (!design || isCancelled()) return;
  await paint(canvas, design);
}
