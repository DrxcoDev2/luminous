/** @type {import('next').NextConfig} */
const nextConfig = {
  // ❌ Removido 'output: export' para permitir Server Actions y SSR
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: true, // ✅ habilita Server Actions si estás usándolas
  },
};

module.exports = nextConfig;
