/*
 * Sizes, shared by the pricing builder and the size cells on the stickers and labels pages, so a
 * size picked on a page arrives in the builder unchanged. Prices for them are in src/lib/facts.ts.
 */

export const SIZES = [2, 3, 4, 5]; // inches, the longest side
/** Custom sizes, in inches (1 to 24, as Sticker Bros offers; see src/lib/facts.ts). */
export const CUSTOM = { min: 1, max: 24, step: 0.25 };
export const clampSize = (n: number) => Math.min(CUSTOM.max, Math.max(CUSTOM.min, n));

/** Height / width of the house sample sticker, "Liftoff" (553 × 800 px), the builder's die-cut. */
export const DIE_RATIO = 800 / 553;
/** Height / width of a preset rectangle in the builder. */
export const RECT_RATIO = 2 / 3;

/** "3", "2.5", "4.33": inches without trailing zeros. */
export const inches = (n: number) => String(Math.round(n * 100) / 100);
