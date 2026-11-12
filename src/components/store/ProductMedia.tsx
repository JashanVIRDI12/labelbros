import Image from "next/image";
import type { Product } from "@/lib/products";

/** The same product photograph follows a label from the shelf to its buy page. */
export function ProductPhoto({ p, sizes = "(min-width: 1024px) 33vw, 50vw", priority = false, fit = "cover" }: { p: Product; sizes?: string; priority?: boolean; fit?: "cover" | "contain" }) {
  return <Image src={p.image.src} alt={p.image.alt} fill sizes={sizes} quality={priority ? 62 : 75} preload={priority} fetchPriority={priority ? "high" : undefined} style={{ objectFit: fit }} />;
}

/** Menus and cart lines already name the product, so their thumbnails are decorative. */
export function ProductThumb({ p, className = "" }: { p: Product; className?: string }) {
  return <Image className={`product-thumb ${className}`} src={p.image.thumb} width={256} height={256} sizes="64px" fetchPriority="low" alt="" />;
}
