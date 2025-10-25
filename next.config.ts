import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: ["res.cloudinary.com"],
  },
  
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'recharts',
    ],
  },
  
  // Webpack config for Solana in browser
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Externalize heavy Solana packages in server builds
    config.externals = config.externals || [];
    config.externals.push({
      '@solana/web3.js': 'commonjs @solana/web3.js',
    });
    
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
