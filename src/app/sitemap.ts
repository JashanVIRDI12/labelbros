import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";
import { BASE_URL } from "@/lib/site";

/** Every public page: the shop's pages first, then each product, then the help and policy pages. */
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number) => ({ url: `${BASE_URL}${path}`, priority });
  return [
    page("/", 1),
    page("/labels", 0.9),
    page("/business", 0.9),
    page("/stickers", 0.7),
    page("/shop", 0.7),
    ...PRODUCTS.map((p) => page(`/shop/${p.slug}`, p.range === "labels" ? 0.8 : 0.6)),
    page("/how-it-works", 0.6),
    page("/contact", 0.5),
    page("/about", 0.4),
    page("/track", 0.3),
    ...["/shipping", "/reprints", "/privacy", "/terms"].map((p) => page(p, 0.2)),
  ];
}
