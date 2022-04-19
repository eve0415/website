import { createTheme, CssBaseline, responsiveFontSizes, styled, ThemeProvider } from '@mui/material';
import { m } from 'framer-motion';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useState } from 'react';
import { Navbar } from '../components';

const Root = styled(m.div)({
    minHeight: '100vh',
    overflow: 'hidden',
    backgroundColor: '#E5FCFB',
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
                <meta name='viewport' content='initial-scale=1, width=device-width' />
            </Head>

            <CssBaseline enableColorScheme />

            <Root sx={{ minHeight: '100dvh' }}>
                <Component {...pageProps} />
                <Navbar isOpen={open} open={() => setOpen(true)} close={() => setOpen(false)} />
            </Root>
        </ThemeProvider>
    );
}
