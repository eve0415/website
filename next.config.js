// @ts-check

const { DefinePlugin } = require('webpack');

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
        swcFileReading: true,
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
        return config;
    }
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
