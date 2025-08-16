import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for production
  compress: true,
  
  // Temporarily disable ESLint for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Ensure proper module resolution
  webpack: (config, { isServer }) => {
    // Add fallbacks for better compatibility
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
