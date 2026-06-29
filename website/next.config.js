/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
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
