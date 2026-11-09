import type { NextConfig } from "next";

// Sent with every page: no framing by other sites, no type sniffing, HTTPS only, and the
// browser features the site never uses switched off.
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  devIndicators: false,
  partialPrefetching: true,
  poweredByHeader: false,
  // one self-contained server folder (.next/standalone) for cPanel's Node.js app; Vercel ignores it
  output: "standalone",
  images: {
    // 75 is the default; 62 is for hero images that are the largest paint on phones
    qualities: [62, 75],
  },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "private, no-store" }] },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
};

export default nextConfig;
