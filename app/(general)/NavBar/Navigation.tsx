'use client';

import type { FC, ReactNode } from 'react';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { css } from 'styled-system/css';
import { center, circle } from 'styled-system/patterns';

const Navigation: FC<{ menu: ReactNode }> = ({ menu }) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <button
        className={circle({
          position: 'fixed',
          top: '-20px',
          left: '-20px',
          height: '100px',
          width: '100px',
          zIndex: 100,
          backgroundColor: '#E5FCFB',
          hideFrom: 'md',
        })}
        onClick={() => setOpen(!open)}
        aria-label='メニュー'
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
          // @ts-expect-error 2322
          open={open}
        />
      </button>

      <div
        className={css({
          display: { md: 'none' },
          height: '100dvh',
          width: '100dvw',
          position: 'fixed',
          backgroundColor: 'rgba(0,0,0,0.5)',
          transition: '.5s',
          visibility: 'hidden',
          opacity: 0,
          zIndex: 5,
          _open: {
            visibility: 'visible',
            opacity: 1,
          },
        })}
        // @ts-expect-error 2322
        open={open}
      />

      <nav
        className={center({
          height: '100dvh',
          backgroundColor: 'white',
          alignItems: 'center',
          zIndex: 10,
          mdDown: {
            width: '3/4',
            position: 'fixed',
            transform: `translate3d(${open ? 0 : '-100%'}, 0, 0)`,
            transition: '.5s',
          },
          md: {
            position: 'sticky',
            top: 0,
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
