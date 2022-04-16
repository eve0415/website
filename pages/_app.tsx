import { createTheme, CssBaseline, responsiveFontSizes, styled, ThemeProvider } from '@mui/material';
import { m } from 'framer-motion';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useState } from 'react';
import { Navbar } from '../components';

const Root = styled(m.div)({
    minHeight: '100vh',
    overflow: 'hidden',
});

export default function Website({ Component, pageProps }: AppProps) {
    const [open, setOpen] = useState(false);

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

            <Root sx={{ minHeight: '100dvh' }}>
                <Component {...pageProps} />{' '}
                <Navbar isOpen={open} open={() => setOpen(true)} close={() => setOpen(false)} />
            </Root>
        </ThemeProvider>
    );
}
