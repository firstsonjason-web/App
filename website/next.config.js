/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: '/privacy-policy.html',
        destination: '/privacy-policy/',
      },
      {
        source: '/features.html',
        destination: '/features/',
      },
      {
        source: '/about.html',
        destination: '/about/',
      },
      {
        source: '/support.html',
        destination: '/support/',
      },
      {
        source: '/index.html',
        destination: '/',
      },
    ];
  },
};

module.exports = nextConfig;
