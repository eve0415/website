import { createTheme, CssBaseline, responsiveFontSizes, styled, ThemeProvider } from '@mui/material';
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
                <meta name='viewport' content='initial-scale=1, width=device-width' />
                <title>eve0415</title>
            </Head>

            <CssBaseline />

            <Root sx={{ minHeight: '100dvh' }}>
                <Component {...pageProps} />
            </Root>
        </ThemeProvider>
    );
}
