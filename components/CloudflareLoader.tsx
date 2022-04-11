/* eslint-disable jsx-a11y/alt-text */
import type { ImageLoaderProps, ImageProps } from 'next/image';
import Image from 'next/image';

const cloudflareLoader = ({ src, width, quality }: ImageLoaderProps) =>
    `/api/images?width=${width}&quality=${quality ?? 75}&${process.env.CF_PAGES_URL}image=${src.substring(
        1
    )}`;

export function CloudflareImage(props: ImageProps) {
    if (process.env.NODE_ENV === 'development') {
        return <Image unoptimized={true} {...props} />;
    } else {
        return <Image {...props} loader={cloudflareLoader} />;
    }
}
