/* eslint-disable jsx-a11y/alt-text */
import type { ImageProps } from 'next/future/image';
import Image from 'next/future/image';
import Head from 'next/head';

export const CustomImageProxy = (props: ImageProps) => (
    <Image
        {...props}
        loader={({ src, width, quality }) =>
            `https://images.eve0415.net?url=${src}&width=${width}&quality=${quality || 80}`
        }
    />
);

export const PreConnect = () => (
    <Head>
        <link href='https://images.eve0415.net' rel='preconnect' />
    </Head>
);
