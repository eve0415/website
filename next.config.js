// @ts-check

/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  experimental: {
    typedRoutes: true,
  },
};
