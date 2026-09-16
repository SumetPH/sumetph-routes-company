import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/routes/company",
        destination: `${process.env.API_BASE_URL ?? "http://127.0.0.1:3001"}/api/routes/company`,
      },
    ];
  },
};

export default nextConfig;
