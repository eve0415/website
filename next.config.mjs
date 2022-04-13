/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
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
    experimental: {
        optimizeCss: true,
    }
};

export default nextConfig;
