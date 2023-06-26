'use client';

import type { Route } from 'next';
import type { FC } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { css } from 'styled-system/css';
import { flex } from 'styled-system/patterns';

const Item: FC<{
  page: { name: string; icon: JSX.Element; path: string };
}> = ({ page: { name, icon, path } }) => {
  const pathName = usePathname();

  return (
    <Link
      href={path as Route}
      className={flex({
        paddingX: 16,
        paddingY: 4,
        marginY: 2,
        alignItems: 'center',
        width: '100%',
        transition: 'all 0.2s ease-in-out',
        _selected: {
          bgColor: { base: '#E5FCFB', _hover: 'rgba(208, 235, 255, 0.65)' },
          color: 'blueviolet',
        },
        ...(pathName !== path && {
          _hover: {
            bgColor: { base: '#E5FCFB' },
          },
        }),
      })}
      {...(pathName === path && { 'aria-selected': true })}
    >
      {icon}
      <h3 className={css({ paddingLeft: 2 })}>{name}</h3>
    </Link>
  );
};

export default Item;
