/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['*.e2b.app'],
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
