import type { Viewport } from 'next';
import type { FC, ReactNode } from 'react';

import '@assets/globals.css';
import localFont from 'next/font/local';
import Script from 'next/script';

import { css } from 'styled-system/css/css';

const line = localFont({
  src: '../assets/LINESeedJP_OTF_Rg.woff2',
  display: 'swap',
  variable: '--font-line',
});

export const viewport: Viewport = {
  themeColor: '#E5FCFB',
};

export const metadata = {
  title: {
    default: 'eve0415',
    template: '%s | eve0415',
  },
  description: 'eve0415 のプロフィールページです',
  applicationName: 'eve0415',
  authors: [{ name: 'eve0415', url: 'https://eve0415.net' }],
  metadataBase: new URL('https://eve0415.net'),
  openGraph: {
    title: {
      default: 'eve0415',
      template: '%s | eve0415',
    },
    description: 'eve0415 のプロフィールページです',
    url: 'https://eve0415.net',
    siteName: 'eve0415',
    type: 'profile',
    locale: 'ja_JP',
    images: [
      {
        url: 'https://eve0415.net/cdn-cgi/imagedelivery/e1FmkEoJCgY0rL0NK8GfGA/648ac891-edcf-4ae6-2c20-9cc7adae0401/og',
        width: 600,
        height: 600,
      },
    ],
  },
  twitter: {
    creator: '@eve0415',
  },
  robots: {
    follow: process.env.BRANCH === 'main',
    index: process.env.BRANCH === 'main',
    nocache: process.env.BRANCH !== 'main',
    noarchive: process.env.BRANCH !== 'main',
    googleBot: {
      follow: process.env.BRANCH === 'main',
      index: process.env.BRANCH === 'main',
      nocache: process.env.BRANCH !== 'main',
      noarchive: process.env.BRANCH !== 'main',
    },
  },
};

const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <html
      lang='ja'
      className={`${line.variable} ${css({
        bgColor: '#E5FCFB',
        minHeight: '100dvh',
        fontFamily: ['line'],
        '&::-webkit-scrollbar': {
          height: '2',
          width: '2',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#c7dfde',
          borderRadius: '10px',
        },
      })}`}
    >
      <Script src='https://cdn.jsdelivr.net/npm/ripplet.js@1.1.0/umd/ripplet-declarative.min.js' />

      <body className={css({ display: { sm: 'contents', md: 'flex' } })}>{children}</body>
    </html>
  );
};

export default Layout;
