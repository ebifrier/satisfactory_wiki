import type { NextConfig } from "next";
const config = require(`./env/env.${process.env.APP_ENV || "development"}.js`);

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  env: {
    NEXT_TELEMETRY_DISABLED: "1",
    ...config,
  },
};

export default nextConfig;
