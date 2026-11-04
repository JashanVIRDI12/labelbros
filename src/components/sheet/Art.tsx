/* eslint-disable @next/next/no-img-element -- pre-sized WebP artwork that page motion moves and masks; with `sizes` it goes through next/image */
import type { CSSProperties } from "react";
import Image from "next/image";

export type ArtFile = { src: string; w: number; h: number };

type Props = {
  art: ArtFile;
  className?: string;
  style?: CSSProperties;
  /** how wide it shows: given, the image is resized for the screen by Next's optimiser */
  sizes?: string;
} & { [data: `data-${string}`]: string | boolean | undefined };

/** One piece of sample artwork at its natural size (the box is reserved). Decorative. */
export function Art({ art, className = "", style, sizes, ...data }: Props) {
  if (sizes)
    return (
      <Image
        src={art.src}
        width={art.w}
        height={art.h}
        alt=""
        sizes={sizes}
        loading="lazy"
        draggable={false}
        className={`art ${className}`}
        style={style}
        {...data}
      />
    );
  return (
    <img
      src={art.src}
      width={art.w}
      height={art.h}
      alt=""
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`art ${className}`}
      style={style}
      {...data}
    />
  );
}
