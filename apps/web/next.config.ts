import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Use a wildcard to catch sw.js reliably
        source: '/assets/game/:path*',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oqqutatvbdlpumixjiwg.supabase.co',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
