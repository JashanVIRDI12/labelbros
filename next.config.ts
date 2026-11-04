import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  devIndicators: false,
  partialPrefetching: true,
  images: {
    // 75 is the default; 62 is for hero images that are the largest paint on phones
    qualities: [62, 75],
  },
};

export default nextConfig;
