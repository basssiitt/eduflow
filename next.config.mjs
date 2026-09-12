/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['*.e2b.app'],
  images: {
    unoptimized: true,
  },
  ...(process.env.NODE_ENV === 'development' && process.env.ENABLE_ONLOOK === 'true'
    ? {
        experimental: {
          swcPlugins: [['@onlook/nextjs', { root: '.' }]],
        },
      }
    : {}),
}

export default nextConfig
