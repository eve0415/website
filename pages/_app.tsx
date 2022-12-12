import { MantineProvider } from '@mantine/core';
import { Roboto } from '@next/font/google';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useState } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { Navbar } from '../components/navbar';

import '../public/global.css';

const fonts = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
    fallback: ['Noto Sans JP', 'sans-serif'],
});

export default function Website({ Component, pageProps, router }: AppProps) {
    const [open, setOpen] = useState(false);

    return (
        <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            withCSSVariables
            theme={{
                respectReducedMotion: true,
                fontFamily: fonts.style.fontFamily,
                headings: {
                    fontFamily: fonts.style.fontFamily,
                    fontWeight: 400,
                },
                globalStyles: () => ({
                    body: {
                        backgroundColor: '#E5FCFB',
                        minHeight: '100dvh',
                    },
                    '::-webkit-scrollbar': {
                        height: '10px',
                        width: '10px',
                    },
                    '::-webkit-scrollbar-thumb': {
                        backgroundColor: '#c7dfde',
                        borderRadius: '10px',
                    },
                }),
            }}
        >
            <Head>
                <title>eve0415</title>
                <meta name='viewport' content='initial-scale=1, width=device-width' />
            </Head>

            <SwitchTransition mode='out-in'>
                <CSSTransition key={router.pathname} classNames='page' timeout={300} unmountOnExit>
                    <div
                        style={{
                            width: '100dvw',
                            height: '100dvh',
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            overflowX: 'hidden',
                        }}
                    >
                        <Component {...pageProps} />
                    </div>
                </CSSTransition>
            </SwitchTransition>

            <Navbar isOpen={open} open={() => setOpen(true)} close={() => setOpen(false)} />
        </MantineProvider>
    );
}
