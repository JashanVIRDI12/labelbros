import type { Metadata } from "next";
import { BRAND } from "./site";

/*
 * One helper for every page's metadata: title, description, its canonical address, and the
 * Open Graph and Twitter cards (the shared card image is app/opengraph-image.jpg unless a page
 * passes its own). Paths are relative; the root layout's metadataBase makes them absolute.
 */
export function pageMeta({
  title,
  description,
  path,
  image,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  const images = image ? [{ url: image }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: BRAND, type: "website", locale: "en_CA", images },
    twitter: { card: "summary_large_image", title, description, images },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}
