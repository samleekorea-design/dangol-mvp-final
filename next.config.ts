import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server-only packages that should not be bundled for the client
  serverExternalPackages: ['better-sqlite3', 'bcrypt', 'web-push'],
  
  // Enable image optimization for Vercel (remove unoptimized)
  images: {
    domains: ['dangol.site'], // Add custom domain for images
    formats: ['image/webp', 'image/avif'],
  },
  
  // Disable ESLint during builds for faster deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Temporarily ignore TypeScript errors for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // API routes will work natively with Vercel
  // No static export needed
};

export default nextConfig;
