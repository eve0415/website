// @ts-check

const webpack = require('webpack');

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: false,
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
        return config;
    }
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
