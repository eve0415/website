import { createTheme, CssBaseline, responsiveFontSizes, styled, ThemeProvider } from '@mui/material';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useState } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { Navbar } from '../components/navbar';
import '../public/global.css';

const Root = styled('main')({
    minHeight: '100vh',
    overflow: 'hidden',
    backgroundColor: '#E5FCFB',
});

export default function Website({ Component, pageProps, router }: AppProps) {
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
                <SwitchTransition mode='out-in'>
                    <CSSTransition key={router.pathname} classNames='page' timeout={300} unmountOnExit>
                        <Component {...pageProps} />
                    </CSSTransition>
                </SwitchTransition>
                <Navbar isOpen={open} open={() => setOpen(true)} close={() => setOpen(false)} />
            </Root>
        </ThemeProvider>
    );
}
