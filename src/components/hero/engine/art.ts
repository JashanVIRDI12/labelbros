/*
 * Sticker artwork, drawn with Canvas 2D. Each design is sample customer art: the kind of
 * labels and stickers Label Bros prints (food, drink, candles, packaging, warning labels).
 * Brand colours here belong to the artwork, never to the site UI.
 */

export type Finish = "gloss" | "matte" | "holo" | "kraft" | "glitter";

import { loadFonts, type Fonts } from "./fonts";

export type { Fonts };

export type StickerDesign = {
  id: string;
  name: string;
  spec: string; // what it shows about the product, e.g. "Holographic vinyl · die-cut"
  finish: Finish;
  w: number; // art box in logical px, before the die-cut border
  h: number;
  border: number; // die-cut border in logical px (0 = cut to the art edge)
  /** Finished artwork (transparent WebP, die-cut border included), drawn at w × h logical px.
   * When it is missing or fails to load, `draw` paints the simpler vector version instead. */
  image?: { src: string; w: number; h: number };
  draw: (ctx: CanvasRenderingContext2D, f: Fonts) => void;
};

/* ---------------------------------------------------------------- helpers */

const TAU = Math.PI * 2;

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function setFont(ctx: CanvasRenderingContext2D, weight: number | string, size: number, family: string, stretch?: CanvasFontStretch) {
  ctx.font = `${weight} ${size}px ${family}`;
  if ("fontStretch" in ctx) ctx.fontStretch = stretch ?? "normal";
}

/** Size a font so its cap height is `cap` px, then shrink it if `fit.text` would run wider than
 * `fit.max` (tracking included). Returns the font size used. */
function capFont(
  ctx: CanvasRenderingContext2D,
  weight: number | string,
  cap: number,
  family: string,
  stretch?: CanvasFontStretch,
  fit?: { text: string; max: number; tracking?: number },
) {
  setFont(ctx, weight, 100, family, stretch);
  const m = ctx.measureText("H");
  const ratio = m.actualBoundingBoxAscent / 100 || 0.72;
  let size = cap / ratio;
  setFont(ctx, weight, size, family, stretch);
  if (fit) {
    const n = [...fit.text].length;
    const width = ctx.measureText(fit.text).width + (fit.tracking ?? 0) * (n - 1);
    if (width > fit.max) {
      size *= fit.max / width;
      setFont(ctx, weight, size, family, stretch);
    }
  }
  return size;
}

/** Letter-spaced text without relying on ctx.letterSpacing (not everywhere yet). */
function tracked(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, tracking: number, align: "left" | "center" | "right" = "center") {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (chars.length - 1);
  let cx = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
  const prev = ctx.textAlign;
  ctx.textAlign = "left";
  chars.forEach((c, i) => {
    ctx.fillText(c, cx, y);
    cx += widths[i] + tracking;
  });
  ctx.textAlign = prev;
  return total;
}

/** Text on a circle. `top`: reads clockwise over the top, glyphs point out. Otherwise reads
 * left-to-right along the bottom, glyphs point in, and `r` is the outer (baseline) radius. */
function arcText(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, r: number, center: number, tracking: number, top = true) {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (chars.length - 1);
  const span = total / r;
  let a = top ? center - span / 2 : center + span / 2;
  ctx.save();
  ctx.textAlign = "center";
  chars.forEach((c, i) => {
    const half = widths[i] / 2 / r;
    a += top ? half : -half;
    ctx.save();
    ctx.translate(cx + r * Math.cos(a), cy + r * Math.sin(a));
    ctx.rotate(top ? a + Math.PI / 2 : a - Math.PI / 2);
    ctx.fillText(c, 0, 0);
    ctx.restore();
    a += top ? half + tracking / r : -(half + tracking / r);
  });
  ctx.restore();
}

function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

function starPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, points: number, outer: number, inner: number, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rot + (i * Math.PI) / points;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function hexPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = rot + (i * TAU) / 6;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** Deterministic PRNG so textures look the same on every visit. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Kraft paper: base tone plus short fibres. Call inside a clip. */
function kraft(ctx: CanvasRenderingContext2D, w: number, h: number, seed = 7) {
  ctx.fillStyle = "#c6a073";
  ctx.fillRect(0, 0, w, h);
  const r = rng(seed);
  ctx.lineCap = "round";
  for (let i = 0; i < 900; i++) {
    const x = r() * w;
    const y = r() * h;
    const len = 2 + r() * 7;
    const a = r() * TAU;
    const dark = r() > 0.45;
    ctx.strokeStyle = dark ? `rgba(92,60,28,${0.08 + r() * 0.14})` : `rgba(255,236,205,${0.08 + r() * 0.16})`;
    ctx.lineWidth = 0.5 + r() * 0.9;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }
}

/* ---------------------------------------------------------------- designs */

const labelBros: StickerDesign = {
  id: "label-bros",
  name: "Label Bros",
  spec: "Holographic vinyl, die-cut",
  finish: "holo",
  w: 300,
  h: 172,
  border: 12,
  image: { src: "/stickers/label-bros.webp", w: 340, h: 187 },
  draw(ctx, f) {
    const { w, h } = this;
    // silver base: the shader turns light, unsaturated areas into rainbow foil
    rr(ctx, 0, 0, w, h, 34);
    ctx.fillStyle = "#dcdce0";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#111";
    rr(ctx, 13, 13, w - 26, h - 26, 22);
    ctx.stroke();
    ctx.fillStyle = "#111";
    capFont(ctx, 900, 48, f.sans, "expanded", { text: "LABEL", max: w - 74, tracking: -1 });
    ctx.textAlign = "center";
    tracked(ctx, "LABEL", w / 2, 80, -1);
    tracked(ctx, "BROS", w / 2, 140, -1);
    sparkle(ctx, w - 40, 40, 11);
    sparkle(ctx, w - 58, 58, 5);
    sparkle(ctx, 38, h - 38, 8);
  },
};

const fireEscape: StickerDesign = {
  id: "fire-escape",
  name: "Fire Escape Hot Sauce",
  spec: "Gloss vinyl, scalloped die-cut",
  finish: "gloss",
  w: 224,
  h: 224,
  border: 11,
  image: { src: "/stickers/fire-escape.webp", w: 243, h: 249 },
  draw(ctx, f) {
    const c = 112;
    // bottle-cap edge
    ctx.beginPath();
    for (let i = 0; i <= 720; i++) {
      const a = (i / 720) * TAU;
      const r = 106 + 5 * Math.cos(a * 28);
      const x = c + r * Math.cos(a);
      const y = c + r * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = "#e8432b";
    ctx.fill();
    ctx.strokeStyle = "#ffe8c4";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(c, c, 76, 0, TAU);
    ctx.stroke();

    ctx.fillStyle = "#ffe8c4";
    capFont(ctx, 400, 19, f.anton);
    arcText(ctx, "FIRE ESCAPE", c, c, 81, -Math.PI / 2, 2.4, true);
    capFont(ctx, 400, 15, f.anton);
    arcText(ctx, "HOT SAUCE CO.", c, c, 100, Math.PI / 2, 2.6, false);
    sparkle(ctx, c - 90, c, 6);
    sparkle(ctx, c + 90, c, 6);

    // flame
    const fx = c;
    const fy = c + 6;
    ctx.fillStyle = "#ffc93a";
    ctx.beginPath();
    ctx.moveTo(fx + 2, fy - 54);
    ctx.bezierCurveTo(fx + 12, fy - 26, fx + 42, fy - 16, fx + 38, fy + 14);
    ctx.bezierCurveTo(fx + 35, fy + 40, fx + 14, fy + 50, fx, fy + 50);
    ctx.bezierCurveTo(fx - 22, fy + 50, fx - 40, fy + 34, fx - 38, fy + 10);
    ctx.bezierCurveTo(fx - 36, fy - 8, fx - 24, fy - 18, fx - 20, fy - 34);
    ctx.bezierCurveTo(fx - 10, fy - 22, fx - 8, fy - 12, fx - 4, fy - 8);
    ctx.bezierCurveTo(fx - 6, fy - 28, fx - 4, fy - 42, fx + 2, fy - 54);
    ctx.fill();
    ctx.fillStyle = "#e8432b";
    ctx.beginPath();
    ctx.moveTo(fx + 2, fy - 8);
    ctx.bezierCurveTo(fx + 8, fy + 6, fx + 22, fy + 12, fx + 20, fy + 28);
    ctx.bezierCurveTo(fx + 18, fy + 40, fx + 8, fy + 44, fx, fy + 44);
    ctx.bezierCurveTo(fx - 12, fy + 44, fx - 22, fy + 36, fx - 20, fy + 24);
    ctx.bezierCurveTo(fx - 18, fy + 12, fx - 6, fy + 8, fx + 2, fy - 8);
    ctx.fill();
  },
};

const nightShift: StickerDesign = {
  id: "night-shift",
  name: "Night Shift Coffee",
  spec: "Matte paper, arch die-cut",
  finish: "matte",
  w: 184,
  h: 240,
  border: 11,
  image: { src: "/stickers/night-shift.webp", w: 179, h: 302 },
  draw(ctx, f) {
    const { w, h } = this;
    const r = w / 2;
    const arch = (inset: number) => {
      ctx.beginPath();
      ctx.moveTo(inset, r);
      ctx.arc(r, r, r - inset, Math.PI, 0);
      ctx.lineTo(w - inset, h - inset - 14);
      ctx.quadraticCurveTo(w - inset, h - inset, w - inset - 14, h - inset);
      ctx.lineTo(inset + 14, h - inset);
      ctx.quadraticCurveTo(inset, h - inset, inset, h - inset - 14);
      ctx.closePath();
    };
    arch(0);
    ctx.fillStyle = "#16234a";
    ctx.fill();
    arch(9);
    ctx.strokeStyle = "#e9b44c";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // crescent moon
    ctx.fillStyle = "#f4e7cc";
    ctx.beginPath();
    ctx.arc(r, 76, 31, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#16234a";
    ctx.beginPath();
    ctx.arc(r + 14, 66, 28, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#f4e7cc";
    sparkle(ctx, 46, 58, 8);
    sparkle(ctx, 140, 44, 5);
    sparkle(ctx, 146, 104, 7);
    sparkle(ctx, 54, 112, 4);

    ctx.fillStyle = "#f4e7cc";
    capFont(ctx, 400, 40, f.anton);
    ctx.textAlign = "center";
    tracked(ctx, "NIGHT", r, 168, 1.5);
    tracked(ctx, "SHIFT", r, 212, 1.5);
    ctx.fillStyle = "#e9b44c";
    capFont(ctx, 800, 7, f.sans);
    tracked(ctx, "COFFEE ROASTERS", r, 226, 1.8);
  },
};

const hopScotch: StickerDesign = {
  id: "hop-scotch",
  name: "Hop Scotch IPA",
  spec: "Gloss vinyl, rounded rectangle",
  finish: "gloss",
  w: 196,
  h: 252,
  border: 10,
  image: { src: "/stickers/hop-scotch.webp", w: 169, h: 347 },
  draw(ctx, f) {
    const { w, h } = this;
    ctx.save();
    rr(ctx, 0, 0, w, h, 22);
    ctx.clip();
    ctx.fillStyle = "#bde552";
    ctx.fillRect(0, 0, w, h);
    const ink = "#16391d";
    ctx.fillStyle = ink;
    capFont(ctx, 800, 7, f.sans);
    tracked(ctx, "SMALL BATCH BREWING", w / 2, 30, 1.8);
    capFont(ctx, 400, 74, f.anton);
    ctx.textAlign = "center";
    tracked(ctx, "HOP", w / 2, 118, 1);
    capFont(ctx, 400, 34, f.anton);
    tracked(ctx, "SCOTCH", w / 2, 160, 2);
    // checker band: a nod to the scotch plaid and the hopscotch court
    const sq = 12;
    const cols = Math.ceil(w / sq);
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < cols; col++) {
        if ((row + col) % 2 === 0) ctx.fillRect(col * sq, 176 + row * sq, sq, sq);
      }
    }
    ctx.fillRect(0, 200, w, h - 200);
    ctx.fillStyle = "#bde552";
    capFont(ctx, 800, 9, f.sans);
    tracked(ctx, "INDIA PALE ALE", w / 2, 224, 1.6);
    ctx.fillStyle = "#f6f2e6";
    capFont(ctx, 600, 6.5, f.sans);
    tracked(ctx, "16 FL OZ  ·  6.8% ABV", w / 2, 239, 1.2);
    ctx.restore();
  },
};

const beeline: StickerDesign = {
  id: "beeline",
  name: "Beeline Honey",
  spec: "Gloss paper, hexagon die-cut",
  finish: "gloss",
  w: 196,
  h: 226,
  border: 11,
  image: { src: "/stickers/beeline.webp", w: 216, h: 251 },
  draw(ctx, f) {
    const { w, h } = this;
    const cx = w / 2;
    const cy = h / 2;
    ctx.save();
    ctx.lineJoin = "round";
    hexPath(ctx, cx, cy, 112);
    ctx.fillStyle = "#f6a91f";
    ctx.fill();
    ctx.clip();
    // honeycomb
    ctx.strokeStyle = "#e48d0c";
    ctx.lineWidth = 2;
    const s = 13;
    for (let row = -1; row < 12; row++) {
      for (let col = -1; col < 10; col++) {
        const x = col * s * Math.sqrt(3) + (row % 2 ? (s * Math.sqrt(3)) / 2 : 0);
        const y = row * s * 1.5;
        hexPath(ctx, x, y, s - 1.5);
        ctx.stroke();
      }
    }
    // label band
    ctx.fillStyle = "#fff4d8";
    ctx.fillRect(0, 98, w, 66);
    ctx.fillStyle = "#1a1408";
    ctx.fillRect(0, 98, w, 3);
    ctx.fillRect(0, 161, w, 3);
    capFont(ctx, 900, 22, f.sans, "expanded", { text: "BEELINE", max: 150, tracking: 0.5 });
    tracked(ctx, "BEELINE", cx, 137, 0.5);
    capFont(ctx, 700, 6.6, f.sans, undefined, { text: "RAW WILDFLOWER HONEY", max: 150, tracking: 1.6 });
    tracked(ctx, "RAW WILDFLOWER HONEY", cx, 152, 1.6);
    ctx.restore();

    // bee
    const bx = cx;
    const by = 60;
    ctx.fillStyle = "rgba(255,250,236,0.95)";
    ctx.strokeStyle = "#1a1408";
    ctx.lineWidth = 2.5;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(bx + side * 12, by - 16, 11, 17, side * 0.5, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(bx, by, 24, 16, 0, 0, TAU);
    ctx.fillStyle = "#ffd23a";
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = "#1a1408";
    for (const x of [-10, 2, 14]) ctx.fillRect(bx + x - 3, by - 20, 6.5, 40);
    ctx.restore();
    ctx.beginPath();
    ctx.ellipse(bx, by, 24, 16, 0, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = "#1a1408";
    ctx.beginPath();
    ctx.arc(bx - 24, by - 1, 8, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bx + 23, by - 3);
    ctx.lineTo(bx + 33, by);
    ctx.lineTo(bx + 23, by + 3);
    ctx.fill();
    ctx.fillStyle = "#1a1408";
    capFont(ctx, 700, 6.6, f.sans);
    tracked(ctx, "NET WT 12 OZ", cx, 190, 1.6);
  },
};

const thankYou: StickerDesign = {
  id: "thank-you",
  name: "Thank-you packaging seal",
  spec: "Kraft paper, circle",
  finish: "kraft",
  w: 188,
  h: 188,
  border: 0,
  image: { src: "/stickers/thank-you.webp", w: 186, h: 190 },
  draw(ctx, f) {
    const c = 94;
    ctx.save();
    ctx.beginPath();
    ctx.arc(c, c, 94, 0, TAU);
    ctx.clip();
    kraft(ctx, 188, 188, 11);
    ctx.restore();
    ctx.fillStyle = "#24170c";
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * TAU;
      ctx.beginPath();
      ctx.arc(c + 82 * Math.cos(a), c + 82 * Math.sin(a), 1.7, 0, TAU);
      ctx.fill();
    }
    ctx.save();
    ctx.translate(c, c + 6);
    ctx.rotate(-0.12);
    setFont(ctx, 400, 54, f.script);
    ctx.textAlign = "center";
    ctx.fillText("thank you", 0, 0);
    ctx.restore();
    capFont(ctx, 800, 7, f.sans);
    tracked(ctx, "FOR SHOPPING SMALL", c, 136, 2);
    // heart
    ctx.save();
    ctx.translate(c, 46);
    ctx.beginPath();
    ctx.moveTo(0, 9);
    ctx.bezierCurveTo(-14, 0, -11, -11, -4, -10);
    ctx.bezierCurveTo(-2, -10, 0, -8, 0, -5);
    ctx.bezierCurveTo(0, -8, 2, -10, 4, -10);
    ctx.bezierCurveTo(11, -11, 14, 0, 0, 9);
    ctx.fill();
    ctx.restore();
  },
};

const fresh: StickerDesign = {
  id: "fresh",
  name: "Fresh! lettering",
  spec: "Gloss vinyl, contour cut",
  finish: "gloss",
  w: 268,
  h: 132,
  border: 13,
  image: { src: "/stickers/fresh.webp", w: 302, h: 154 },
  draw(ctx, f) {
    const { w, h } = this;
    ctx.save();
    ctx.translate(w / 2, h / 2 + 30);
    ctx.rotate(-0.1);
    setFont(ctx, 400, 104, f.script);
    ctx.textAlign = "center";
    // extruded shadow, sign-painter style
    ctx.fillStyle = "#141414";
    for (let i = 1; i <= 7; i++) ctx.fillText("Fresh!", i * 0.9, i * 1.1);
    ctx.fillStyle = "#ff5a2b";
    ctx.fillText("Fresh!", 0, 0);
    ctx.restore();
  },
};

const newBurst: StickerDesign = {
  id: "new-burst",
  name: "New flavour burst",
  spec: "Glitter vinyl, starburst",
  finish: "glitter",
  w: 176,
  h: 176,
  border: 9,
  image: { src: "/stickers/new-burst.webp", w: 192, h: 196 },
  draw(ctx, f) {
    const c = 88;
    ctx.lineJoin = "round";
    starPath(ctx, c, c, 18, 88, 74);
    ctx.fillStyle = "#ff4f9b";
    ctx.fill();
    ctx.strokeStyle = "#ffe3ef";
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.arc(c, c, 62, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#fff6fa";
    capFont(ctx, 900, 34, f.sans, "expanded", { text: "NEW", max: 104 });
    tracked(ctx, "NEW", c, c + 12, 0);
    capFont(ctx, 800, 8, f.sans);
    tracked(ctx, "FLAVOUR", c, c + 34, 2.4);
    sparkle(ctx, c, c - 40, 8);
  },
};

const emberOak: StickerDesign = {
  id: "ember-oak",
  name: "Ember & Oak candle label",
  spec: "Matte paper, oval",
  finish: "matte",
  w: 236,
  h: 150,
  border: 0,
  image: { src: "/stickers/ember-oak.webp", w: 229, h: 155 },
  draw(ctx, f) {
    const { w, h } = this;
    const cx = w / 2;
    const cy = h / 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, TAU);
    ctx.fillStyle = "#f3ebdc";
    ctx.fill();
    ctx.strokeStyle = "#1c1712";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2 - 9, h / 2 - 9, 0, 0, TAU);
    ctx.stroke();
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2 - 14, h / 2 - 14, 0, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = "#1c1712";
    // flame mark
    ctx.beginPath();
    ctx.moveTo(cx, 30);
    ctx.bezierCurveTo(cx + 9, 40, cx + 8, 50, cx, 54);
    ctx.bezierCurveTo(cx - 8, 50, cx - 9, 40, cx, 30);
    ctx.fill();
    capFont(ctx, 600, 21, f.serif);
    ctx.textAlign = "center";
    ctx.fillText("Ember & Oak", cx, 87);
    capFont(ctx, 700, 6, f.sans);
    tracked(ctx, "HAND POURED SOY CANDLE", cx, 104, 1.8);
    ctx.fillStyle = "#8a3b1d";
    capFont(ctx, 600, 6, f.sans);
    tracked(ctx, "CEDAR  ·  SMOKE  ·  AMBER", cx, 119, 1.4);
  },
};

const caution: StickerDesign = {
  id: "caution",
  name: "Caution label",
  spec: "Gloss vinyl, rectangle",
  finish: "gloss",
  w: 266,
  h: 120,
  border: 0,
  image: { src: "/stickers/caution.webp", w: 270, h: 118 },
  draw(ctx, f) {
    const { w, h } = this;
    ctx.save();
    rr(ctx, 0, 0, w, h, 12);
    ctx.clip();
    ctx.fillStyle = "#ffc414";
    ctx.fillRect(0, 0, w, h);
    // hazard stripes
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, 64, h);
    ctx.clip();
    ctx.fillStyle = "#121212";
    for (let i = -6; i < 12; i++) {
      ctx.beginPath();
      const x = i * 22;
      ctx.moveTo(x, h);
      ctx.lineTo(x + 11, h);
      ctx.lineTo(x + 11 + h, 0);
      ctx.lineTo(x + h, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = "#121212";
    ctx.fillRect(64, 0, 3, h);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#121212";
    rr(ctx, 6, 6, w - 12, h - 12, 8);
    ctx.stroke();
    const room = w - 82 - 20;
    capFont(ctx, 900, 27, f.sans, "expanded", { text: "CAUTION", max: room });
    ctx.textAlign = "left";
    tracked(ctx, "CAUTION", 82, 54, 0, "left");
    capFont(ctx, 800, 7.6, f.sans, undefined, { text: "CONTENTS EXTREMELY STICKY", max: room, tracking: 1.1 });
    tracked(ctx, "CONTENTS EXTREMELY STICKY", 83, 76, 1.1, "left");
    capFont(ctx, 600, 6.4, f.sans, undefined, { text: "PEEL SLOWLY · KEEP DRY", max: room, tracking: 1.1 });
    tracked(ctx, "PEEL SLOWLY · KEEP DRY", 83, 93, 1.1, "left");
    ctx.restore();
  },
};

const approved: StickerDesign = {
  id: "approved",
  name: "Proof approved seal",
  spec: "Gloss vinyl, circle",
  finish: "gloss",
  w: 156,
  h: 156,
  border: 9,
  image: { src: "/stickers/approved.webp", w: 172, h: 176 },
  draw(ctx, f) {
    const c = 78;
    ctx.beginPath();
    ctx.arc(c, c, 78, 0, TAU);
    ctx.fillStyle = "#151515";
    ctx.fill();
    ctx.fillStyle = "#f5f1e8";
    capFont(ctx, 800, 9, f.sans);
    const text = "PROOF APPROVED ✦ PRINT READY ✦ ";
    // run the text all the way round
    const chars = [...text];
    const widths = chars.map((ch) => ctx.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0);
    const r = 60;
    const track = (TAU * r - total) / chars.length;
    let a = -Math.PI / 2;
    ctx.textAlign = "center";
    chars.forEach((ch, i) => {
      const half = widths[i] / 2 / r;
      a += half;
      ctx.save();
      ctx.translate(c + r * Math.cos(a), c + r * Math.sin(a));
      ctx.rotate(a + Math.PI / 2);
      ctx.fillText(ch, 0, 0);
      ctx.restore();
      a += half + track / r;
    });
    ctx.strokeStyle = "#ffd21f";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(c - 24, c + 2);
    ctx.lineTo(c - 7, c + 19);
    ctx.lineTo(c + 25, c - 17);
    ctx.stroke();
  },
};

/* ---------------------------------------------------------------- product labels
 * The flat labels shared with the shop's product photographs, so the table shows the labels
 * Label Bros prints for products, beside the stickers. Each has a plain drawn stand-in in case
 * its image can't load: the label's shape and colour, with its name. */

function flatLabel(
  o: { id: string; name: string; spec: string; finish: Finish; src: string; px: [number, number]; w: number; fill: string; ink: string; title: string; sub: string; arch?: boolean },
): StickerDesign {
  const h = Math.round((o.w * o.px[1]) / o.px[0]);
  return {
    id: o.id,
    name: o.name,
    spec: o.spec,
    finish: o.finish,
    w: o.w,
    h,
    border: 0,
    image: { src: o.src, w: o.w, h },
    draw(ctx, f) {
      const { w } = this;
      const r = Math.min(w, h) * 0.08;
      ctx.beginPath();
      if (o.arch) {
        ctx.moveTo(0, h);
        ctx.lineTo(0, w / 2);
        ctx.arc(w / 2, w / 2, w / 2, Math.PI, 0);
        ctx.lineTo(w, h);
        ctx.closePath();
      } else ctx.roundRect(0, 0, w, h, r);
      ctx.fillStyle = o.fill;
      ctx.fill();
      ctx.fillStyle = o.ink;
      ctx.textAlign = "center";
      capFont(ctx, 900, Math.min(w, h) * 0.13, f.sans, "expanded", { text: o.title, max: w * 0.84 });
      ctx.fillText(o.title, w / 2, h * 0.56);
      capFont(ctx, 700, Math.min(w, h) * 0.045, f.sans, undefined, { text: o.sub, max: w * 0.8, tracking: 1.4 });
      tracked(ctx, o.sub, w / 2, h * 0.68, 1.4);
    },
  };
}

// "Your Brand" labels from the shop's 3D products (public/products): the labels Label Bros prints,
// with the visitor's brand where a company's would be, never a real company
const tidewater = flatLabel({ id: "tidewater", name: "Your Brand kombucha label", spec: "White BOPP, gloss, wrap-around", finish: "gloss", src: "/products/labels/kombucha.webp", px: [720, 383], w: 232, fill: "#17535a", ink: "#f2e8d4", title: "YOUR BRAND", sub: "SPARKLING KOMBUCHA" });
const oldHarbor = flatLabel({ id: "old-harbor", name: "Your Brand olive oil label", spec: "White BOPP, matte, arched", finish: "matte", src: "/products/labels/olive-oil.webp", px: [564, 720], w: 138, fill: "#f3eddc", ink: "#3d4a1c", title: "YOUR BRAND", sub: "EXTRA VIRGIN OLIVE OIL", arch: true });
const sundayJam = flatLabel({ id: "sunday-jam", name: "Your Brand jam label", spec: "White BOPP, gloss, rectangle", finish: "gloss", src: "/products/labels/jam.webp", px: [720, 334], w: 236, fill: "#f7efdf", ink: "#c21f2f", title: "YOUR BRAND", sub: "STRAWBERRY JAM" });
const wildFern = flatLabel({ id: "wild-fern", name: "Your Brand face oil label", spec: "White paper, matte", finish: "matte", src: "/products/labels/face-oil.webp", px: [720, 497], w: 168, fill: "#aab69c", ink: "#2f4128", title: "YOUR BRAND", sub: "BOTANICAL FACE OIL" });

export const DESIGNS: StickerDesign[] = [
  tidewater,
  oldHarbor,
  sundayJam,
  wildFern,
  fireEscape,
  nightShift,
  beeline,
  labelBros,
  thankYou,
  hopScotch,
  newBurst,
  fresh,
  emberOak,
  caution,
  approved,
];

/* ---------------------------------------------------------------- rendering */

export type RenderedSticker = {
  canvas: HTMLCanvasElement;
  /** logical size including border and padding */
  width: number;
  height: number;
  /** low-res alpha for hit testing */
  mask: Uint8ClampedArray;
  maskW: number;
  maskH: number;
};

const PAD = 4;

/** Logical size of a rendered sticker (art + die-cut border + padding), before any scale. */
export function stickerSize(design: StickerDesign) {
  if (design.image) return { width: design.image.w + PAD * 2, height: design.image.h + PAD * 2 };
  const pad = design.border + PAD;
  return { width: design.w + pad * 2, height: design.h + pad * 2 };
}

const images = new Map<string, Promise<HTMLImageElement>>();

/** Fetch and decode a sticker image once; the hero and the sections share it. */
function loadImage(src: string) {
  let p = images.get(src);
  if (!p) {
    p = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => img.decode().then(() => resolve(img), () => resolve(img));
      img.onerror = () => reject(new Error(`sticker image failed: ${src}`));
      img.src = src;
    });
    images.set(src, p);
  }
  return p;
}

/** Low-res alpha of a rendered sticker, for hit testing. ~1 sample per 2 logical px. */
function hitMask(out: HTMLCanvasElement, width: number, height: number) {
  const maskW = Math.ceil(width / 2);
  const maskH = Math.ceil(height / 2);
  const m = makeCanvas(maskW, maskH);
  const mctx = m.getContext("2d", { willReadFrequently: true })!;
  mctx.drawImage(out, 0, 0, maskW, maskH);
  const data = mctx.getImageData(0, 0, maskW, maskH).data;
  const mask = new Uint8ClampedArray(maskW * maskH);
  for (let i = 0; i < mask.length; i++) mask[i] = data[i * 4 + 3];
  return { mask, maskW, maskH };
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

/** Hand the main thread back between steps so no single task runs long. */
export function yieldToMain(): Promise<void> {
  const sched = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  if (sched?.yield) return sched.yield();
  return new Promise((r) => setTimeout(r, 0));
}

/**
 * A sticker ready for a texture or a page canvas: the finished artwork when there is one,
 * otherwise the drawn version. Builds a hit mask unless asked not to. Each step runs in its
 * own task.
 */
export async function renderSticker(
  design: StickerDesign,
  scale: number,
  opts: { mask?: boolean } = {},
): Promise<RenderedSticker> {
  if (design.image) {
    const img = await loadImage(design.image.src).catch(() => null);
    if (img) return renderImage(design, design.image, img, scale, opts);
  }
  const { fonts } = await loadFonts();
  return renderDrawn(design, fonts, scale, opts);
}

/** The finished artwork, scaled into a canvas with the same padding as drawn stickers. */
async function renderImage(
  design: StickerDesign,
  image: NonNullable<StickerDesign["image"]>,
  img: HTMLImageElement,
  scale: number,
  opts: { mask?: boolean },
): Promise<RenderedSticker> {
  const { width, height } = stickerSize(design);
  const out = makeCanvas(width * scale, height * scale);
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, PAD * scale, PAD * scale, image.w * scale, image.h * scale);
  await yieldToMain();
  if (opts.mask === false) return { canvas: out, width, height, mask: new Uint8ClampedArray(0), maskW: 0, maskH: 0 };
  return { canvas: out, width, height, ...hitMask(out, width, height) };
}

/** The vector version: art drawn in code, white die-cut border grown round its silhouette. */
async function renderDrawn(
  design: StickerDesign,
  fonts: Fonts,
  scale: number,
  opts: { mask?: boolean },
): Promise<RenderedSticker> {
  const pad = design.border + PAD;
  const width = design.w + pad * 2;
  const height = design.h + pad * 2;
  const W = Math.ceil(width * scale);
  const H = Math.ceil(height * scale);

  const art = makeCanvas(W, H);
  const actx = art.getContext("2d")!;
  actx.scale(scale, scale);
  actx.translate(pad, pad);
  design.draw(actx, fonts);
  await yieldToMain();

  const out = makeCanvas(W, H);
  const ctx = out.getContext("2d")!;
  if (design.border > 0) {
    // white silhouette, then stamp it round a few rings: a round-cornered dilation that also
    // covers thin strokes
    const sil = makeCanvas(W, H);
    const sctx = sil.getContext("2d")!;
    sctx.drawImage(art, 0, 0);
    sctx.globalCompositeOperation = "source-in";
    sctx.fillStyle = "#ffffff";
    sctx.fillRect(0, 0, W, H);
    const total = design.border * scale;
    const rings = Math.max(2, Math.ceil(total / (3.2 * scale)));
    for (let k = rings; k >= 1; k--) {
      const r = (total * k) / rings;
      const steps = k === rings ? 20 : 12;
      for (let i = 0; i < steps; i++) {
        const a = (i / steps) * TAU + k * 0.37;
        ctx.drawImage(sil, Math.cos(a) * r, Math.sin(a) * r);
      }
    }
    ctx.drawImage(sil, 0, 0);
    await yieldToMain();
  }
  ctx.drawImage(art, 0, 0);

  if (opts.mask === false) return { canvas: out, width, height, mask: new Uint8ClampedArray(0), maskW: 0, maskH: 0 };
  return { canvas: out, width, height, ...hitMask(out, width, height) };
}
