/* eslint-disable jsx-a11y/alt-text */
import type { ImageLoaderProps, ImageProps } from 'next/image';
import Image from 'next/image';

const cloudflareLoader = ({ src, width, quality }: ImageLoaderProps) =>
    `/api/images/?width=${width}&quality=${quality || 75}&image=${src}`;

export const CloudflareImage = (props: ImageProps) => {
    if (process.env.NODE_ENV === 'development') {
        return <Image unoptimized {...props} />;
    } else {
        return <Image {...props} loader={cloudflareLoader} referrerPolicy='origin' />;
    }
};
