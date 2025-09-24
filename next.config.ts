import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    domains: ['localhost', 'laia-skin-institut.com', 'laia-skin-institut.vercel.app'],
    formats: ['image/avif', 'image/webp'],
  },
  trailingSlash: true,
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
