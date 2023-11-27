import type { FC, ReactNode } from 'react';

import { css } from 'styled-system/css/css';

import NavBar from './NavBar';

const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <NavBar />

      <main className={css({ width: { smDown: 'screen', md: '3/4' } })}>{children}</main>
    </>
  );
};

export default Layout;
