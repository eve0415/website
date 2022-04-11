/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        loader: 'custom',
    },
};

export default nextConfig;
