/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        loader: 'custom',
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 286, 300, 384, 600],
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

export default nextConfig;
