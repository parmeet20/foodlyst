import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: ["res.cloudinary.com"], // ✅ add picsum.photos here
  },
  /* config options here */
};

export default nextConfig;
