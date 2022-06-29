// @ts-check

const webpack = require('webpack');
const { resolve } = require('path');

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    compiler: {
        styledComponents: true,
        reactRemoveProperties: true,
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
    experimental: {
        runtime: 'experimental-edge',
    },
    webpack: (config, { dev }) => {
        if (!dev) {
            config.plugins.push(
                new webpack.DefinePlugin({
                    __REACT_DEVTOOLS_GLOBAL_HOOK__: '({ isDisabled: true })'
                })
            );
        }
        config.resolve.alias['react-is'] = resolve(__dirname, 'node_modules', 'react-is');
        return config;
    }
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
