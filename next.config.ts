import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**', // Adjust this to match your Supabase storage URL later for better security
            },
            {
                protocol: 'http',
                hostname: 'localhost',
            }
        ],
    },
};

export default nextConfig;
