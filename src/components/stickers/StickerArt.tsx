"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type Props = {
  id: string;
  /** width / height, from stickerRatio() on the server */
  ratio: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * One of the hero's sample stickers, drawn into a canvas when it gets near the screen.
 * The box is reserved from the start (aspect ratio), so drawing never moves the layout.
 * Decorative: the surrounding card or caption names what it shows.
 */
export function StickerArt({ id, ratio, className = "", style }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        import("./draw").then(({ drawSticker }) => {
          if (!cancelled) void drawSticker(canvas, id, () => cancelled);
        });
      },
      { rootMargin: "150% 0px" },
    );
    io.observe(canvas);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [id]);

  return (
    <canvas
      ref={ref}
      data-sticker={id}
      aria-hidden="true"
      className={`sticker-art ${className}`}
      style={{ aspectRatio: ratio, ...style }}
    />
  );
}
