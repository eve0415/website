// @ts-check

const { DefinePlugin } = require('webpack');
const { resolve } = require('path');

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    reactStrictMode: true,
    compiler: {
        reactRemoveProperties: true,
        removeConsole: true,
        styledComponents: true,
        emotion: true
    },
    images: {
        loader: 'custom'
    },
    experimental: {
        adjustFontFallbacks: true,
        newNextLinkBehavior: true,
        legacyBrowsers: false,
        optimisticClientCache: true,
        // runtime: 'experimental-edge'
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
