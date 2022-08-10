/* eslint-disable jsx-a11y/alt-text */
import type { ImageProps } from 'next/future/image';
import Image from 'next/future/image';

export const CustomImageProxy = (props: ImageProps) => (
    <Image
        {...props}
        loader={({ src, width, quality }) =>
            `https://images.eve0415.net?url=${src}&width=${width}&quality=${quality || 80}`
        }
    />
);
