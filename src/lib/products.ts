/*
 * The shop: every product, its choices and its price, in one place (read by the shop pages, the
 * cart and the server, so they always agree). Labels come first: Label Bros prints labels for
 * products and packaging, for businesses; stickers come second.
 *
 * Two kinds:
 *   custom  pick the shape, size (any width and height), material, finish, format and quantity;
 *           priced by the formula in pricing.ts.
 *   deal    a fixed pack at one price (Sticker Bros' published sticker deals, and the sample pack);
 *           the customer picks the finish and how many packs.
 */

<<<<<<< Updated upstream
import { quotePriceUsd, type Finish } from "./facts";
=======
import {
  FORMATS_FOR,
  MATERIALS,
  MATERIALS_FOR,
  MAX_QTY,
  SHAPES,
  SHAPES_FOR,
  SIZE_LIMITS,
  minQty,
  sizeText,
  type FinishId,
  type FormatId,
  type MaterialId,
  type Range,
  type ShapeId,
} from "./options";
import { priceUsd } from "./pricing";
import { SAMPLE_KIT_ON } from "./site";
>>>>>>> Stashed changes

export type ProductImage = {
  /** The product photograph, cropped to 4:5. */
  src: string;
  w: number;
  h: number;
  alt: string;
  /** Square photograph for menus, cart lines and bulk packs. */
  thumb: string;
  /** Transparent sample artwork shared with the photograph and label preview. */
  label: { src: string; w: number; h: number };
};

export type Choice = {
  shape: ShapeId;
  w: number;
  h: number;
  material: MaterialId;
  finish: FinishId;
  format: FormatId;
  qty: number;
};

export type Product = {
  slug: string;
  name: string;
  /** the name in a sentence: "food labels" */
  plural: string;
  range: Range;
  kind: "custom" | "deal";
  /** where it sits in the menus */
  group: "product" | "format" | "stickers" | "deals" | "samples";
  /** one line for cards */
  tagline: string;
  /** a few short paragraphs for the product page */
  about: string[];
  /** what it's made for */
  uses: string[];
  image: ProductImage;
  /** the card's backdrop */
  tone: "cream" | "sky" | "sand" | "blue" | "ink" | "yellow";
  defaults: Choice;
  /** quick size picks, width × height in inches */
  presets: [number, number][];
  shapes?: ShapeId[];
  materials?: MaterialId[];
  badge?: string;
  /** deals: the pack's price and the regular price it replaces, in USD */
  priceUsd?: number;
  valueUsd?: number;
<<<<<<< Updated upstream
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
=======
  /** nothing to print from the customer (the sample pack) */
  noArtwork?: boolean;
  seo: { title: string; description: string };
};

const LABEL_PRESETS: [number, number][] = [
  [2, 2],
  [3, 2],
  [3, 3],
  [4, 3],
  [4, 6],
];
const STICKER_PRESETS: [number, number][] = [
  [2, 2],
  [3, 3],
  [4, 4],
  [5, 5],
];

const label = (c: Partial<Choice> & Pick<Choice, "shape" | "w" | "h">): Choice => ({
  material: "white-bopp",
  finish: "gloss",
  format: "roll",
  qty: 500,
  ...c,
});
const sticker = (c: Partial<Choice> & Pick<Choice, "shape" | "w" | "h">): Choice => ({
  material: "vinyl",
  finish: "gloss",
  format: "cut",
  qty: 100,
  ...c,
});

const ALL: Product[] = [
  // ---------- labels, by product ----------
>>>>>>> Stashed changes
  {
    slug: "custom-labels",
    name: "Custom labels",
    plural: "custom labels",
    range: "labels",
    kind: "custom",
    group: "format",
    tagline: "Any shape, any size, on rolls or sheets.",
    about: [
      "Labels for your products and packaging, printed to the exact size you need: type the width and height in inches and the price follows.",
      "Choose waterproof BOPP film, paper, kraft or metallic silver, in gloss or matte. Send your artwork, or tell us your idea and our designers draw it. We check every file and send a free proof; nothing prints until you approve it.",
    ],
    uses: ["Jars and bottles", "Boxes and bags", "Tins and cans", "Candles and soap", "Gift and retail"],
    image: { src: "/products/realistic/custom-labels.webp", w: 1024, h: 1280, alt: "Jar, kraft pouch and carton with wide rectangular Your Brand labels", thumb: "/products/realistic/custom-labels-thumb.webp", label: { src: "/products/labels/jam.webp", w: 720, h: 334 } },
    tone: "sky",
    defaults: label({ shape: "die-cut", w: 3, h: 2 }),
    presets: LABEL_PRESETS,
    badge: "Start here",
    seo: {
      title: "Custom labels in any size",
      description: "Custom product labels on rolls or sheets, in any shape and size. Waterproof BOPP, paper, kraft and metallic. Free proof, bulk pricing from 500.",
    },
  },
  {
    slug: "roll-labels",
    name: "Roll labels",
    plural: "roll labels",
    range: "labels",
    kind: "custom",
    group: "format",
    tagline: "On a roll, for packing lines and label applicators.",
    about: [
      "Labels wound on a roll, quick to peel by hand and made to run on label applicators and dispensers. The way businesses label hundreds or thousands of products.",
      "Pick the shape, size and material; we confirm the core size and the direction the labels come off the roll with your proof. The more you order, the less each label costs.",
    ],
    uses: ["Packing lines", "Label applicators", "Food and drink", "Cosmetics", "Shipping and fulfilment"],
    image: { src: "/products/realistic/roll-labels.webp", w: 1024, h: 1280, alt: "Roll of 3 by 2 inch rounded Your Brand labels on glassine backing", thumb: "/products/realistic/roll-labels-thumb.webp", label: { src: "/products/labels/jam.webp", w: 720, h: 334 } },
    tone: "cream",
    defaults: label({ shape: "die-cut", w: 3, h: 2, qty: 1000 }),
    presets: LABEL_PRESETS,
    badge: "For business",
    seo: {
      title: "Custom roll labels",
      description: "Custom roll labels for packing lines and label applicators. Any size, waterproof BOPP or paper, bulk prices from 500 labels. Free proof before we print.",
    },
  },
  {
    slug: "food-labels",
    name: "Food labels",
    plural: "food labels",
    range: "labels",
    kind: "custom",
    group: "product",
    tagline: "For jars, tubs, bags and boxes of food.",
    about: [
      "Labels for jams, sauces, baked goods, snacks and spices. White BOPP film is waterproof and wipes clean, so it keeps looking sharp in the fridge and through busy markets.",
      "Leave room for your ingredients and best-before date; uncoated paper takes a pen if you date by hand. We check your file and send a free proof before anything prints.",
    ],
    uses: ["Jams and preserves", "Sauces and dressings", "Bakery boxes", "Snacks and spices", "Meal prep"],
    image: { src: "/products/realistic/food-labels.webp", w: 1024, h: 1280, alt: "Strawberry jam jar with a round 3 inch Your Brand food label", thumb: "/products/realistic/food-labels-thumb.webp", label: { src: "/products/labels/jam.webp", w: 720, h: 334 } },
    tone: "sand",
    defaults: label({ shape: "die-cut", w: 3, h: 3 }),
    presets: [
      [2, 2],
      [2.5, 2.5],
      [3, 3],
      [3, 2],
      [4, 3],
    ],
    seo: {
      title: "Custom food labels",
      description: "Custom food labels for jars, tubs, bags and boxes. Waterproof BOPP or paper, any size, on rolls or sheets. Free proof, bulk pricing from 500.",
    },
  },
  {
    slug: "beverage-labels",
    name: "Beverage labels",
    plural: "beverage labels",
    range: "labels",
    kind: "custom",
    group: "product",
    tagline: "Wrap-around labels for bottles and cans.",
    about: [
      "Labels for kombucha, juice, coffee, beer, soda and water: wide wrap-arounds that go all the way round the bottle, or front and back labels.",
      "White BOPP film shrugs off condensation and ice buckets; clear BOPP gives the no-label look on glass. Type your exact size and we check it fits with your proof.",
    ],
    uses: ["Kombucha and juice", "Craft beer and cider", "Cold brew", "Water and soda", "Hot sauce"],
    image: { src: "/products/realistic/beverage-labels.webp", w: 1024, h: 1280, alt: "Amber kombucha bottle with a wide teal Your Brand wrap-around label", thumb: "/products/realistic/beverage-labels-thumb.webp", label: { src: "/products/labels/kombucha.webp", w: 720, h: 383 } },
    tone: "sky",
    defaults: label({ shape: "die-cut", w: 6, h: 2.5 }),
    presets: [
      [4, 3],
      [5, 3],
      [6, 2.5],
      [7, 3],
      [8, 4],
    ],
    seo: {
      title: "Custom beverage and bottle labels",
      description: "Custom beverage labels for bottles and cans: wrap-arounds and front labels on waterproof BOPP. Any size, free proof, bulk pricing from 500.",
    },
  },
  {
    slug: "bottle-labels",
    name: "Bottle labels",
    plural: "bottle labels",
    range: "labels",
    kind: "custom",
    group: "product",
    tagline: "For oil, wine, spirits and sauce bottles.",
    about: [
      "Tall labels for olive oil, vinegar, wine, spirits and sauces. Matte BOPP resists oil and drips; metallic silver adds a premium shine.",
      "Give us the size of the flat area on your bottle and we fit your design to it. Free proof first.",
    ],
    uses: ["Olive oil and vinegar", "Wine and spirits", "Sauces and syrups", "Cleaning products"],
    image: { src: "/products/realistic/bottle-labels.webp", w: 1024, h: 1280, alt: "Olive oil bottle with a tall 3 by 4 inch rounded Your Brand label", thumb: "/products/realistic/bottle-labels-thumb.webp", label: { src: "/products/labels/olive-oil.webp", w: 564, h: 720 } },
    tone: "cream",
    defaults: label({ shape: "die-cut", w: 3, h: 4, finish: "matte" }),
    presets: [
      [2, 3],
      [3, 4],
      [3.5, 4.5],
      [4, 5],
    ],
    seo: {
      title: "Custom bottle labels",
      description: "Custom bottle labels for oil, wine, spirits and sauces. Oil-resistant BOPP, paper or metallic silver, any size. Free proof, bulk pricing from 500.",
    },
  },
  {
    slug: "coffee-labels",
    name: "Coffee & tea labels",
    plural: "coffee and tea labels",
    range: "labels",
    kind: "custom",
    group: "product",
    tagline: "For tins, bags and pouches.",
    about: [
      "Labels for coffee bags, tea tins and pouches: your roast or blend, origin and tasting notes, cut to a shape that fits the bag.",
      "Matte BOPP or kraft paper suit a craft look. Order one design per blend, or ask for several in one order in the notes.",
    ],
    uses: ["Coffee bags", "Tea tins", "Pouches", "Subscription boxes"],
    image: { src: "/products/realistic/coffee-labels.webp", w: 1024, h: 1280, alt: "Kraft coffee pouch with a tall matte black Your Brand die-cut label", thumb: "/products/realistic/coffee-labels-thumb.webp", label: { src: "/products/labels/coffee.webp", w: 579, h: 720 } },
    tone: "sand",
    defaults: label({ shape: "die-cut", w: 3, h: 4, finish: "matte" }),
    presets: [
      [2, 3],
      [3, 4],
      [3, 3],
      [4, 5],
    ],
    seo: {
      title: "Custom coffee and tea labels",
      description: "Custom coffee and tea labels for bags, tins and pouches. Matte BOPP or kraft paper, any shape and size. Free proof, bulk pricing from 500.",
    },
  },
  {
    slug: "candle-labels",
    name: "Candle labels",
    plural: "candle labels",
    range: "labels",
    kind: "custom",
    group: "product",
    tagline: "For jars, tins and lids.",
    about: [
      "Front labels for candle jars and tins, and small round labels for the lid or the bottom with your scent and safety notes.",
      "Matte BOPP, paper and metallic silver all suit candles. Free proof first.",
    ],
    uses: ["Candle jars", "Tins and lids", "Wax melts", "Diffusers"],
    image: { src: "/products/realistic/candle-labels.webp", w: 1024, h: 1280, alt: "Soy candle in a glass tumbler with a round 3 inch Your Brand label", thumb: "/products/realistic/candle-labels-thumb.webp", label: { src: "/products/labels/candle.webp", w: 720, h: 384 } },
    tone: "cream",
    defaults: label({ shape: "die-cut", w: 3, h: 3, finish: "matte" }),
    presets: [
      [2, 2],
      [2.5, 2.5],
      [3, 3],
      [3, 2],
    ],
    seo: {
      title: "Custom candle labels",
      description: "Custom candle labels for jars, tins and lids. Matte BOPP, paper or metallic silver, any shape and size. Free proof, bulk pricing from 500.",
    },
  },
  {
    slug: "cosmetic-labels",
    name: "Cosmetic labels",
    plural: "cosmetic labels",
    range: "labels",
    kind: "custom",
    group: "product",
    tagline: "For skincare, soap and bath products.",
    about: [
      "Small, sharp labels for serums, creams, soaps and bath products. BOPP film stands up to water and oils in the bathroom.",
      "Need small print for ingredients? Tell us and we check it stays readable at your size on the proof.",
    ],
    uses: ["Serums and oils", "Creams and balms", "Soap and bath", "Hair care"],
    image: { src: "/products/realistic/cosmetic-labels.webp", w: 1024, h: 1280, alt: "Amber dropper bottle with a portrait sage Your Brand cosmetic label", thumb: "/products/realistic/cosmetic-labels-thumb.webp", label: { src: "/products/labels/face-oil.webp", w: 720, h: 497 } },
    tone: "sky",
    defaults: label({ shape: "die-cut", w: 1.5, h: 2, finish: "matte" }),
    presets: [
      [1, 2],
      [1.5, 2],
      [2, 3],
      [2.5, 2.5],
    ],
    seo: {
      title: "Custom cosmetic and skincare labels",
      description: "Custom cosmetic labels for skincare, soap and bath products. Waterproof BOPP, paper or metallic silver, any size. Free proof, bulk pricing from 500.",
    },
  },
  {
    slug: "circle-labels",
    name: "Circle labels & seals",
    plural: "circle labels",
    range: "labels",
    kind: "custom",
    group: "format",
    tagline: "Round labels for lids, boxes and packaging seals.",
    about: [
      "Round labels for jar lids, box seals, bags and thank-you notes in every order you ship.",
      "Pick the size from 3/4 inch up and the quantity: the more you order, the less each one costs.",
    ],
    uses: ["Jar lids", "Box and bag seals", "Thank-you labels", "Logo labels"],
    image: { src: "/products/realistic/circle-labels.webp", w: 1024, h: 1280, alt: "Kraft packaging sealed with matching round 2 inch Your Brand labels", thumb: "/products/realistic/circle-labels-thumb.webp", label: { src: "/products/labels/jam.webp", w: 720, h: 334 } },
    tone: "cream",
    defaults: label({ shape: "die-cut", w: 2, h: 2, qty: 1000 }),
    presets: [
      [1, 1],
      [1.5, 1.5],
      [2, 2],
      [3, 3],
    ],
    seo: {
      title: "Custom circle labels and packaging seals",
      description: "Custom circle labels and seals for lids, boxes and bags. Any size, on rolls or sheets, waterproof BOPP or paper. Bulk pricing from 500.",
    },
  },
  {
    slug: "sheet-labels",
    name: "Sheet labels",
    plural: "sheet labels",
    range: "labels",
    kind: "custom",
    group: "format",
    tagline: "Several to a sheet, easy to store and peel by hand.",
    about: [
      "Labels printed several to a sheet: tidy to store and quick to peel by hand when you label in small batches.",
      "Any shape and size; we fit as many to each sheet as we can and show you the layout on your proof.",
    ],
    uses: ["Small batches", "Markets and pop-ups", "Hand labelling", "Office and storage"],
    image: { src: "/products/realistic/sheet-labels.webp", w: 1024, h: 1280, alt: "Letter-size sheet of eight 3 by 2 inch Your Brand labels with one corner lifted", thumb: "/products/realistic/sheet-labels-thumb.webp", label: { src: "/products/labels/candle.webp", w: 720, h: 384 } },
    tone: "sand",
    defaults: label({ shape: "die-cut", w: 3, h: 2, format: "sheet", qty: 250 }),
    presets: LABEL_PRESETS,
    seo: {
      title: "Custom sheet labels",
      description: "Custom labels printed on sheets, any shape and size. Waterproof BOPP, paper or kraft. Free proof before we print.",
    },
  },

  // ---------- stickers, by material (as Kraftix sorts them; client, 2026-11-12) ----------
  {
    slug: "vinyl-stickers",
    name: "Vinyl stickers",
    plural: "vinyl stickers",
    range: "stickers",
    kind: "custom",
<<<<<<< Updated upstream
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
=======
    group: "stickers",
    tagline: "Thick, waterproof vinyl in gloss or matte.",
>>>>>>> Stashed changes
    about: [
      "Our everyday sticker: thick white vinyl that shrugs off water, sun and scratches, for laptops, bottles, merch and packaging.",
      "Cut right round your design, or as a circle, square or rounded rectangle, in any size. Gloss or matte. Free proof first.",
    ],
    uses: ["Merch and giveaways", "Laptops and bottles", "Packaging", "Events"],
    image: { src: "/products/realistic/vinyl-stickers.webp", w: 1024, h: 1280, alt: "Three 3 inch Your Brand vinyl stickers with gloss and white die-cut borders", thumb: "/products/realistic/vinyl-stickers-thumb.webp", label: { src: "/products/labels/sticker.webp", w: 716, h: 720 } },
    tone: "cream",
    defaults: sticker({ shape: "die-cut", w: 3, h: 3 }),
    presets: STICKER_PRESETS,
    shapes: ["die-cut", "circle", "square"],
    materials: ["vinyl"],
    badge: "Most popular",
    seo: {
      title: "Custom vinyl stickers",
      description: "Custom waterproof vinyl stickers in gloss or matte, die-cut or any shape, any size from 1 to 24 inches. Free proof before we print.",
    },
  },
  {
    slug: "clear-stickers",
    name: "Clear stickers",
    plural: "clear stickers",
    range: "stickers",
    kind: "custom",
    group: "stickers",
    tagline: "Transparent vinyl: only your design shows.",
    about: ["Printed on clear vinyl, so the surface shows through wherever there is no ink: made for windows, glass, bottles and packaging.", "Any shape and size. Free proof first."],
    uses: ["Windows and glass", "Bottles", "Packaging"],
    image: { src: "/products/realistic/clear-stickers.webp", w: 1024, h: 1280, alt: "Clear glass jar with a transparent 3 inch Your Brand vinyl sticker", thumb: "/products/realistic/clear-stickers-thumb.webp", label: { src: "/products/labels/sticker.webp", w: 716, h: 720 } },
    tone: "sky",
    defaults: sticker({ shape: "die-cut", w: 3, h: 3, material: "clear-vinyl" }),
    presets: STICKER_PRESETS,
    shapes: ["die-cut", "circle", "square"],
    materials: ["clear-vinyl"],
    seo: {
      title: "Custom clear stickers",
      description: "Custom transparent vinyl stickers for windows, glass and packaging, any shape and size. Free proof before we print.",
    },
  },
  {
    slug: "holographic-stickers",
    name: "Holographic stickers",
    plural: "holographic stickers",
    range: "stickers",
    kind: "custom",
    group: "stickers",
    tagline: "Rainbow foil that shifts as it moves.",
    about: ["Holographic foil under your design: it shifts through the rainbow as it catches the light.", "Any shape and size. Free proof first."],
    uses: ["Merch", "Limited drops", "Packaging", "Events"],
    image: { src: "/products/realistic/holographic-stickers.webp", w: 1024, h: 1280, alt: "Two 3 inch Your Brand holographic stickers with realistic rainbow foil", thumb: "/products/realistic/holographic-stickers-thumb.webp", label: { src: "/products/labels/sticker.webp", w: 716, h: 720 } },
    tone: "ink",
    defaults: sticker({ shape: "die-cut", w: 3, h: 3, material: "holographic", qty: 100 }),
    presets: STICKER_PRESETS,
    shapes: ["die-cut", "circle", "square"],
    materials: ["holographic"],
    seo: {
      title: "Custom holographic stickers",
      description: "Custom holographic stickers in rainbow foil, any shape and size. Free proof before we print.",
    },
  },
  {
    slug: "glitter-stickers",
    name: "Glitter stickers",
    plural: "glitter stickers",
    range: "stickers",
    kind: "custom",
    group: "stickers",
    tagline: "A glitter film that sparkles in every light.",
    about: ["Your design printed over a glitter film that sparkles as it catches the light.", "Any shape and size. Free proof first."],
    uses: ["Merch", "Gifts", "Events"],
    image: { src: "/products/realistic/glitter-stickers.webp", w: 1024, h: 1280, alt: "Pink and gold 3 inch Your Brand stickers showing fine glitter film", thumb: "/products/realistic/glitter-stickers-thumb.webp", label: { src: "/products/labels/sticker.webp", w: 716, h: 720 } },
    tone: "ink",
    defaults: sticker({ shape: "die-cut", w: 3, h: 3, material: "glitter", qty: 100 }),
    presets: STICKER_PRESETS,
    shapes: ["die-cut", "circle", "square"],
    materials: ["glitter"],
    seo: {
      title: "Custom glitter stickers",
      description: "Custom glitter stickers that sparkle in every light, any shape and size. Free proof before we print.",
    },
  },
  {
    slug: "kraft-stickers",
    name: "Kraft paper stickers",
    plural: "kraft paper stickers",
    range: "stickers",
    kind: "custom",
    group: "stickers",
    tagline: "Natural brown paper with a handmade feel.",
    about: ["Printed on natural brown kraft paper: an earthy, handmade look for packaging, gifts and thank-you notes. Best indoors and dry.", "Any shape and size. Free proof first."],
    uses: ["Packaging seals", "Thank-you notes", "Gift wrap", "Bakeries"],
    image: { src: "/products/realistic/kraft-stickers.webp", w: 1024, h: 1280, alt: "Round 2 inch kraft Your Brand thank-you stickers on white tissue wrapping", thumb: "/products/realistic/kraft-stickers-thumb.webp", label: { src: "/products/labels/sticker.webp", w: 716, h: 720 } },
    tone: "sand",
    defaults: sticker({ shape: "die-cut", w: 2, h: 2, material: "kraft", finish: "uncoated" }),
    presets: STICKER_PRESETS,
    shapes: ["die-cut", "circle", "square"],
    materials: ["kraft"],
    seo: {
      title: "Custom kraft paper stickers",
      description: "Custom kraft paper stickers with a natural, handmade look, any shape and size. Free proof before we print.",
    },
  },
  {
    slug: "metallic-stickers",
    name: "Silver & gold stickers",
    plural: "metallic stickers",
    range: "stickers",
    kind: "custom",
    group: "stickers",
    tagline: "Brushed silver or gold for a premium shine.",
    about: ["Printed on brushed silver or gold film: a luxury finish for candles, spirits, cosmetics and gift boxes.", "Any shape and size, gloss or matte. Free proof first."],
    uses: ["Premium packaging", "Candles and spirits", "Gift boxes"],
    image: { src: "/products/realistic/metallic-stickers.webp", w: 1024, h: 1280, alt: "Matching round 2 inch gold and silver Your Brand metallic stickers", thumb: "/products/realistic/metallic-stickers-thumb.webp", label: { src: "/products/labels/sticker.webp", w: 716, h: 720 } },
    tone: "blue",
    defaults: sticker({ shape: "die-cut", w: 2, h: 2, material: "gold" }),
    presets: STICKER_PRESETS,
    shapes: ["die-cut", "circle", "square"],
    materials: ["gold", "silver"],
    badge: "Premium",
    seo: {
      title: "Custom silver and gold stickers",
      description: "Custom metallic silver and gold stickers, any shape and size, gloss or matte. Free proof before we print.",
    },
  },

  // ---------- sticker deals (Sticker Bros' published deals, 2026-11-09; to be checked weekly) ----------
  {
    slug: "50-3in-custom-stickers",
    name: "50 custom stickers, 3 in",
    plural: "custom stickers",
    range: "stickers",
    kind: "deal",
    group: "deals",
    tagline: "Fifty 3 inch die-cut stickers of your design.",
    about: [
      "Fifty die-cut vinyl stickers, 3 inches on their longest side, cut right round your design.",
      "Upload your artwork or let us design it. Free proof first.",
    ],
    uses: ["Try a design", "Events", "Merch"],
    image: { src: "/products/realistic/50-3in-custom-stickers.webp", w: 1024, h: 1280, alt: "Stack of matching 3 inch red Your Brand custom vinyl stickers", thumb: "/products/realistic/50-3in-custom-stickers-thumb.webp", label: { src: "/products/labels/sticker.webp", w: 716, h: 720 } },
    tone: "ink",
    defaults: sticker({ shape: "die-cut", w: 3, h: 3, qty: 50 }),
    presets: [],
    priceUsd: 29,
    valueUsd: 71,
    badge: "Deal",
    seo: { title: "50 custom stickers, 3 inch", description: "Fifty 3 inch die-cut vinyl stickers of your design, with a free proof." },
  },
  {
    slug: "250-3in-vinyl-stickers",
    name: "250 vinyl stickers, 3 in",
    plural: "vinyl stickers",
    range: "stickers",
    kind: "deal",
    group: "deals",
    tagline: "Two hundred and fifty 3 inch vinyl stickers.",
    about: ["Two hundred and fifty die-cut vinyl stickers, 3 inches on their longest side.", "Upload your artwork or let us design it. Free proof first."],
    uses: ["Packaging", "Events", "Giveaways"],
    image: { src: "/products/realistic/250-3in-vinyl-stickers.webp", w: 1024, h: 1280, alt: "Bulk stacks of identical 3 inch Your Brand vinyl stickers beside a kraft envelope", thumb: "/products/realistic/250-3in-vinyl-stickers-thumb.webp", label: { src: "/products/labels/sticker.webp", w: 716, h: 720 } },
    tone: "cream",
    defaults: sticker({ shape: "die-cut", w: 3, h: 3, qty: 250 }),
    presets: [],
    priceUsd: 49,
    valueUsd: 150,
    badge: "Deal",
    seo: { title: "250 vinyl stickers, 3 inch", description: "Two hundred and fifty 3 inch die-cut vinyl stickers, with a free proof." },
  },

  // ---------- samples ----------
  {
<<<<<<< Updated upstream
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
=======
    slug: "sample-pack",
    name: "Sample pack",
    plural: "sample packs",
    range: "labels",
    kind: "deal",
    group: "samples",
    tagline: "Feel our materials before a big order.",
    about: [
      `A pack of ${15} printed samples of our label materials and sticker finishes, so you can see and feel them before you order thousands.`,
      "Mailed to you; nothing to design or upload.",
    ],
    uses: ["Before a bulk order", "Choosing a material"],
    image: { src: "/products/realistic/sample-pack.webp", w: 1024, h: 1280, alt: "Sample pack with proportioned white, clear, kraft, metallic, holographic and glitter materials", thumb: "/products/realistic/sample-pack-thumb.webp", label: { src: "/products/labels/sticker.webp", w: 716, h: 720 } },
    tone: "yellow",
    defaults: label({ shape: "rectangle", w: 3, h: 2, qty: 15 }),
    presets: [],
    materials: ["white-bopp"],
    priceUsd: 5,
    noArtwork: true,
    seo: { title: "Label and sticker sample pack", description: "Printed samples of our label materials and sticker finishes, mailed to you." },
>>>>>>> Stashed changes
  },
];

export const PRODUCTS: Product[] = ALL.filter((p) => SAMPLE_KIT_ON || p.group !== "samples");
export const LABEL_PRODUCTS = PRODUCTS.filter((p) => p.range === "labels" && p.kind === "custom");
export const STICKER_PRODUCTS = PRODUCTS.filter((p) => p.range === "stickers" && p.kind === "custom");
export const DEALS = PRODUCTS.filter((p) => p.group === "deals");
export const SAMPLE_PACK = PRODUCTS.find((p) => p.group === "samples");

export const productBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

/** The shapes, materials and formats a product can be made in. */
export const shapesOf = (p: Product) => (p.kind === "deal" ? [p.defaults.shape] : (p.shapes ?? SHAPES_FOR[p.range]));
export const materialsOf = (p: Product) => p.materials ?? (p.kind === "deal" ? [p.defaults.material] : MATERIALS_FOR(p.range));
export const formatsOf = (p: Product) => (p.kind === "deal" ? [p.defaults.format] : FORMATS_FOR[p.range]);

/** The most packs of a deal in one order line. */
export const MAX_PACKS = 20;

<<<<<<< Updated upstream
export type LineChoice = { finish: Finish; size?: number; qty?: number; packs: number };
=======
export type LineChoice = Choice & { packs: number };

const r2 = (n: number) => Math.round(n * 100) / 100;
>>>>>>> Stashed changes

/** A line's choices, checked against its product: the corrected choice, or null if impossible. */
export function checkLine(p: Product, c: LineChoice): LineChoice | null {
  const m = MATERIALS[c.material];
  if (!m || !materialsOf(p).includes(c.material) || !m.finishes.includes(c.finish)) return null;
  const packs = Math.round(c.packs);
  if (!(packs >= 1 && packs <= MAX_PACKS)) return null;
<<<<<<< Updated upstream
  if (p.kind === "deal") return { finish: c.finish, packs, size: p.size, qty: p.qty };
  if (!c.size || !p.sizes?.includes(c.size) || !c.qty || !p.quantities?.includes(c.qty)) return null;
  return { finish: c.finish, packs: 1, size: c.size, qty: c.qty };
=======
  if (p.kind === "deal") return { ...p.defaults, material: c.material, finish: c.finish, packs };

  if (!shapesOf(p).includes(c.shape) || !formatsOf(p).includes(c.format)) return null;
  const lim = SIZE_LIMITS[p.range];
  const w = r2(c.w);
  const h = SHAPES[c.shape].equal ? w : r2(c.h);
  const fits = (n: number) => Number.isFinite(n) && n >= lim.min && n <= lim.max;
  if (!fits(w) || !fits(h)) return null;
  const qty = c.qty;
  if (!Number.isInteger(qty) || qty < minQty(p.range, c.material) || qty > MAX_QTY) return null;
  return { shape: c.shape, w, h, material: c.material, finish: c.finish, format: c.format, qty, packs: 1 };
>>>>>>> Stashed changes
}

/** One pack (deal) or one order (custom), in US dollars. */
export function unitPriceUsd(p: Product, c: Choice) {
  if (p.kind === "deal") return p.priceUsd ?? 0;
<<<<<<< Updated upstream
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
=======
  return priceUsd({ range: p.range, shape: c.shape, w: c.w, h: c.h, material: c.material, qty: c.qty });
}

/** "label" or "sticker", for "price each". */
export const unitWord = (p: Product) => (p.range === "labels" ? "label" : "sticker");

/** A material and finish in words: "White BOPP, gloss", "Kraft paper". */
export function materialText(m: MaterialId, f: FinishId) {
  const mat = MATERIALS[m];
  return mat.finishes.length > 1 ? `${mat.label}, ${f}` : mat.label;
}

/** A line in words: "1,000 food labels · 3 × 2 in rectangle · White BOPP, gloss · on a roll". */
export function lineSummary(p: Product, c: LineChoice) {
  if (p.noArtwork) return `${p.name}${c.packs > 1 ? ` × ${c.packs}` : ""}`;
  const parts = [
    `${c.qty.toLocaleString("en-CA")} ${p.plural}`,
    `${sizeText(c.shape, c.w, c.h)} ${SHAPES[c.shape].label.toLowerCase()}`,
    materialText(c.material, c.finish),
  ];
  if (p.range === "labels") parts.push(c.format === "roll" ? "on a roll" : "on sheets");
  const base = parts.join(" · ");
>>>>>>> Stashed changes
  return c.packs > 1 ? `${base} (${c.packs} packs)` : base;
}

/** A product's own page, with choices set (from the quick price bar or a bulk link). */
export function productHref(p: Product, c?: Partial<Choice> & { bulk?: boolean }) {
  if (!c) return `/shop/${p.slug}`;
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(c)) if (v !== undefined && v !== false) q.set(k, String(v === true ? 1 : v));
  const s = q.toString();
  return `/shop/${p.slug}${s ? `?${s}` : ""}`;
}
