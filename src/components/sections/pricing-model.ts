import { LIFTOFF } from "./liftoff";

/*
 * The pricing builder's options and the geometry of its live preview. No prices here:
 * they come from the client's price list ([[PRICE_LIST]]). Sizes and quantities are
 * placeholders too until that list is in.
 */

export type Product = "stickers" | "labels";
export type Shape = "die-cut" | "circle" | "square" | "rectangle";
export type Finish = "gloss" | "matte" | "holo";

export type Quote = { product: Product; shape: Shape; size: number; qty: number; finish: Finish };

export const PRODUCTS: { id: Product; label: string }[] = [
  { id: "stickers", label: "Stickers" },
  { id: "labels", label: "Labels" },
];
export const SHAPES: { id: Shape; label: string }[] = [
  { id: "die-cut", label: "Die-cut" },
  { id: "circle", label: "Circle" },
  { id: "square", label: "Square" },
  { id: "rectangle", label: "Rectangle" },
];
export const SIZES = [2, 3, 4, 5]; // inches, the longest side
export const QUANTITIES = [50, 100, 250, 500, 1000];
export const FINISHES: { id: Finish; label: string }[] = [
  { id: "gloss", label: "Gloss" },
  { id: "matte", label: "Matte" },
  { id: "holo", label: "Holographic" },
];

export const DEFAULT_QUOTE: Quote = { product: "stickers", shape: "die-cut", size: 3, qty: 100, finish: "gloss" };

// The sample sticker (Liftoff) sits in a 260 × 250 box centred on (130, 125); every shape shares
// it, and every shape's longest side is SPAN units.
export const CX = 130;
export const CY = 125;
const SPAN = 244; // the longest side of every shape, in art units

const RECT_RATIO = 2 / 3;
const DIE_RATIO = LIFTOFF.h / LIFTOFF.w; // height / width of the die-cut sticker

function rounded(w: number, h: number, r: number) {
  const x = CX - w / 2;
  const y = CY - h / 2;
  return `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
}

function circle(r: number) {
  const k = r * 0.5523;
  return `M${CX} ${CY - r} C${CX + k} ${CY - r} ${CX + r} ${CY - k} ${CX + r} ${CY} C${CX + r} ${CY + k} ${CX + k} ${CY + r} ${CX} ${CY + r} C${CX - k} ${CY + r} ${CX - r} ${CY + k} ${CX - r} ${CY} C${CX - r} ${CY - k} ${CX - k} ${CY - r} ${CX} ${CY - r} Z`;
}

const INSET = 10; // the white border round a printed background

export const SHAPE_GEOMETRY: Record<
  Shape,
  { outer: string; inner: string; innerOn: boolean; art: number; ratio: number }
> = {
  "die-cut": { outer: LIFTOFF.boxCut, inner: LIFTOFF.boxCut, innerOn: false, art: 1, ratio: DIE_RATIO },
  circle: { outer: circle(SPAN / 2), inner: circle(SPAN / 2 - INSET), innerOn: true, art: 0.78, ratio: 1 },
  square: { outer: rounded(SPAN, SPAN, 26), inner: rounded(SPAN - INSET * 2, SPAN - INSET * 2, 18), innerOn: true, art: 0.8, ratio: 1 },
  rectangle: {
    outer: rounded(SPAN, SPAN * RECT_RATIO, 18),
    inner: rounded(SPAN - INSET * 2, SPAN * RECT_RATIO - INSET * 2, 11),
    innerOn: true,
    art: 0.56,
    ratio: RECT_RATIO,
  },
};

const fmt = (n: number) => (Math.round(n * 10) / 10).toString();

/** Width and height in inches (the size is the longest side), as on the measuring lines. */
export function dimensions(q: Quote) {
  const ratio = SHAPE_GEOMETRY[q.shape].ratio; // height / width
  const w = ratio > 1 ? q.size / ratio : q.size;
  const h = ratio > 1 ? q.size : q.size * ratio;
  return { w, h, label: `${fmt(w)} × ${fmt(h)} in` };
}

export function summary(q: Quote) {
  const shape = SHAPES.find((s) => s.id === q.shape)!.label.toLowerCase();
  const finish = FINISHES.find((f) => f.id === q.finish)!.label.toLowerCase();
  const thing = q.product === "labels" ? "labels" : "stickers";
  return `${q.qty.toLocaleString("en-US")} ${shape} ${thing}, ${dimensions(q).label}, ${finish}`;
}

// preview mat, in SVG units
export const VIEW_W = 640;
export const VIEW_H = 500;
export const PPI = 60; // one inch on the mat
export const MAT_X = (VIEW_W / 2) % PPI;
export const MAT_Y = (VIEW_H / 2) % PPI;
export const CENTER = { x: VIEW_W / 2, y: VIEW_H / 2 + 6 };
export const STACK = 5; // printed copies drawn under the preview, one per quantity step

export function view(q: Quote) {
  const g = SHAPE_GEOMETRY[q.shape];
  const k = (q.size * PPI) / 244;
  const { w, h } = dimensions(q);
  return {
    ...g,
    k,
    finish: q.finish,
    copies: Math.max(1, QUANTITIES.indexOf(q.qty) + 1),
    W: w * PPI,
    H: h * PPI,
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
