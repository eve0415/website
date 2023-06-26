import type { FC, ReactNode } from 'react';

import localFont from 'next/font/local';
import { css } from 'styled-system/css/css';

import '@assets/globals.css';
import NavBar from '@components/NavBar';

const line = localFont({
  src: '../assets/LINESeedJP_OTF_Rg.woff2',
  display: 'swap',
  variable: '--font-line',
});

export const metadata = {
  title: 'eve0415',
};

const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <html
      lang='ja'
      className={`${line.variable} ${css({
        bgColor: '#E5FCFB',
        minHeight: '100dvh',
        fontFamily: ['line'],
      })}`}
    >
      <body className={css({ display: 'flex' })}>
        <NavBar />

        <main className={css({ width: { mdDown: '100dvw', md: '3/4' } })}>{children}</main>
      </body>
    </html>
  );
};

export default Layout;
