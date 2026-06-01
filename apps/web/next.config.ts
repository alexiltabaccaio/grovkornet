import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@grovkornet/shared"],
  reactStrictMode: true,
  eslint: {
    // Vercel only installs dependencies of web/, so we ignore root eslint during Vercel build
    ignoreDuringBuilds: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
