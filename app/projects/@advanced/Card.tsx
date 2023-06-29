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
        height: '330px',
        width: '360px',
      })}
    >
      <Image
        src={image}
        alt={name}
        height={180}
        width={360}
        className={css({ borderTopRadius: 'lg', height: '180px', width: '360px' })}
        style={{ objectFit: 'cover' }}
      />

      <div className={css({ padding: 2 })}>
        <h3 className={css({ fontSize: 20, paddingBottom: 2 })}>{name}</h3>
        <p>{description}</p>
      </div>

      <div className={flex({ fontSize: '1.2rem', alignItems: 'center' })}>
        {links.map(({ svg, url, name: iconName }) => (
          <Link
            key={iconName}
            href={url as Route}
            className={css({ borderRadius: '50%', padding: 2 })}
            aria-label={iconName}
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
