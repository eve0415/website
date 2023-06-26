import type { Route } from 'next';
import type { FC } from 'react';
import type { AdvancedProject } from '../interface';

import Image from 'next/image';
import Link from 'next/link';
import { css } from 'styled-system/css';
import { flex, gridItem } from 'styled-system/patterns';

const Card: FC<{ data: AdvancedProject }> = ({ data: { name, image, description, links } }) => {
  return (
    <div
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
        height: 330,
        width: 350,
      })}
    >
      <Image
        src={image}
        alt={name}
        height={180}
        width={350}
        className={css({ borderTopRadius: 'lg', height: 180, width: 350 })}
        style={{ objectFit: 'cover' }}
      />

      <div className={css({ padding: 2 })}>
        <h3 className={css({ fontSize: 20, paddingBottom: 2 })}>{name}</h3>
        <p>{description}</p>
      </div>

      <div className={flex({ fontSize: '1.2rem', alignItems: 'center' })}>
        {links.map(({ svg, url }) => (
          <Link
            key={name}
            href={url as Route}
            className={css({ marginX: 2 })}
            target='_blank'
            rel='noopener noreferrer'
            data-ripplet
          >
            {svg}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Card;
