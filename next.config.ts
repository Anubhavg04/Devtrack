import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    staleTimes:{
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
