import type { FC, ReactNode } from 'react';

import { css } from 'styled-system/css';
import { grid, stack } from 'styled-system/patterns';

const Layout: FC<{
  children: ReactNode;
  simple: ReactNode;
  advanced: ReactNode;
}> = ({ children, simple, advanced }) => {
  return (
    <div
      className={stack({
        direction: 'column',
        alignItems: 'center',
        marginTop: 70,
        marginBottom: 30,
      })}
    >
      <h1 className={css({ fontSize: '2.2rem' })}>プロジェクト一覧</h1>

      {children}

      <div className={grid({ columns: { smToXl: 1, xl: 2, '2xlOnly': 4 }, gap: { smDown: 2, md: 6 } })}>
        {simple}
        {advanced}
      </div>
    </div>
  );
};

export default Layout;
