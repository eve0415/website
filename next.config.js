// @ts-check

const { DefinePlugin } = require('webpack');
const { resolve } = require('path');

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
    images: {
        unoptimized: true
    },
    experimental: {
        // runtime: 'experimental-edge',
        browsersListForSwc: true,
        legacyBrowsers: false
    },
    webpack: (config, { dev }) => {
        if (!dev) {
            config.plugins.push(
                new DefinePlugin({
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
