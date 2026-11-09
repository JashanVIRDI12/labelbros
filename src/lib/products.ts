/*
 * The shop: every product, its options and its price, in one place (read by the shop pages, the
 * cart and the server, so they always agree). Prices are in US dollars like Sticker Bros', shown
 * and charged in CAD in Canada (priceIn, whole dollars).
 *
 * Two kinds:
 *   deal    a fixed pack (quantity and size set) at one price, e.g. 50 × 3 in for $29;
 *           the customer picks the finish and how many packs.
 *   custom  pick the size and quantity; priced like the builder (quotePriceUsd, facts.ts).
 *
 * Deal prices follow Sticker Bros' published deals as seen on 2026-11-09 (the 50 × 3 in pack from
 * the client's screenshot; the others from search snapshots of stickerbros.com, to be checked).
 * Sticker Bros changes deals weekly: update them here. "value" is the regular price they quote.
 */

import { quotePriceUsd, type Finish } from "./facts";

export type ArtId =
  | "approved" | "beeline" | "caution" | "ember-oak" | "fire-escape" | "fresh" | "hop-scotch"
  | "label-bros" | "liftoff" | "new-burst" | "night-shift" | "thank-you";

export type Product = {
  slug: string;
  name: string;
  kind: "deal" | "custom";
  /** one line for cards */
  tagline: string;
  /** a few short paragraphs for the product page */
  about: string[];
  /** what's included, as short facts */
  facts: string[];
  product: "stickers" | "labels";
  shape: "die-cut" | "circle" | "square" | "rectangle";
  finishes: Finish[];
  /** deal: the pack */
  qty?: number;
  size?: number;
  priceUsd?: number;
  valueUsd?: number;
  /** custom: the choices */
  sizes?: number[];
  quantities?: number[];
  /** the product picture: a headline and stickers on a coloured card */
  art: { stickers: ArtId[]; headline: [string, string]; tone: "blue" | "ink" | "yellow" | "cream"; emboss?: boolean; effect?: "glitter" | "clear" | "chrome" | "reflective" };
  /** rectangles only: height ÷ width (2/3 unless set; bumper stickers are long and thin) */
  ratio?: number;
  /** a price not yet checked against Sticker Bros' own (see facts.ts) */
  priceToConfirm?: boolean;
  badge?: string;
};

export const FINISH_LABEL: Record<Finish, string> = {
  gloss: "Gloss",
  matte: "Matte",
  holo: "Holographic",
  glitter: "Glitter",
  embossed: "Embossed",
  clear: "Clear",
  chrome: "Chrome",
  reflective: "Reflective",
};

const STICKER_FACTS = ["Durable vinyl, waterproof and scratch-resistant", "Free proof before we print", "Ships in 2–4 business days"];

export const PRODUCTS: Product[] = [
  // ---------- deals (fixed packs) ----------
  {
    slug: "50-3in-custom-stickers",
    name: "50 3\" custom stickers",
    kind: "deal",
    tagline: "Fifty 3 inch die-cut stickers of your design.",
    about: [
      "Fifty stickers, 3 inches on their longest side, cut right round your design.",
      "Upload your artwork, or send us an idea and our designers draw it. You approve a free proof first, and we call you if anything needs changing.",
    ],
    facts: ["50 die-cut stickers, 3 inches", ...STICKER_FACTS],
    product: "stickers",
    shape: "die-cut",
    finishes: ["gloss", "matte"],
    qty: 50,
    size: 3,
    priceUsd: 29,
    valueUsd: 71,
    art: { stickers: ["fire-escape", "fresh"], headline: ["50 × 3\"", "Custom stickers"], tone: "ink" },
    badge: "Deal",
  },
  {
    slug: "100-4in-die-cut-stickers",
    name: "100 4\" die-cut stickers",
    kind: "deal",
    tagline: "A hundred 4 inch stickers, cut to the shape of your art.",
    about: [
      "One hundred stickers, 4 inches on their longest side: big enough for laptops, bottles and boxes.",
      "Upload your artwork or let us design it. Free proof first; nothing prints until you say yes.",
    ],
    facts: ["100 die-cut stickers, 4 inches", ...STICKER_FACTS],
    product: "stickers",
    shape: "die-cut",
    finishes: ["gloss", "matte"],
    qty: 100,
    size: 4,
    priceUsd: 39,
    art: { stickers: ["night-shift", "hop-scotch"], headline: ["100 × 4\"", "Die-cut stickers"], tone: "blue" },
    badge: "Deal",
  },
  {
    slug: "200-4in-custom-stickers",
    name: "200 4\" custom stickers",
    kind: "deal",
    tagline: "Two hundred 4 inch stickers for events, merch and packaging.",
    about: [
      "Two hundred stickers, 4 inches on their longest side. The pack for giveaways, merch tables and every order you ship.",
      "Upload your artwork or let us design it. Free proof first.",
    ],
    facts: ["200 die-cut stickers, 4 inches", ...STICKER_FACTS],
    product: "stickers",
    shape: "die-cut",
    finishes: ["gloss", "matte"],
    qty: 200,
    size: 4,
    priceUsd: 49,
    valueUsd: 178,
    art: { stickers: ["beeline", "label-bros", "fresh"], headline: ["200 × 4\"", "Custom stickers"], tone: "yellow" },
    badge: "Best value",
  },
  {
    slug: "250-3in-vinyl-stickers",
    name: "250 3\" vinyl stickers",
    kind: "deal",
    tagline: "Two hundred and fifty 3 inch vinyl stickers.",
    about: [
      "Two hundred and fifty stickers, 3 inches on their longest side, on durable vinyl.",
      "Upload your artwork or let us design it. Free proof first.",
    ],
    facts: ["250 die-cut stickers, 3 inches", ...STICKER_FACTS],
    product: "stickers",
    shape: "die-cut",
    finishes: ["gloss", "matte"],
    qty: 250,
    size: 3,
    priceUsd: 49,
    valueUsd: 150,
    art: { stickers: ["ember-oak", "new-burst"], headline: ["250 × 3\"", "Vinyl stickers"], tone: "cream" },
    badge: "Deal",
  },
  {
    slug: "50-2-5in-holographic-stickers",
    name: "50 2.5\" holographic stickers",
    kind: "deal",
    tagline: "Fifty 2.5 inch stickers in foil that shifts colour.",
    about: [
      "Fifty holographic stickers, 2.5 inches on their longest side. The foil shifts through the rainbow as it moves.",
      "Upload your artwork or let us design it. Free proof first.",
    ],
    facts: ["50 holographic stickers, 2.5 inches", ...STICKER_FACTS],
    product: "stickers",
    shape: "die-cut",
    finishes: ["holo"],
    qty: 50,
    size: 2.5,
    priceUsd: 39,
    art: { stickers: ["label-bros", "new-burst"], headline: ["50 × 2.5\"", "Holographic"], tone: "ink" },
    badge: "Deal",
  },

  // ---------- custom (pick size and quantity) ----------
  {
    slug: "die-cut-stickers",
    name: "Die-cut stickers",
    kind: "custom",
    tagline: "Cut right round your design, in any size from 2 to 5 inches.",
    about: ["Stickers cut to the exact shape of your design, with a thin white border.", "Pick the size, the quantity and the finish. Free proof first."],
    facts: ["Die-cut to your shape", ...STICKER_FACTS],
    product: "stickers",
    shape: "die-cut",
    finishes: ["gloss", "matte", "holo"],
    sizes: [2, 3, 4, 5],
    quantities: [50, 100, 250, 500, 1000],
    art: { stickers: ["fire-escape", "liftoff"], headline: ["Die-cut", "Any shape"], tone: "blue" },
  },
  {
    slug: "circle-stickers",
    name: "Circle stickers",
    kind: "custom",
    tagline: "Round stickers and seals, for logos, lids and packaging.",
    about: ["Perfect circles, for logos, jar lids, coffee bags and seals.", "Pick the size, the quantity and the finish. Free proof first."],
    facts: ["Cut as a circle", ...STICKER_FACTS],
    product: "stickers",
    shape: "circle",
    finishes: ["gloss", "matte", "holo"],
    sizes: [2, 3, 4, 5],
    quantities: [50, 100, 250, 500, 1000],
    art: { stickers: ["thank-you", "fire-escape"], headline: ["Circle", "Stickers"], tone: "cream" },
  },
  {
    slug: "square-stickers",
    name: "Square stickers",
    kind: "custom",
    tagline: "Square stickers with rounded corners.",
    about: ["Square stickers with softly rounded corners, for logos, badges and packaging.", "Pick the size, the quantity and the finish. Free proof first."],
    facts: ["Square, rounded corners", ...STICKER_FACTS],
    product: "stickers",
    shape: "square",
    finishes: ["gloss", "matte", "holo"],
    sizes: [2, 3, 4, 5],
    quantities: [50, 100, 250, 500, 1000],
    art: { stickers: ["approved", "night-shift"], headline: ["Square", "Stickers"], tone: "ink" },
  },
  {
    slug: "rectangle-stickers",
    name: "Rectangle stickers",
    kind: "custom",
    tagline: "Rectangles for wordmarks, bumpers and labels.",
    about: ["Rectangle stickers with rounded corners: room for a wordmark, a message or a label.", "Pick the size, the quantity and the finish. Free proof first."],
    facts: ["Rectangle, rounded corners", ...STICKER_FACTS],
    product: "stickers",
    shape: "rectangle",
    finishes: ["gloss", "matte", "holo"],
    sizes: [2, 3, 4, 5],
    quantities: [50, 100, 250, 500, 1000],
    art: { stickers: ["caution", "label-bros"], headline: ["Rectangle", "Stickers"], tone: "yellow" },
  },
  {
    slug: "holographic-stickers",
    name: "Holographic stickers",
    kind: "custom",
    tagline: "Foil that shifts colour as it moves, cut to your shape.",
    about: ["Holographic foil under your design: it shifts through the rainbow as it catches the light.", "Pick the size and the quantity. Free proof first."],
    facts: ["Holographic foil", ...STICKER_FACTS],
    product: "stickers",
    shape: "die-cut",
    finishes: ["holo"],
    sizes: [2, 3, 4, 5],
    quantities: [50, 100, 250, 500, 1000],
    art: { stickers: ["label-bros", "new-burst"], headline: ["Holo", "Stickers"], tone: "blue" },
  },
  {
    slug: "embossed-stickers",
    name: "Embossed stickers",
    kind: "custom",
    tagline: "Raised, pressed-in stickers you can feel, for a premium brand.",
    about: [
      "Your design pressed up from the sticker, so the logo and lettering stand out to the touch. Made for premium packaging, bottles, boxes and gifts.",
      "Pick the size and the quantity. Free proof first; we call you if your design needs changes for the embossing.",
    ],
    facts: ["Raised embossing you can feel", "Cut to the shape of your design", "Free proof before we print", "Ships in 2–4 business days"],
    product: "stickers",
    shape: "die-cut",
    finishes: ["embossed"],
    sizes: [2, 3, 4, 5],
    quantities: [50, 100, 250, 500, 1000],
    art: { stickers: ["ember-oak", "beeline"], headline: ["Embossed", "Stickers"], tone: "ink", emboss: true },
    badge: "Premium",
  },
  {
    slug: "embossed-labels",
    name: "Embossed labels",
    kind: "custom",
    tagline: "Raised labels for bottles, jars, candles and gift boxes.",
    about: [
      "Rectangle labels with your logo and lettering pressed up from the surface: a label people pick up and feel.",
      "Pick the size and the quantity. Free proof first; we call you if your design needs changes for the embossing.",
    ],
    facts: ["Raised embossing you can feel", "Rectangle labels", "Free proof before we print", "Ships in 2–4 business days"],
    product: "labels",
    shape: "rectangle",
    finishes: ["embossed"],
    sizes: [2, 3, 4, 5],
    quantities: [50, 100, 250, 500, 1000],
    art: { stickers: ["night-shift", "ember-oak"], headline: ["Embossed", "Labels"], tone: "cream", emboss: true },
    badge: "Premium",
  },
  {
    slug: "glitter-stickers",
    name: "Glitter stickers",
    kind: "custom",
    tagline: "Stickers that sparkle in every light.",
    about: ["Your design printed over a glitter film that sparkles as it catches the light.", "Pick the size and the quantity. Free proof first."],
    facts: ["Sparkling glitter film", "Cut to the shape of your design", "Free proof before we print", "Ships in 2–4 business days"],
    product: "stickers",
    shape: "die-cut",
    finishes: ["glitter"],
    sizes: [2, 3, 4, 5],
    quantities: [50, 100, 250, 500, 1000],
    art: { stickers: ["new-burst", "fresh"], headline: ["Glitter", "Stickers"], tone: "ink", effect: "glitter" },
  },
  {
    slug: "clear-stickers",
    name: "Clear stickers",
    kind: "custom",
    tagline: "See-through stickers for windows, bottles and glass.",
    about: ["Printed on clear vinyl, so the surface shows through wherever there is no ink: made for windows, glass, bottles and packaging.", "Pick the size and the quantity. Free proof first."],
    facts: ["Clear, see-through vinyl", "Cut to the shape of your design", "Free proof before we print", "Ships in 2–4 business days"],
    product: "stickers",
    shape: "die-cut",
    finishes: ["clear"],
    sizes: [2, 3, 4, 5],
    quantities: [50, 100, 250, 500, 1000],
    art: { stickers: ["label-bros", "hop-scotch"], headline: ["Clear", "Stickers"], tone: "blue", effect: "clear" },
    priceToConfirm: true,
  },
  {
    slug: "chrome-stickers",
    name: "Chrome stickers",
    kind: "custom",
    tagline: "Mirror-finish stickers with a metallic shine.",
    about: ["Printed on mirror chrome film, for a metallic shine that turns heads.", "Pick the size and the quantity. Free proof first."],
    facts: ["Mirror chrome film", "Cut to the shape of your design", "Free proof before we print", "Ships in 2–4 business days"],
    product: "stickers",
    shape: "die-cut",
    finishes: ["chrome"],
    sizes: [2, 3, 4, 5],
    quantities: [50, 100, 250, 500, 1000],
    art: { stickers: ["night-shift", "label-bros"], headline: ["Chrome", "Stickers"], tone: "ink", effect: "chrome" },
    priceToConfirm: true,
  },
  {
    slug: "kiss-cut-stickers",
    name: "Kiss-cut stickers",
    kind: "custom",
    tagline: "Your sticker on a square backing that peels away easily.",
    about: ["The sticker is cut to your shape but the backing stays square, so it is easy to peel and has room around it.", "Pick the size, the quantity and the finish. Free proof first."],
    facts: ["Cut to your shape, square backing", "Durable vinyl", "Free proof before we print", "Ships in 2–4 business days"],
    product: "stickers",
    shape: "square",
    finishes: ["gloss", "matte", "holo"],
    sizes: [2, 3, 4, 5],
    quantities: [50, 100, 250, 500, 1000],
    art: { stickers: ["approved", "beeline"], headline: ["Kiss-cut", "Stickers"], tone: "yellow" },
    priceToConfirm: true,
  },
  {
    slug: "bumper-stickers",
    name: "Bumper stickers",
    kind: "custom",
    tagline: "Long, tough stickers for cars, bikes and coolers.",
    about: ["Long rectangles on weather-proof vinyl, made to last outdoors on cars, bikes, coolers and toolboxes.", "Pick the size, the quantity and the finish. Free proof first."],
    facts: ["Weather-proof vinyl for outdoors", "Long rectangle, rounded corners", "Free proof before we print", "Ships in 2–4 business days"],
    product: "stickers",
    shape: "rectangle",
    ratio: 0.3,
    finishes: ["gloss", "matte"],
    sizes: [8, 10, 12],
    quantities: [50, 100, 250, 500],
    art: { stickers: ["caution"], headline: ["Bumper", "Stickers"], tone: "blue" },
    priceToConfirm: true,
  },
  {
    slug: "reflective-stickers",
    name: "Reflective stickers",
    kind: "custom",
    tagline: "Stickers that shine back in headlights, for safety and night.",
    about: ["Printed on reflective film that shines back when light hits it: for bikes, helmets, vehicles and safety signs.", "Pick the size and the quantity. Free proof first."],
    facts: ["Reflective film, bright at night", "Cut to the shape of your design", "Free proof before we print", "Ships in 2–4 business days"],
    product: "stickers",
    shape: "die-cut",
    finishes: ["reflective"],
    sizes: [2, 3, 4, 5],
    quantities: [50, 100, 250, 500, 1000],
    art: { stickers: ["caution", "approved"], headline: ["Reflective", "Stickers"], tone: "ink", effect: "reflective" },
    priceToConfirm: true,
  },
  {
    slug: "qr-code-stickers",
    name: "QR code stickers",
    kind: "custom",
    tagline: "Scannable stickers that send people to your menu, site or reviews.",
    about: ["Send your link or your QR code and we print it sharp enough to scan: menus, reviews, social pages, payments.", "Pick the size, the quantity and the finish. Free proof first; we test-scan it on your proof."],
    facts: ["Printed sharp to scan", "Square, rounded corners", "Free proof before we print", "Ships in 2–4 business days"],
    product: "stickers",
    shape: "square",
    finishes: ["gloss", "matte"],
    sizes: [2, 3, 4, 5],
    quantities: [50, 100, 250, 500, 1000],
    art: { stickers: ["approved", "fire-escape"], headline: ["QR code", "Stickers"], tone: "cream" },
    priceToConfirm: true,
  },
  {
    slug: "product-labels",
    name: "Product labels",
    kind: "custom",
    tagline: "Labels for jars, bottles, candles and bags.",
    about: ["Rectangle labels for your products: jars, bottles, cans, candles and bags.", "Pick the size, the quantity and the finish. Free proof first."],
    facts: ["Rectangle labels", "Gloss or matte", "Free proof before we print", "Ships in 2–4 business days"],
    product: "labels",
    shape: "rectangle",
    finishes: ["gloss", "matte"],
    sizes: [2, 3, 4, 5],
    quantities: [50, 100, 250, 500, 1000],
    art: { stickers: ["ember-oak", "beeline"], headline: ["Product", "Labels"], tone: "cream" },
  },
];

export const productBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

/** The most packs of a deal in one order line. */
export const MAX_PACKS = 20;

export type LineChoice = { finish: Finish; size?: number; qty?: number; packs: number };

/** A line's choices, checked against its product: the corrected choice, or null if impossible. */
export function checkLine(p: Product, c: LineChoice): LineChoice | null {
  if (!p.finishes.includes(c.finish)) return null;
  const packs = Math.round(c.packs);
  if (!(packs >= 1 && packs <= MAX_PACKS)) return null;
  if (p.kind === "deal") return { finish: c.finish, packs, size: p.size, qty: p.qty };
  if (!c.size || !p.sizes?.includes(c.size) || !c.qty || !p.quantities?.includes(c.qty)) return null;
  return { finish: c.finish, packs: 1, size: c.size, qty: c.qty };
}

/**
 * One pack (deal) or one order (custom) in US dollars. Custom sizes are a square box (as in the
 * builder); a rectangle is priced by its area, size × size·2/3.
 */
export function unitPriceUsd(p: Product, c: LineChoice) {
  if (p.kind === "deal") return p.priceUsd ?? 0;
  const s = c.size ?? 3;
  const size = p.shape === "rectangle" ? Math.round(Math.sqrt(s * s * (p.ratio ?? 2 / 3)) * 100) / 100 : s;
  return quotePriceUsd(c.qty ?? 50, size, c.finish);
}

const inch = (n: number) => String(Math.round(n * 100) / 100);
/** A size in words: "3 in" (longest side), or both sides for rectangles: "10 × 3 in". */
export const sizeLabel = (p: Product, s: number) =>
  p.shape === "rectangle" ? `${inch(s)} × ${inch(s * (p.ratio ?? 2 / 3))} in` : `${inch(s)} in`;

/** The lowest price a product starts from, in US dollars (for cards). */
export const fromPriceUsd = (p: Product) =>
  p.kind === "deal" ? (p.priceUsd ?? 0) : unitPriceUsd(p, { finish: p.finishes[0], size: p.sizes?.[0], qty: p.quantities?.[0], packs: 1 });

/** A line in words: "50 die-cut stickers, 3 in, gloss" (× packs). */
export function lineSummary(p: Product, c: LineChoice) {
  const what = p.product === "labels" ? "labels" : `${p.shape} stickers`;
  const base = `${c.qty} ${what}, ${sizeLabel(p, c.size ?? 3)}, ${FINISH_LABEL[c.finish].toLowerCase()}`;
  return c.packs > 1 ? `${base} (${c.packs} packs)` : base;
}
