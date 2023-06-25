// @ts-check

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  output: 'export',
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  experimental: {
    typedRoutes: true,
  },
};
