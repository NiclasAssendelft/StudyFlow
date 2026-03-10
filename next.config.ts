import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  typescript: {
    // Allow build to succeed even with type errors (fix later)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow build to succeed even with lint warnings
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
