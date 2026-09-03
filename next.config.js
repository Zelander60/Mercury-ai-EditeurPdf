/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  outputFileTracingIncludes: {
    '/api/documents/[id]/export': ['./src/lib/doc-engine/fonts/**/*'],
    '/api/generate': ['./src/lib/doc-engine/fonts/**/*'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yivvhfzmwrwckonntcec.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
