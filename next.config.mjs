const nextConfig = {
    // Configure allowed image domains for next/image component
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**',
            },
        ],
    },

    // Performance optimizations
    compiler: {
        // Remove console.logs in production
        removeConsole: process.env.NODE_ENV === 'production',
    },

    // Reduce bundle size
    experimental: {
        optimizePackageImports: ['react-icons', 'lucide-react'],
    },

    // Enable compression
    compress: true,

    // Optimize images
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**',
            },
        ],
        // Add image optimization
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
    },

    // Headers for better caching
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, s-maxage=60, stale-while-revalidate=300',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;