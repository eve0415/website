import type { FC } from 'react';

import { cn } from '#lib/cn';

import avif480 from './cat-glow-cutout-480x480.avif';
import webp480 from './cat-glow-cutout-480x480.webp';
import avif960 from './cat-glow-cutout-960x960.avif';
import webp960 from './cat-glow-cutout-960x960.webp';
import avif1440 from './cat-glow-cutout-1440x1440.avif';
import webp1440 from './cat-glow-cutout-1440x1440.webp';
import './cat-art.css';

const AVIF = `${avif480} 480w, ${avif960} 960w, ${avif1440} 1440w`;
const WEBP = `${webp480} 480w, ${webp960} 960w, ${webp1440} 1440w`;

interface CatArtProps {
  /** Per page: the hero and the 404 describe the same cat doing different things. */
  alt: string;
  /** The rendered width of the art on this page, as a `sizes` descriptor. */
  sizes: string;
  /**
   * `'high'` on the page where this art is the LCP candidate — the home hero,
   * where it clamps up to 600px. The 404's copy caps at 180px and is well below
   * the fold's headline, so it stays on the default.
   */
  fetchPriority?: 'high';
  className?: string;
}

/**
 * The hero cat. Owns its own sources so the two pages that use it cannot drift
 * apart on format order or breakpoints; everything page-specific is a prop.
 */
export const CatArt: FC<CatArtProps> = ({ alt, sizes, fetchPriority, className }) => (
  <picture>
    <source type='image/avif' srcSet={AVIF} sizes={sizes} />
    <source type='image/webp' srcSet={WEBP} sizes={sizes} />
    <img
      src={webp960}
      srcSet={WEBP}
      sizes={sizes}
      alt={alt}
      width={1440}
      height={1440}
      fetchPriority={fetchPriority}
      decoding='async'
      className={cn('relative block h-auto w-full drop-shadow-[0_20px_34px_rgba(3,1,20,.55)]', className)}
    />
  </picture>
);
