/** Faces used inside the sticker artwork (canvas), read from the next/font CSS variables. */
export type Fonts = { sans: string; anton: string; serif: string; script: string };

export function stickerFonts(): Fonts {
  const css = getComputedStyle(document.documentElement);
  const read = (v: string, fb: string) => css.getPropertyValue(v).trim() || fb;
  return {
    sans: read("--font-archivo", "Arial"),
    anton: read("--font-anton", "Impact"),
    serif: read("--font-fraunces", "Georgia"),
    script: read("--font-yellowtail", "cursive"),
  };
}

function specs(f: Fonts) {
  return [
    `900 40px ${f.sans}`,
    `800 40px ${f.sans}`,
    `700 40px ${f.sans}`,
    `600 40px ${f.sans}`,
    `400 40px ${f.anton}`,
    `600 40px ${f.serif}`,
    `400 40px ${f.script}`,
  ];
}

let pending: Promise<void> | null = null;

/** Start downloading the sticker faces now (safe to call more than once). */
export function warmFonts() {
  if (!pending) {
    const f = stickerFonts();
    pending = Promise.all(specs(f).map((s) => document.fonts.load(s).catch(() => null))).then(() => undefined);
  }
  return pending;
}

/**
 * Wait for the sticker faces, but not forever. `complete` says whether they arrived in time;
 * if not, `ready` resolves when they do, so the art can be redrawn.
 */
export async function loadFonts(timeoutMs = 2500) {
  const fonts = stickerFonts();
  const ready = warmFonts();
  let complete = false;
  await Promise.race([ready.then(() => (complete = true)), new Promise((r) => setTimeout(r, timeoutMs))]);
  return { fonts, complete, ready };
}
