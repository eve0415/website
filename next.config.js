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
    experimental: {
        runtime: 'experimental-edge',
        images: {
            allowFutureImage: true,
            unoptimized: true,
        },
        browsersListForSwc: true,
        legacyBrowsers: false
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
