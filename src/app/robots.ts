import type { MetadataRoute } from "next";
import { BASE_URL, SITE_URL } from "@/lib/site";

/** Search engines: everything but the back office, the API, the cart, order pages and proofs. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/order/", "/cart", "/proof/"] },
    sitemap: `${SITE_URL || BASE_URL}/sitemap.xml`,
  };
}
