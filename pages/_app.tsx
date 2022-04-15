import { createTheme, CssBaseline, NoSsr, responsiveFontSizes, styled, ThemeProvider } from '@mui/material';
import { motion } from 'framer-motion';
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
                <title>eve0415</title>
                <meta name='description' content='eve0415 のホームページ' />
                <meta name='twitter:card' content='summary' />
                <meta name='twitter:site' content='@eveevekun' />
                <meta name='twitter:creator' content='@eveevekun' />
                <meta property='og:title' content='eve0415' />
                <meta property='og:description' content='eve0415 のホームページ' />
                <meta property='og:url' content='https://eve0415.net' />
                <meta property='og:image' content='https://eve0415.net/icon-256x256.png' />
                <meta property='og:image:alt' content='My Profile' />
                <meta property='og:image:type' content='image/png' />
                <meta property='og:image:width' content='256' />
                <meta property='og:image:height' content='256' />
                <meta name='viewport' content='initial-scale=1, width=device-width' />
            </Head>

            <CssBaseline enableColorScheme />

            <NoSsr>
                <Root sx={{ minHeight: '100dvh' }}>
                    <Component {...pageProps} />
                </Root>
            </NoSsr>
        </ThemeProvider>
    );
}
