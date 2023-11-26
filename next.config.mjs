// @ts-check

import { next } from 'million/compiler';

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  experimental: {
    typedRoutes: true,
  },
};

export default next(config, { auto: { rsc: true } });
