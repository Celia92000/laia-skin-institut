import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'laia-skin-institut.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'laia-skin-institut.vercel.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        pathname: '/**',
      }
    ],
    formats: ['image/avif', 'image/webp'],
  },
  trailingSlash: true,
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
