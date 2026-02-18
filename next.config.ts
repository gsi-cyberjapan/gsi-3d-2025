import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.BASE_PATH || undefined,
  assetPrefix: process.env.BASE_PATH || undefined,
  devIndicators: {
    position: "bottom-right",
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
