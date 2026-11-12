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
  // proofs are uploaded through an admin server action (up to MAX_UPLOAD_MB, 4 MB by default)
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  images: {
    formats: ["image/avif", "image/webp"],
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
  // the names people guess for the policy pages, and the pages the shop replaced (2026-11-11)
  async redirects() {
    const moved: [string, string][] = [
      ["/quote", "/labels"],
      ["/shop/build", "/shop/custom-labels"],
      ["/services", "/labels"],
      ["/services/roll-labels", "/shop/roll-labels"],
      ["/services/packaging-seals", "/shop/circle-labels"],
      ["/services/die-cut-stickers", "/shop/vinyl-stickers"],
      ["/shop/die-cut-stickers", "/shop/vinyl-stickers"],
      ["/shop/circle-stickers", "/shop/vinyl-stickers?shape=circle"],
      ["/shop/rectangle-stickers", "/shop/vinyl-stickers?shape=rounded"],
      ["/services/holographic-glitter", "/shop/holographic-stickers"],
      ["/services/kiss-cut-sheets", "/stickers"],
      ["/services/custom-design", "/how-it-works"],
      ["/shop/product-labels", "/shop/custom-labels"],
      ["/shop/embossed-labels", "/shop/custom-labels"],
      ["/shop/square-stickers", "/shop/vinyl-stickers?shape=square"],
      ["/shop/bumper-stickers", "/shop/vinyl-stickers?shape=rounded"],
      ["/shop/kiss-cut-stickers", "/stickers"],
      ["/shop/embossed-stickers", "/stickers"],
      ["/shop/chrome-stickers", "/stickers"],
      ["/shop/reflective-stickers", "/stickers"],
      ["/shop/qr-code-stickers", "/stickers"],
      ["/shop/100-4in-die-cut-stickers", "/stickers"],
      ["/shop/200-4in-custom-stickers", "/stickers"],
      ["/shop/50-2-5in-holographic-stickers", "/shop/holographic-stickers"],
    ];
    return [
      ...moved.map(([source, destination]) => ({ source, destination, permanent: true })),
      { source: "/refunds", destination: "/reprints", permanent: true },
      { source: "/returns", destination: "/reprints", permanent: true },
      { source: "/refund-policy", destination: "/reprints", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/about-us", destination: "/about", permanent: true },
    ];
  },
};

export default nextConfig;
