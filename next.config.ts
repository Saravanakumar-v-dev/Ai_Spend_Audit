import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ====== AGGRESSIVE PERFORMANCE OPTIMIZATION ====== */
  
  /* Compression & Response Time */
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false, // Disable source maps in production
  
  /* Experimental Performance Features */
  experimental: {
    optimizePackageImports: ["zod"],
    serverMinification: true,
  },

  /* Image Optimization - Ultra Aggressive */
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: false, // Disable SVG to reduce attack surface
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
  },

  /* Aggressive Caching Headers */
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
        {
          key: "Content-Security-Policy",
          value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.resend.com https://waljptefuiautfuhehyf.supabase.co;",
        },
        { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400" },
      ],
    },
    {
      source: "/static/:path*",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
  ],

  /* Redirects — no self-referencing redirects */
  redirects: async () => [],



  /* Turbopack Configuration */
  turbopack: {
    resolveAlias: {
      "@": "./src",
    },
  },


};

export default nextConfig;
