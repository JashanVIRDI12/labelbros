/*
 * A resized copy of a local image, from Next's image optimiser, for places a component cannot
 * use <Image>: CSS masks and backgrounds. `w` must be one of the optimiser's sizes (the defaults:
 * 16 to 384 for small images, 640 and up for screens).
 */
export const resized = (src: string, w: 256 | 384 | 640 | 750 = 384) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
