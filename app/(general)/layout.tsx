import type { FC, ReactNode } from 'react';

import '@assets/globals.css';
import { css } from 'styled-system/css/css';

import NavBar from './NavBar';

const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <body className={css({ display: 'flex' })}>
      <NavBar />

      <main className={css({ width: { mdDown: '100dvw', md: '3/4' } })}>{children}</main>
    </body>
  );
};

export default Layout;
