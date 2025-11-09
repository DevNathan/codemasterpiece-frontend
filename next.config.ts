import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  cacheComponents: true,

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/u/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "10100",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.codemasterpiece.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.codemasterpiece.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
