import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '*.supabase.co' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'via.placeholder.com' },
            { protocol: 'https', hostname: 'www.apple.com' },
            { protocol: 'https', hostname: 'fdn2.gsmarena.com' },
            { protocol: 'https', hostname: 'store.storeimages.cdn-apple.com' },
            { protocol: 'https', hostname: 'f.nooncdn.com' },
        ],
    },
    experimental: { serverActions: { allowedOrigins: ['*'] } }
}
export default nextConfig
