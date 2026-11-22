import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Do not infer the workspace root from lockfiles in parent directories.
    root: __dirname,
  },
  experimental: {
    // OneDrive can time out while opening Turbopack's persistent database.
    // Keep development compilation in memory; normal build output stays on disk.
    turbopackFileSystemCacheForDev: false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()",
          },
          // TODO: Add a strict Content-Security-Policy once asset requirements are audited.
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
};

export default nextConfig;
