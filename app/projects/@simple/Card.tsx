import type { Route } from 'next';
import type { FC } from 'react';
import type { SimpleProject } from '../interface';

import Image from 'next/image';
import Link from 'next/link';
import { css } from 'styled-system/css';
import { gridItem } from 'styled-system/patterns';

const Card: FC<{ data: SimpleProject }> = ({ data: { name, image, description, url } }) => {
  return (
    <Link
      href={url as Route}
      className={gridItem({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        alignSelf: 'center',
        justifySelf: 'center',
        textAlign: 'center',
        border: '0.0625rem solid #dee2e6',
        borderRadius: 'lg',
        boxShadow: '0 20px 30px -15px rgba(0,0,0,0.15)',
        backgroundColor: 'white',
        height: 300,
        width: 350,
        transition: 'all 0.3s ease-in-out',
        _hover: {
          boxShadow: '0 25px 45px -15px rgba(0,0,0,0.15)',
        },
      })}
      target='_blank'
      rel='noopener noreferrer'
      data-ripplet
    >
      <Image
        src={image}
        alt={name}
        height={180}
        width={350}
        className={css({ borderTopRadius: 'lg', height: 180, width: 350 })}
      />

      <div className={css({ padding: 2 })}>
        <h3 className={css({ fontSize: 20, paddingBottom: 2 })}>{name}</h3>
        <p>{description}</p>
      </div>
    </Link>
  );
};

export default Card;
