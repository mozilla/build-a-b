import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'cookie',
            key: 'user_id',
            value: '(?<id>.*)',
          },
        ],
        destination: '/a/:id',
        permanent: false,
      },
      {
        source: '/a/:id',
        missing: [
          {
            type: 'cookie',
            key: 'user_id',
          },
        ],
        destination: '/',
        permanent: false,
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
