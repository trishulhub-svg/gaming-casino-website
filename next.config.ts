import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  serverExternalPackages: ["@libsql/client", "@prisma/client"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    // Workaround for React 19 canary + Next 16 prerender bug
    // (useContext returns null during synthetic /_global-error prerender).
    // Exit prerender early instead of failing the build.
    prerenderEarlyExit: true,
  },
};

export default nextConfig;
