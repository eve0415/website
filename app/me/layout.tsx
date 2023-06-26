import type { FC, ReactNode } from 'react';

import { css } from 'styled-system/css';
import { stack } from 'styled-system/patterns';

const Layout: FC<{
  children: ReactNode;
  language: ReactNode;
  tool: ReactNode;
  framework: ReactNode;
  service: ReactNode;
  infrastructure: ReactNode;
  monitoring: ReactNode;
}> = ({ children, language, tool, framework, service, infrastructure, monitoring }) => {
  return (
    <div
      className={stack({
        direction: 'column',
        alignItems: 'center',
        marginTop: 70,
        marginBottom: 30,
      })}
    >
      <h1 className={css({ fontSize: '2.2rem' })}>プロフィール</h1>
      {children}
      {language}
      {tool}
      {framework}
      {service}
      {infrastructure}
      {monitoring}
    </div>
  );
};

export default Layout;
