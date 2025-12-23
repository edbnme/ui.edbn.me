import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance: Strict React mode for catching issues early
  reactStrictMode: true,

  // Performance: Enable experimental features for production
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: ["@phosphor-icons/react", "motion"],
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    // Reduce default quality for better performance (85 is visually lossless)
    qualities: [100, 85, 75],
    // Enable AVIF format for modern browsers (smaller than WebP)
    formats: ["image/avif", "image/webp"],
    // Minimize layout shift
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Compression
  compress: true,

  // Security headers
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
      ],
    },
    {
      // Cache static assets aggressively
      source: "/r/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      // Cache fonts
      source: "/:path*.woff2",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],

  // Logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
};

export default nextConfig;
