import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Search engines: everything but the back office, the API and the order pages. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/order/"] },
    ...(SITE_URL ? { sitemap: `${SITE_URL}/sitemap.xml` } : {}),
  };
}
