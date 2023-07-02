import type { FC, ReactNode } from 'react';

import '@assets/globals.css';
import Script from 'next/script';
import { flex } from 'styled-system/patterns';

const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <Script src='https://challenges.cloudflare.com/turnstile/v0/api.js' />
      <main className={flex({ width: '100dvw', justifyContent: 'center', marginY: 16 })}>{children}</main>
    </>
  );
};

export default Layout;
