/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Allow external images for cached previews / screenshots
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Enable React strict mode for catching issues early
  reactStrictMode: true,
};

module.exports = nextConfig;
