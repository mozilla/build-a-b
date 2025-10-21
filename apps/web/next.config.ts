import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oqqutatvbdlpumixjiwg.supabase.co',
        pathname: '/**',
      },
    ],
  },
  rewrites: async () => [
    {
      source: '/game',
      destination: '/assets/game/index.html',
    },
    {
      source: '/game/:path*',
      destination: '/assets/game/:path*',
    },
  ],
};

export default nextConfig;
