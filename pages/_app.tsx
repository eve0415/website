import { createTheme, CssBaseline, responsiveFontSizes, styled, ThemeProvider } from '@mui/material';
import { motion } from 'framer-motion';
import { NextSeo } from 'next-seo';
import type { AppProps } from 'next/app';
import Head from 'next/head';

const Root = styled(motion.div)({
    minHeight: '100vh',
    overflow: 'hidden',
});

export default function Website({ Component, pageProps }: AppProps) {
    return (
        <ThemeProvider
            theme={responsiveFontSizes(
                createTheme({
                    typography: {
                        fontFamily: ['Roboto', 'Noto Sans JP', 'sans-serif'].join(','),
                    },
                    components: {
                        MuiCssBaseline: {
                            styleOverrides: `
                                ::-webkit-scrollbar {
                                    height: 10px;
                                    width: 10px;
                                },
                                ::-webkit-scrollbar-thumb {
                                    background-color: #c7dfde;
                                    border-radius: 10px;
                                }
                            `,
                        },
                    },
                })
            )}
        >
            <Head>
                <meta name='viewport' content='initial-scale=1, width=device-width' />
            </Head>

            <NextSeo
                title='eve0415'
                description='eve0415 のホームページ'
                canonical='https://eve0415.net'
                openGraph={{
                    url: 'https://eve0415.net',
                    title: 'eve0415',
                    description: 'eve0415 のホームページ',
                    images: [
                        {
                            url: 'https://eve0415.net/images/bannar.jpg',
                            width: 1200,
                            height: 630,
                            alt: 'My Cat',
                            type: 'image/jpeg',
                        },
                        {
                            url: 'https://eve0415.net/icon-256x256.png',
                            width: 256,
                            height: 256,
                            alt: 'My Profile',
                            type: 'image/png',
                        },
                    ],
                }}
                twitter={{
                    handle: '@eveevekun',
                    site: '@eveevekun',
                    cardType: 'summary',
                }}
            />

            <CssBaseline />

            <Root sx={{ minHeight: '100dvh' }}>
                <Component {...pageProps} />
            </Root>
        </ThemeProvider>
    );
}
