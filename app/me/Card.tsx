import type { Route } from 'next';
import type { FC, ReactElement } from 'react';

import Link from 'next/link';
import { gridItem } from 'styled-system/patterns';

const Card: FC<{ data: { url: string; svg: ReactElement; name: string } }> = ({
  data: { url, svg, name },
}) => {
  const item = (
    <>
      <svg style={{ width: 70, height: 70 }} viewBox='0 0 128 128'>
        {svg}
      </svg>
      <h3>{name}</h3>
    </>
  );
  const className = gridItem({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'center',
    justifySelf: 'center',
    textAlign: 'center',
    padding: 5,
    border: '0.0625rem solid #dee2e6',
    borderRadius: 'sm',
    boxShadow:
      '0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 0.625rem 0.9375rem -0.3125rem, rgba(0, 0, 0, 0.04) 0 0.4375rem 0.4375rem -0.3125rem',
    backgroundColor: 'white',
    height: 130,
    width: 130,
    transition: 'all 0.2s ease-in-out',
    _hover: {
      backgroundColor: 'rgba(242, 242, 242, 1)',
    },
  });

  return url === '' ? (
    <div className={className}>{item}</div>
  ) : (
    <Link href={url as Route} className={className} target='_blank' rel='noopener noreferrer'>
      {item}
    </Link>
  );
};

export default Card;
