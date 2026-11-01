import { DESIGNS, stickerSize } from "@/components/hero/engine/art";

/** Width / height of a rendered sample sticker, for reserving its box before it is drawn.
 * Server-side only: keeps the artwork code out of the page bundle. */
export function stickerRatio(id: string) {
  const design = DESIGNS.find((d) => d.id === id);
  if (!design) return 1;
  const { width, height } = stickerSize(design);
  return width / height;
}

export function stickerName(id: string) {
  return DESIGNS.find((d) => d.id === id)?.name ?? id;
}
