import { DESERT_BLOOM } from "@/components/how-page/desert-bloom";
import { LABELS } from "@/components/labels-page/art";
import { ART } from "@/components/stickers-page/art";

/*
 * The service pages, as data: every word (written to be read and to be found), the hero
 * artwork, what each one is made of, its finishes, facts panel, questions and neighbours. Prices,
 * minimums and terms follow src/lib/facts.ts; the brands on the artwork are made up.
 */

export type ServiceSlug =
  | "die-cut-stickers"
  | "holographic-glitter"
  | "kiss-cut-sheets"
  | "roll-labels"
  | "packaging-seals"
  | "custom-design";

export type Art = { src: string; w: number; h: number };
type QuoteParams = { product: "stickers" | "labels"; shape?: string; finish?: string; artwork?: "upload" | "design" };

/** A piece of hero art: centre (x, y) and width as % of the hero's art box, turn in degrees. */
export type Placed = { art: Art; alt: string; x: number; y: number; w: number; r: number };

/**
 * How the hero shows the product (service-motion.ts animates each):
 * collage: stickers slap down one after another; sheet: a kiss-cut sheet, one sticker lifts;
 * strip: labels on their liner slide in; seal: a seal slaps onto a mailer; ink: a sketch is
 * inked into the finished sticker.
 */
export type HeroKind = "collage" | "sheet" | "strip" | "seal" | "ink";

/** What a finish looks like on its sample card (CSS and service-motion.ts). */
export type Look = "gloss" | "matte" | "holo" | "glitter" | "kraft" | "paper" | "vinyl";

export type Service = {
  slug: ServiceSlug;
  name: string;
  short: string;
  h1: [string, string];
  lede: string;
  description: string;
  facts: string[];
  quote: QuoteParams;
  hero: { kind: HeroKind; art: Placed[] };
  overview: { title: string; paras: string[]; good: string[] };
  layers: { name: string; body: string }[];
  finishes: { name: string; body: string; look: Look; art: Art }[];
  uses: { title: string; body: string; art: Art; rot: number }[];
  panel: { title: string; rows: [string, string][]; foot: string };
  faqs: { q: string; a: string }[];
  related: ServiceSlug[];
};

const at = (art: Art, alt: string, x: number, y: number, w: number, r: number): Placed => ({ art, alt, x, y, w, r });
const SKETCH: Art = { src: DESERT_BLOOM.sketch, w: DESERT_BLOOM.w, h: DESERT_BLOOM.h };
const BLOOM: Art = { src: DESERT_BLOOM.art, w: DESERT_BLOOM.w, h: DESERT_BLOOM.h };

const vinylLayers = (face: string, faceBody: string) => [
  { name: "Laminate", body: "A clear top layer over the print, in gloss or matte." },
  { name: "Your artwork", body: "Printed in full colour." },
  { name: face, body: faceBody },
  { name: "Adhesive", body: "On the back, ready to stick: permanent as standard, removable if you ask." },
  { name: "Backing", body: "The paper it peels from, there only until you use it." },
];

export const SERVICES: Service[] = [
  {
    slug: "die-cut-stickers",
    name: "Die-cut stickers",
    short: "Cut right round your design, so the sticker is the shape of your art.",
    h1: ["Die-cut", "stickers."],
    lede: "Custom stickers cut right round your artwork, so the sticker is the shape of your design, not a square around it. Vinyl, in gloss or matte, with a free proof before we print.",
    description:
      "Custom die-cut stickers cut right round your artwork, in gloss or matte vinyl. Send your design or let our designers make it, and approve a free proof before we print.",
    facts: ["Free proof before print", "From 10 stickers", "Ships in 2–4 business days"],
    quote: { product: "stickers", shape: "die-cut" },
    hero: {
      kind: "collage",
      art: [
        at(ART.fresh, "Sample die-cut sticker: Fresh! lettering", 24, 76, 46, -8),
        at(ART.beeline, "Sample die-cut sticker: Beeline honey, hexagon", 80, 24, 30, 9),
        at(ART["fire-escape"], "Sample die-cut sticker: Fire Escape hot sauce, scalloped", 52, 46, 58, -4),
      ],
    },
    overview: {
      title: "What are die-cut stickers?",
      paras: [
        "A die-cut sticker is cut along the outline of the artwork itself. Instead of a rectangle or a circle with your design printed inside, the edge of the sticker follows the design, with a thin white border so the cut never clips the art.",
        "We draw the cut line for you from your file. You see exactly where it goes on your free proof, and nothing is printed until you approve it.",
      ],
      good: ["Logo and brand stickers", "Merch and giveaways", "Laptop and bottle stickers", "Packaging and product stickers"],
    },
    layers: vinylLayers("White vinyl", "The sticker itself, cut right round your design."),
    finishes: [
      { name: "Gloss", body: "Bright colour and a shine that catches the light.", look: "gloss", art: ART["fire-escape"] },
      { name: "Matte", body: "Soft, smooth, no glare. Easy to read from any angle.", look: "matte", art: ART["fire-escape"] },
    ],
    uses: [
      { title: "Brand stickers", body: "Your logo, cut to its own shape.", art: ART["label-bros"], rot: -5 },
      { title: "Laptops and bottles", body: "Stickers people put on the things they carry.", art: ART["night-shift"], rot: 4 },
      { title: "Events and giveaways", body: "Something to hand out that people keep.", art: ART.fresh, rot: -3 },
      { title: "Product packaging", body: "A sticker on the box, the bag or the jar.", art: ART.beeline, rot: 6 },
    ],
    panel: {
      title: "Sticker Facts",
      rows: [
        ["Material", "White vinyl"],
        ["Finish", "Gloss or matte laminate"],
        ["Shape", "Cut to your outline"],
        ["Sizes", "1 to 24 inches"],
        ["Quantity", "From 10"],
        ["Proof", "Free, before we print"],
        ["Turnaround", "2–4 business days after proof approval"],
      ],
      foot: "Prices depend on size, quantity and finish. See yours as you order.",
    },
    faqs: [
      { q: "What does die-cut mean?", a: "The sticker is cut right round your design, so its edge follows the shape of your art instead of a square or a circle." },
      { q: "Can it be any shape?", a: "Yes, as long as the outline is one piece. We draw the cut line for you and you see it on your proof." },
      { q: "Gloss or matte?", a: "Gloss makes colours look brighter and catches the light. Matte is softer and has no glare. You see your choice on your free proof before anything prints." },
      { q: "Will they survive water and sun?", a: "Yes. The vinyl is laminated, which makes it waterproof, scratch-resistant and UV-resistant, with an outdoor life of 4 years or more. Hand washing keeps them looking new for longest." },
      { q: "How small can the details be?", a: "Keep each sticker at least 1 inch across. Our designers check every file before it prints and tell you on your proof if any line or text is too fine to cut cleanly." },
    ],
    related: ["holographic-glitter", "kiss-cut-sheets", "custom-design"],
  },
  {
    slug: "holographic-glitter",
    name: "Holographic and glitter",
    short: "Foil that shifts colour as it moves, and glitter that catches every light.",
    h1: ["Holographic", "stickers."],
    lede: "Holographic foil stickers that change colour as they move, and glitter stickers that sparkle in every light. Cut to your shape, with a free proof before we print.",
    description:
      "Custom holographic and glitter stickers, cut to your shape. Foil that changes colour as it moves and glitter that sparkles, with a free proof before we print.",
    facts: ["Free proof before print", "From 25 stickers", "Ships in 2–4 business days"],
    quote: { product: "stickers", shape: "die-cut", finish: "holo" },
    hero: {
      kind: "collage",
      art: [
        at(ART["new-burst"], "Sample glitter sticker: New flavour starburst", 78, 70, 32, 12),
        at(ART.approved, "Sample sticker: proof approved seal", 20, 24, 26, -10),
        at(ART["label-bros"], "Sample holographic sticker: Label Bros", 50, 46, 76, -5),
      ],
    },
    overview: {
      title: "How holographic and glitter stickers work",
      paras: [
        "A holographic sticker is printed on a mirror-like foil that splits light into colours, so it shifts through the rainbow as you tilt it. We print your artwork on top of the foil, and wherever we leave out ink, the foil shines through.",
        "Glitter stickers use a film full of tiny facets that each catch the light on their own. Both are cut to your shape, and you choose which parts of the design shine on your proof.",
      ],
      good: ["Brand drops and limited editions", "Merch that stands out", "Sticker packs", "Gift and event stickers"],
    },
    layers: [
      { name: "Laminate", body: "A clear top layer over the print." },
      { name: "Your artwork", body: "Printed over the foil. Where there is no ink, the foil shows through." },
      { name: "Holographic or glitter film", body: "The shine itself." },
      { name: "Adhesive", body: "On the back, ready to stick: permanent as standard." },
      { name: "Backing", body: "The paper it peels from." },
    ],
    finishes: [
      { name: "Holographic", body: "Turns every colour of the rainbow as the light moves.", look: "holo", art: ART["label-bros"] },
      { name: "Glitter", body: "Points of light that sparkle as you move it.", look: "glitter", art: ART["new-burst"] },
    ],
    uses: [
      { title: "Brand drops", body: "A logo sticker that people tilt to look at.", art: ART["label-bros"], rot: -4 },
      { title: "Limited editions", body: "Mark the special one.", art: ART["new-burst"], rot: 6 },
      { title: "Seals and badges", body: "A mark that stands out on the box.", art: ART.approved, rot: -6 },
    ],
    panel: {
      title: "Sticker Facts",
      rows: [
        ["Material", "Holographic or glitter film"],
        ["Finish", "Clear laminate"],
        ["Shape", "Cut to your outline"],
        ["Sizes", "1 to 24 inches"],
        ["Quantity", "From 25"],
        ["Proof", "Free, before we print"],
        ["Turnaround", "2–4 business days after proof approval"],
      ],
      foot: "Prices depend on size, quantity and finish. See yours as you order.",
    },
    faqs: [
      { q: "How does the foil show through?", a: "We print your artwork on top of the foil. Anywhere we leave out ink, the foil shines through, so you choose which parts of the design shine." },
      { q: "Can part of the design be holographic?", a: "Yes. Tell us which parts should shine and we set that up in the file. You see it on your proof." },
      { q: "Holographic or glitter?", a: "Holographic shifts through the rainbow as it moves. Glitter sparkles in points of light. Pick either in the builder and see it on your proof." },
      { q: "Does the glitter come off?", a: "No. The glitter film is sealed under a clear laminate that also screens out UV light, so it stays put and keeps its sparkle outdoors." },
    ],
    related: ["die-cut-stickers", "kiss-cut-sheets", "packaging-seals"],
  },
  {
    slug: "kiss-cut-sheets",
    name: "Kiss-cut sheets",
    short: "Several stickers on one backing sheet, each one peels off on its own.",
    h1: ["Kiss-cut", "sticker sheets."],
    lede: "Several stickers on one backing sheet, cut through the sticker but not through the backing, so each one peels off on its own. Sticker packs, planners and giveaways on one sheet.",
    description:
      "Custom kiss-cut sticker sheets: several stickers on one backing sheet, each one peels off on its own. Free proof before we print.",
    facts: ["Free proof before print", "From 25 sheets", "Ships in 2–4 business days"],
    quote: { product: "stickers", shape: "rectangle" },
    hero: {
      kind: "sheet",
      art: [
        at(ART["fire-escape"], "Sample sticker on a kiss-cut sheet: Fire Escape hot sauce", 30, 22, 38, -7),
        at(ART.beeline, "Sample sticker on a kiss-cut sheet: Beeline honey", 74, 22, 32, 6),
        at(ART.fresh, "Sample sticker on a kiss-cut sheet: Fresh! lettering", 50, 51, 70, -3),
        at(ART["night-shift"], "Sample sticker on a kiss-cut sheet: Night Shift coffee", 25, 80, 25, -5),
        at(ART["thank-you"], "Sample sticker on a kiss-cut sheet: thank-you seal", 70, 80, 36, 7),
      ],
    },
    overview: {
      title: "What is a kiss-cut sheet?",
      paras: [
        "On a kiss-cut sheet the blade cuts through each sticker but stops at the backing, so the stickers stay on one sheet until you peel them off one at a time. It is the way most sticker packs and planner stickers are made.",
        "A sheet can mix any designs, shapes and sizes. Send your artwork and we lay the sheet out for you on the proof.",
      ],
      good: ["Sticker packs to sell", "Planner and journal stickers", "Giveaways and inserts", "Kids' and event packs"],
    },
    layers: [
      { name: "Laminate", body: "A clear top layer, gloss or matte." },
      { name: "Your artwork", body: "Every sticker on the sheet, printed at once." },
      { name: "Vinyl, cut through", body: "The blade cuts right through each sticker..." },
      { name: "Adhesive", body: "On the back of every sticker." },
      { name: "Backing sheet, not cut", body: "...but stops at the backing, so the sheet stays in one piece." },
    ],
    finishes: [
      { name: "Gloss", body: "Bright colour and a shine that catches the light.", look: "gloss", art: ART.fresh },
      { name: "Matte", body: "Soft, smooth and easy to write on.", look: "matte", art: ART.fresh },
    ],
    uses: [
      { title: "Sticker packs", body: "A set of designs that sell as one.", art: ART["new-burst"], rot: -5 },
      { title: "Planners and kits", body: "Small stickers people use one at a time.", art: ART.approved, rot: 4 },
      { title: "Giveaways", body: "Hand out a whole sheet, not just one.", art: ART.fresh, rot: -3 },
      { title: "Product inserts", body: "Slip a sheet in with every order.", art: ART["thank-you"], rot: 6 },
    ],
    panel: {
      title: "Sticker Facts",
      rows: [
        ["Material", "White vinyl on a backing sheet"],
        ["Finish", "Gloss or matte laminate"],
        ["Cut", "Through the sticker, not the sheet"],
        ["Sheet sizes", "3 × 3 in up to 36 × 24 in"],
        ["Quantity", "From 25 sheets"],
        ["Proof", "Free, before we print"],
        ["Turnaround", "2–4 business days after proof approval"],
      ],
      foot: "Prices depend on sheet size, quantity and finish. See yours as you order.",
    },
    faqs: [
      { q: "What is kiss-cut?", a: "The blade cuts through the sticker but not through the backing. Each sticker peels off on its own while the sheet stays in one piece." },
      { q: "How many stickers fit on a sheet?", a: "As many as fit your sheet size. Send your designs and we lay them out for you on the proof." },
      { q: "How big can a sheet be?", a: "Any size from 3 × 3 inches up to 36 × 24 inches. Keep each sticker at least 1 inch across and leave a quarter inch between designs; we lay the sheet out for you on the proof." },
      { q: "Can every sticker be different?", a: "Yes. A sheet can mix any designs and shapes." },
    ],
    related: ["die-cut-stickers", "holographic-glitter", "custom-design"],
  },
  {
    slug: "roll-labels",
    name: "Roll labels",
    short: "Product labels on a roll, ready to apply by hand or machine.",
    h1: ["Roll", "labels."],
    lede: "Custom product labels on a roll, ready to put on by hand or on a labelling machine. Paper or vinyl, any shape, with a free proof before we print.",
    description:
      "Custom roll labels for products: paper or vinyl, any shape, wound on a roll for hand or machine application. Free proof before we print.",
    facts: ["Free proof before print", "From 25 labels", "Wound for hand or machine use"],
    quote: { product: "labels", shape: "rectangle" },
    hero: {
      kind: "strip",
      art: [
        at(LABELS["coffee-label"], "Sample roll label: Night Shift coffee bag label", 19, 50, 16, -2),
        at(LABELS["jam-label"], "Sample roll label: Sunday Jam Co. jar label", 50, 50, 28, 1),
        at(LABELS["candle-label"], "Sample roll label: Ember & Oak candle label", 81, 50, 27, -2),
      ],
    },
    overview: {
      title: "Labels on a roll, for every product",
      paras: [
        "Roll labels come wound on a core, one after another on a strip of liner. They are quick to peel by hand, and the rolls can be wound to fit a labelling machine when you are putting labels on hundreds of jars, bottles or bags.",
        "Choose paper for a natural feel on dry goods, or white vinyl and clear film for products that meet water, oil or the fridge.",
      ],
      good: ["Jars, bottles and cans", "Coffee and food bags", "Candles and cosmetics", "Drinks and wrap-around labels"],
    },
    layers: [
      { name: "Varnish or laminate", body: "A clear coat, gloss or matte." },
      { name: "Your artwork", body: "Printed in full colour." },
      { name: "Paper or film", body: "The label stock: paper, white vinyl or clear film." },
      { name: "Adhesive", body: "Chosen for your container: permanent as standard, removable if you ask." },
      { name: "Liner", body: "The strip the labels ride on, wound on a core." },
    ],
    finishes: [
      { name: "Paper", body: "A natural, uncoated or matte feel for dry goods.", look: "paper", art: LABELS["jam-label"] },
      { name: "Vinyl", body: "Waterproof, so it stands up to water, oil and the fridge.", look: "vinyl", art: LABELS["jam-label"] },
    ],
    uses: [
      { title: "Jars and bottles", body: "Labels that fit the curve of the container.", art: LABELS["jam-label"], rot: -4 },
      { title: "Coffee and food bags", body: "On the bag, and on the shelf.", art: LABELS["coffee-label"], rot: 5 },
      { title: "Candles and cosmetics", body: "Small labels with fine type.", art: LABELS["candle-label"], rot: -3 },
      { title: "Drinks", body: "Wrap-around labels for cans and bottles.", art: LABELS["kombucha-label"], rot: 4 },
    ],
    panel: {
      title: "Label Facts",
      rows: [
        ["Stock", "Paper, white vinyl or clear film"],
        ["Finish", "Gloss or matte"],
        ["Shape", "Any shape"],
        ["Sizes", "1 to 24 inches"],
        ["Rolls", "Wound to fit your machine"],
        ["Quantity", "From 25"],
        ["Proof", "Free, before we print"],
      ],
      foot: "Prices depend on size, stock and quantity. See yours as you order.",
    },
    faqs: [
      { q: "Will the rolls fit my labelling machine?", a: "Tell us your machine's core size and wind direction when you order, and we wind the rolls to match." },
      { q: "Paper or vinyl?", a: "Paper suits dry products and a natural feel. Vinyl is waterproof, so it stands up better to water, oil and the fridge." },
      { q: "Can I put them on by hand?", a: "Yes. Rolls are easy to peel from one label at a time." },
      { q: "Can I order several flavours at once?", a: "Yes. Add each design to your order and leave a note for each one; you get a proof for every design before anything prints." },
    ],
    related: ["packaging-seals", "kiss-cut-sheets", "custom-design"],
  },
  {
    slug: "packaging-seals",
    name: "Packaging seals",
    short: "Seals for boxes, bags, mailers and tissue, with your brand on top.",
    h1: ["Packaging", "seals."],
    lede: "Custom packaging seals and stickers that close boxes, bags, mailers and tissue paper, with your brand on top. Kraft, matte or gloss, with a free proof before we print.",
    description:
      "Custom packaging seals and stickers for boxes, bags, mailers and tissue paper. Kraft, matte or gloss, with a free proof before we print.",
    facts: ["Free proof before print", "From 10 seals", "Ships in 2–4 business days"],
    quote: { product: "stickers", shape: "circle" },
    hero: {
      kind: "seal",
      art: [at(ART["thank-you"], "Sample kraft packaging seal: thank you for shopping small", 50, 40, 44, -8)],
    },
    overview: {
      title: "Close the box with your brand",
      paras: [
        "A packaging seal is the sticker that keeps the box, bag or tissue paper shut, and the first thing your customer sees when the parcel arrives. Round seals are the classic, but a seal can be square, an oval or cut to your logo.",
        "Kraft paper gives a natural, handmade look and takes a pen well. Matte and gloss suit a bolder, brighter brand.",
      ],
      good: ["Shipping boxes and mailers", "Tissue paper and gift wrap", "Coffee and food bags", "Jar lids and takeaway bags"],
    },
    layers: [
      { name: "Your artwork", body: "Printed straight onto the paper." },
      { name: "Kraft paper", body: "Natural brown paper, with its fibres showing. Or matte or gloss stock." },
      { name: "Adhesive", body: "On the back: permanent, made to stay put on card, paper and mailers." },
      { name: "Backing", body: "The paper it peels from." },
    ],
    finishes: [
      { name: "Kraft", body: "Natural brown paper with its fibres showing.", look: "kraft", art: ART["thank-you"] },
      { name: "Gloss", body: "Bright colour for a bold brand.", look: "gloss", art: ART.approved },
    ],
    uses: [
      { title: "Boxes and mailers", body: "The seal that keeps it shut, with your brand on it.", art: ART["thank-you"], rot: -5 },
      { title: "Tissue paper", body: "Close the wrap inside the box.", art: ART.approved, rot: 5 },
      { title: "Jars and lids", body: "Seal the lid of every jar.", art: ART.beeline, rot: -3 },
      { title: "Gift wrap", body: "A finishing touch on every parcel.", art: ART["new-burst"], rot: 6 },
    ],
    panel: {
      title: "Sticker Facts",
      rows: [
        ["Material", "Kraft, matte or gloss paper"],
        ["Shape", "Circle, square or your outline"],
        ["Sizes", "1 to 24 inches"],
        ["Quantity", "From 10"],
        ["Proof", "Free, before we print"],
        ["Turnaround", "2–4 business days after proof approval"],
      ],
      foot: "Prices depend on size, quantity and material. See yours as you order.",
    },
    faqs: [
      { q: "Will they hold a box shut?", a: "Yes. Seals use a permanent adhesive made to stay put on card, paper and plastic mailers. For heavy boxes, use a bigger seal or two." },
      { q: "How do they come?", a: "Cut one by one, ready to peel. Kiss-cut sheets are available too, if you would rather have several on a sheet." },
      { q: "Can I write on them?", a: "Kraft and matte paper take a pen well. Gloss is harder to write on." },
    ],
    related: ["roll-labels", "die-cut-stickers", "custom-design"],
  },
  {
    slug: "custom-design",
    name: "Custom design",
    short: "No artwork? Our designers draw it, cut line and all.",
    h1: ["Sticker and", "label design."],
    lede: "No artwork? Send a sketch, a photo or a few words and our designers draw your sticker or label, cut line and all. We email a proof to approve and call you if anything needs changing.",
    description:
      "Custom sticker and label design: send a sketch, a photo or an idea and our designers make print-ready artwork, cut line and all. Free proof before we print.",
    facts: ["Free proof before print", "We call to talk through changes", "Design billed separately from printing"],
    quote: { product: "stickers", shape: "die-cut", artwork: "design" },
    hero: {
      kind: "ink",
      art: [
        at(SKETCH, "A pencil sketch of the Desert Bloom cactus sticker", 50, 50, 46, -3),
        at(BLOOM, "The finished Desert Bloom sticker, drawn from the sketch", 50, 50, 46, -3),
      ],
    },
    overview: {
      title: "From an idea to print-ready artwork",
      paras: [
        "You do not need a finished file to order. Send whatever shows the idea, a pencil sketch, a photo of your product, an existing logo or just a few words, and our designers turn it into artwork that is ready to print.",
        "We draw the cut line round it, set the colours and sizes, and send you a free proof. Ask for changes until it is right.",
      ],
      good: ["A sketch on paper", "A logo that needs a sticker version", "Product labels with your details", "Just an idea and a few words"],
    },
    layers: [
      { name: "Your sketch or idea", body: "Where it starts: a drawing, a photo or a few words." },
      { name: "Linework", body: "Traced and cleaned up, drawn as vectors so it prints sharp." },
      { name: "Colour", body: "Your colours, or ones we suggest." },
      { name: "White border", body: "The edge round the art, so the cut never clips it." },
      { name: "Cut line", body: "Where the blade goes, traced round the finished art." },
    ],
    finishes: [
      { name: "Your sketch", body: "Where your artwork starts.", look: "paper", art: SKETCH },
      { name: "Print-ready", body: "The finished artwork, cut line and all.", look: "gloss", art: BLOOM },
    ],
    uses: [
      { title: "A sketch on paper", body: "We trace it, clean it up and colour it.", art: SKETCH, rot: -4 },
      { title: "A logo you already have", body: "We make it sticker-ready, with a cut line.", art: ART["label-bros"], rot: 4 },
      { title: "Just a few words", body: "Tell us the idea and we draw it.", art: BLOOM, rot: -3 },
      { title: "A label for your product", body: "Layout and type set for your packaging.", art: LABELS["jam-label"], rot: 5 },
    ],
    panel: {
      title: "Design Facts",
      rows: [
        ["You send", "A sketch, a photo or a few words"],
        ["You get", "Print-ready artwork and its cut line"],
        ["Changes", "Until you are happy with it"],
        ["Fee", "Billed separately from printing"],
        ["Time", "First proof by email, then your changes"],
        ["Your files", "Kept on file for reorders"],
        ["Proof", "Free, before we print"],
      ],
      foot: "Start with your price, and tell us the idea when you order.",
    },
    faqs: [
      { q: "What should I send?", a: "Anything that shows the idea: a sketch, a photo, a logo, a few words. The more you tell us, the closer the first proof." },
      { q: "What if I do not like the first version?", a: "Ask for changes on the proof, as many times as you need. Nothing prints until you approve it." },
      { q: "Is design work charged?", a: "Yes. Design is billed separately from printing, and once work has started it is billed even if the design is not printed in the end." },
      { q: "Can you work from my existing logo?", a: "Yes. We make it sticker-ready and draw the cut line round it." },
    ],
    related: ["die-cut-stickers", "kiss-cut-sheets", "roll-labels"],
  },
];

export const serviceBySlug = (slug: ServiceSlug) => SERVICES.find((s) => s.slug === slug)!;
export const serviceHref = (slug: ServiceSlug) => `/services/${slug}`;
/** The artwork that stands for a service in lists and cards. */
export const serviceArt = (s: Service) => s.hero.art[s.hero.art.length - 1];
