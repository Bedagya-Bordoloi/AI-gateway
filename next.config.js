/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This allows the frontend to serve as a proxy if you decide to host 
  // both on the same domain in the future.
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:3001/v1/:path*',
      },
    ];
  },
  // Ensure we can handle SVG icons and large data visualizations smoothly
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;