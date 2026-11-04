import { CUSTOM, RECT_RATIO, SIZES, clampSize } from "@/components/sheet/sizes";
import { LIFTOFF } from "./liftoff";

export { CUSTOM, SIZES, clampSize };

/*
 * The pricing builder's options and the geometry of its live preview. No prices here:
 * they come from src/lib/facts.ts (quotePrice), which follows Sticker Bros' published prices.
 */

export type Product = "stickers" | "labels";
export type Shape = "die-cut" | "circle" | "square" | "rectangle";
export type Finish = "gloss" | "matte" | "holo";

/** `size`: a preset (inches, the longest side) or "custom", which uses `custom` (width × height). */
export type Size = number | "custom";
/** `qty`: a preset or "custom", which uses `customQty` (any number in CUSTOM_QTY). */
export type Qty = number | "custom";
/** Their own file, or ours to design. */
export type Artwork = "upload" | "design";
export type Quote = {
  product: Product;
  artwork: Artwork;
  shape: Shape;
  size: Size;
  custom: { w: number; h: number };
  qty: Qty;
  customQty: number;
  finish: Finish;
};

export const PRODUCTS: { id: Product; label: string }[] = [
  { id: "stickers", label: "Stickers" },
  { id: "labels", label: "Labels" },
];
export const ARTWORKS: { id: Artwork; label: string }[] = [
  { id: "upload", label: "Upload my design" },
  { id: "design", label: "Design it for me" },
];
export const SHAPES: { id: Shape; label: string }[] = [
  { id: "die-cut", label: "Die-cut" },
  { id: "circle", label: "Circle" },
  { id: "square", label: "Square" },
  { id: "rectangle", label: "Rectangle" },
];
export const QUANTITIES = [50, 100, 250, 500, 1000];
/** Custom quantities: from the minimum order (10) up. */
export const CUSTOM_QTY = { min: 10, max: 100000, step: 1 };
export const clampQty = (n: number) => Math.min(CUSTOM_QTY.max, Math.max(CUSTOM_QTY.min, Math.round(n)));
/** How many are being ordered, preset or custom. */
export const quantity = (q: Quote) => (q.qty === "custom" ? q.customQty : q.qty);
export const FINISHES: { id: Finish; label: string }[] = [
  { id: "gloss", label: "Gloss" },
  { id: "matte", label: "Matte" },
  { id: "holo", label: "Holographic" },
];

export const DEFAULT_QUOTE: Quote = {
  product: "stickers",
  artwork: "upload",
  shape: "die-cut",
  size: 3,
  custom: { w: 3, h: 2 },
  qty: 100,
  customQty: 300,
  finish: "gloss",
};

// The artwork sits in a 260 × 250 box centred on (130, 125); every shape shares it, and every
// shape's longest side is SPAN units.
export const CX = 130;
export const CY = 125;
export const SPAN = 244; // the longest side of every shape, in art units

/**
 * The artwork on the mat: its image, where it sits (art units), its die-cut line (traced round
 * it, longest side SPAN) and that line's height / width. `opaque`: a photo or a flat background,
 * cut as a rounded rectangle. The sample is Liftoff; an uploaded design is traced in artwork.ts.
 */
export type Art = {
  href: string;
  box: { x: number; y: number; w: number; h: number };
  cut: string;
  ratio: number;
  opaque: boolean;
  sample?: boolean;
};
export const SAMPLE_ART: Art = {
  href: LIFTOFF.art,
  box: LIFTOFF.box,
  cut: LIFTOFF.boxCut,
  ratio: LIFTOFF.h / LIFTOFF.w,
  opaque: false,
  sample: true,
};

export function rounded(w: number, h: number, r: number) {
  const x = CX - w / 2;
  const y = CY - h / 2;
  return `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
}

function circle(r: number) {
  const k = r * 0.5523;
  return `M${CX} ${CY - r} C${CX + k} ${CY - r} ${CX + r} ${CY - k} ${CX + r} ${CY} C${CX + r} ${CY + k} ${CX + k} ${CY + r} ${CX} ${CY + r} C${CX - k} ${CY + r} ${CX - r} ${CY + k} ${CX - r} ${CY} C${CX - r} ${CY - k} ${CX - k} ${CY - r} ${CX} ${CY - r} Z`;
}

const INSET = 10; // the white border round a printed background

type Geometry = { outer: string; inner: string; innerOn: boolean; art: number; ratio: number };

// The sample sits on a printed green background in the plain shapes, tuned by eye; an uploaded
// design sits on white, fitted whole inside the shape (a photo by its corners).
/** A rounded rectangle of any proportion (height / width), longest side SPAN, art fitted inside. */
function rectangle(ratio: number, art: Art): Geometry {
  const r = Math.min(8, Math.max(0.125, ratio)); // the drawing stops at 1:8; the label itself does not
  const w = r > 1 ? SPAN / r : SPAN;
  const h = r > 1 ? SPAN : SPAN * r;
  const corner = Math.min(18, Math.min(w, h) * 0.2);
  const iw = Math.max(6, w - INSET * 2);
  const ih = Math.max(6, h - INSET * 2);
  const fill = art.sample ? 0.955 : art.opaque ? 1 : 0.92;
  return {
    outer: rounded(w, h, corner),
    inner: rounded(iw, ih, Math.max(2, corner - 7)),
    innerOn: !!art.sample,
    art: Math.min((iw * fill) / art.box.w, (ih * fill) / art.box.h),
    ratio,
  };
}

/** Each shape's outline, for this artwork. */
export function shapeGeometry(shape: Shape, art: Art = SAMPLE_ART): Geometry {
  const { w, h } = art.box;
  const big = Math.max(w, h);
  if (shape === "die-cut") return { outer: art.cut, inner: art.cut, innerOn: false, art: 1, ratio: art.ratio };
  if (shape === "circle") {
    const r = SPAN / 2 - INSET;
    const fit = art.sample ? 0.78 : art.opaque ? (2 * r * 0.98) / Math.hypot(w, h) : (2 * r * 0.84) / big;
    return { outer: circle(SPAN / 2), inner: circle(r), innerOn: !!art.sample, art: fit, ratio: 1 };
  }
  if (shape === "square") {
    const side = SPAN - INSET * 2;
    const fit = art.sample ? 0.8 : (side * (art.opaque ? 0.98 : 0.9)) / big;
    return { outer: rounded(SPAN, SPAN, 26), inner: rounded(side, side, 18), innerOn: !!art.sample, art: fit, ratio: 1 };
  }
  return rectangle(RECT_RATIO, art);
}

/** Height / width of a shape. Custom rectangles take any proportion; the others keep theirs. */
export const ratioOf = (shape: Shape, art: Art = SAMPLE_ART) => shapeGeometry(shape, art).ratio;

/** A custom size that respects the shape: width and height are linked unless it is a rectangle. */
export function linkCustom(shape: Shape, size: { w: number; h: number }, changed: "w" | "h", art: Art = SAMPLE_ART) {
  if (shape === "rectangle") return { w: clampSize(size.w), h: clampSize(size.h) };
  const ratio = ratioOf(shape, art);
  if (changed === "w") {
    const w = clampSize(Math.min(size.w, CUSTOM.max / Math.max(1, ratio)));
    return { w, h: w * ratio };
  }
  const h = clampSize(Math.min(size.h, CUSTOM.max * Math.min(1, ratio)));
  return { w: h / ratio, h };
}

function geometryFor(q: Quote, art: Art): Geometry {
  if (q.shape === "rectangle" && q.size === "custom") return rectangle(q.custom.h / q.custom.w, art);
  return shapeGeometry(q.shape, art);
}

const fmt = (n: number) => (Math.round(n * 100) / 100).toString();

/** Width and height in inches, as on the measuring lines. */
export function dimensions(q: Quote, art: Art = SAMPLE_ART) {
  if (q.size === "custom") {
    const { w, h } = q.custom;
    return { w, h, label: `${fmt(w)} × ${fmt(h)} in` };
  }
  const ratio = ratioOf(q.shape, art); // height / width
  const w = ratio > 1 ? q.size / ratio : q.size;
  const h = ratio > 1 ? q.size : q.size * ratio;
  return { w, h, label: `${fmt(w)} × ${fmt(h)} in` };
}

export function summary(q: Quote, art: Art = SAMPLE_ART) {
  const shape = SHAPES.find((s) => s.id === q.shape)!.label.toLowerCase();
  const finish = FINISHES.find((f) => f.id === q.finish)!.label.toLowerCase();
  const thing = q.product === "labels" ? "labels" : "stickers";
  return `${quantity(q).toLocaleString("en-CA")} ${shape} ${thing}, ${dimensions(q, art).label}, ${finish}`;
}

/** The quote as URL parameters, read back by the builder on the quote page. */
export function quoteSearch(q: Quote) {
  const p = new URLSearchParams({ product: q.product, shape: q.shape, finish: q.finish, artwork: q.artwork });
  if (q.size === "custom") {
    p.set("w", fmt(q.custom.w));
    p.set("h", fmt(q.custom.h));
  } else p.set("size", String(q.size));
  p.set("qty", String(quantity(q)));
  return p.toString();
}

// preview mat, in SVG units
export const VIEW_W = 640;
export const VIEW_H = 500;
export const PPI = 60; // one inch on the mat
export const MAT_X = (VIEW_W / 2) % PPI;
export const MAT_Y = (VIEW_H / 2) % PPI;
export const CENTER = { x: VIEW_W / 2, y: VIEW_H / 2 + 6 };
export const STACK = 5; // printed copies drawn under the preview, one per quantity step
// the room a sticker gets on the mat; bigger ones zoom the mat out, so a square is still an inch
const FIT = { w: VIEW_W - 150, h: VIEW_H - 130 };
const MAT_CX = VIEW_W / 2;
const MAT_CY = VIEW_H / 2;

/** The mat's pattern, scaled about its centre so a grid line always runs through it. */
export const matTransform = (zoom: number) =>
  `translate(${MAT_CX} ${MAT_CY}) scale(${zoom.toFixed(4)}) translate(${-MAT_CX} ${-MAT_CY})`;

export function view(q: Quote, art: Art = SAMPLE_ART) {
  const g = geometryFor(q, art);
  const { w, h } = dimensions(q, art);
  const ppi = Math.min(PPI, FIT.w / w, FIT.h / h);
  const k = (Math.max(w, h) * ppi) / SPAN;
  return {
    ...g,
    k,
    ppi,
    mat: matTransform(ppi / PPI),
    finish: q.finish,
    // one printed copy on the pile per preset reached, so a custom amount stacks like its neighbours
    copies: Math.max(1, QUANTITIES.filter((n) => n <= quantity(q)).length),
    W: w * ppi,
    H: h * ppi,
    cx: CENTER.x,
    cy: CENTER.y,
  };
}

/** Where the measuring lines go for a sticker of W × H at the mat centre. */
export function dimsFor(v: { W: number; H: number; cx: number; cy: number }) {
  const left = v.cx - v.W / 2;
  const top = v.cy - v.H / 2;
  return {
    h: { x1: left, x2: left + v.W, y: top - 22 },
    v: { y1: top, y2: top + v.H, x: left - 22 },
  };
}

export type View = ReturnType<typeof view>;
