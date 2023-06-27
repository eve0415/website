import type { FC, ReactNode } from 'react';

import { css } from 'styled-system/css';
import { stack } from 'styled-system/patterns';

const Layout: FC<{
  children: ReactNode;
}> = ({ children }) => {
  return (
    <div
      className={stack({
        direction: 'column',
        alignItems: 'center',
        marginTop: 70,
        marginBottom: 30,
      })}
    >
      <h1 className={css({ fontSize: '2.2rem' })}>コンタクト</h1>
      {children}
    </div>
  );
};

export default Layout;
