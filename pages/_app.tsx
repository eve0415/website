import { MantineProvider } from '@mantine/core';
import localFont from '@next/font/local';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useState } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { Navbar } from '../components/navbar';

import '../styles/global.css';

const font = localFont({
  src: '../font/LINESeedJP_OTF_Rg.woff2',
  display: 'swap',
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
        fontFamily: font.style.fontFamily,
        headings: {
          fontFamily: font.style.fontFamily,
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
              top: 0,
              left: 0,
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
