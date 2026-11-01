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

// Load by the primary family only. next/font lists a metric-matched "Fallback" face built
// from a local font (Arial); where that font is missing (Linux, many Android phones) the face
// fails at once and would reject the whole load before the real face has arrived.
const primary = (family: string) => family.split(",")[0].trim();

function specs(f: Fonts) {
  const sans = primary(f.sans);
  return [
    `900 40px ${sans}`,
    `800 40px ${sans}`,
    `700 40px ${sans}`,
    `600 40px ${sans}`,
    `400 40px ${primary(f.anton)}`,
    `600 40px ${primary(f.serif)}`,
    `400 40px ${primary(f.script)}`,
  ];
}

let pending: Promise<void> | null = null;

/** Start downloading the sticker faces now (safe to call more than once). */
export function warmFonts() {
  if (!pending) {
    const list = specs(stickerFonts());
    const loadAll = () => Promise.all(list.map((s) => document.fonts.load(s).catch(() => [] as FontFace[])));
    pending = loadAll().then(async (found) => {
      // no face matched yet: the font CSS is not in the document yet (dev CSS injection)
      if (found.some((faces) => faces.length === 0)) {
        await document.fonts.ready;
        await loadAll();
      }
    });
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
