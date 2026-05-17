import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@grovkornet/shared"],
  reactStrictMode: true,
  eslint: {
    // Vercel installa solo le dipendenze di web/, quindi ignoriamo l'eslint root durante la build di Vercel
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
