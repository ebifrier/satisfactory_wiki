import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  env: {
    NEXT_TELEMETRY_DISABLED: "1",
    NEXT_PUBLIC_API_URL:
      process.env.NODE_ENV === "production"
        ? "https://backend.sf-jp-wikitool.com"
        : "http://localhost:5000",
  },
};

export default nextConfig;
