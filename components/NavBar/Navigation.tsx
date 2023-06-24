'use client';

import { FC, ReactNode, useState } from 'react';
import { css } from 'styled-system/css';
import { center, circle } from 'styled-system/patterns';

const Navigation: FC<{ menu: ReactNode }> = ({ menu }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={circle({
          position: 'fixed',
          top: '-20px',
          left: '-20px',
          height: 100,
          width: 100,
          zIndex: 100,
          backgroundColor: '#E5FCFB',
          hideFrom: 'md',
        })}
        onClick={() => setOpen(!open)}
      >
        <div
          className={css({
            width: '1.5rem',
            height: 'calc(0.125rem)',
            backgroundColor: 'black',
            outline: 'transparent solid 0.0625rem',
            transitionProperty: 'background-color, transform',
            transitionDuration: '300ms',
            _before: {
              display: 'block',
              top: 'calc(-0.5rem)',
              position: 'relative',
              content: '""',
              width: '1.5rem',
              height: 'calc(0.125rem)',
              backgroundColor: 'black',
              outline: 'transparent solid 0.0625rem',
              transitionProperty: 'background-color, transform',
              transitionDuration: '300ms',
            },
            _after: {
              display: 'block',
              top: 'calc(0.4rem)',
              position: 'relative',
              content: '""',
              height: 'calc(0.125rem)',
              backgroundColor: 'black',
              transitionDuration: '300ms',
            },
            _open: {
              backgroundColor: 'transparent',
              _before: {
                transform: 'translateY(calc(0.5rem)) rotate(45deg)',
              },
              _after: {
                transform: 'translateY(calc(-0.5rem)) rotate(-45deg)',
              },
            },
          })}
          // @ts-expect-error
          open={open}
        />
      </button>

      <nav
        className={center({
          height: '100dvh',
          backgroundColor: 'white',
          alignItems: 'center',
          zIndex: 10,
          mdDown: {
            width: '3/4',
            position: 'absolute',
            display: open ? 'flex' : 'none',
          },
          md: {
            width: '1/4',
            opacity: 0.9,
          },
        })}
      >
        {menu}
      </nav>
    </>
  );
};

export default Navigation;
