/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    compiler: {
        styledComponents: true,
    },
    images: {
        loader: 'custom',
        formats: ['image/avif', 'image/webp'],
        domains: [
            'opengraph.githubassets.com',
            'raw.githubusercontent.com',
            'repository-images.githubusercontent.com',
            's3.amazonaws.com',
            'getsileo.app',
            'cdn.buymeacoffee.com',
            'cdn.ko-fi.com'
        ]
    },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
