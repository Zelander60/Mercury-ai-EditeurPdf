/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['yivvhfzmwrwckonntcec.supabase.co'],
  },
};

module.exports = nextConfig;
