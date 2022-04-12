/* eslint-disable jsx-a11y/alt-text */
import type { ImageLoaderProps, ImageProps } from 'next/image';
import Image from 'next/image';

const cloudflareLoader = ({ src, width, quality }: ImageLoaderProps) =>
    `https://eve0415.net/api/images?width=${width}&quality=${quality ?? 75}&image=${src}`;

export function CloudflareImage(props: ImageProps) {
    if (process.env.NODE_ENV === 'development') {
        return <Image unoptimized={true} {...props} />;
    } else {
        return <Image {...props} loader={cloudflareLoader} referrerPolicy='origin' />;
    }
}
