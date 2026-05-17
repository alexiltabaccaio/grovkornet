import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@grovkornet/shared"],
  reactStrictMode: true,
};

export default nextConfig;
