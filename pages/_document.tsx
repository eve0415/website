import { createGetInitialProps } from '@mantine/next';
import Document, { Head, Html, Main, NextScript } from 'next/document';

export default class WebDocument extends Document {
    static getInitialProps = createGetInitialProps();

    render() {
        return (
            <Html lang='ja'>
                <Head>
                    <link rel='apple-touch-icon' type='image/png' href='/apple-touch-icon-180x180.png' />
                    <link rel='icon' type='image/png' href='/icon-192x192.png' />
                    <link rel='icon' type='image/png' href='/icon-256x256.png' />

                    <meta charSet='utf-8' />

                    <meta name='description' content='eve0415 のホームページ' />
                    <meta name='twitter:card' content='summary' />
                    <meta name='twitter:site' content='@eveevekun' />
                    <meta name='twitter:creator' content='@eveevekun' />
                    <meta name='robots' content='nosnippet' />

                    <meta property='og:title' content='eve0415' />
                    <meta property='og:description' content='eve0415 のホームページ' />
                    <meta property='og:url' content='https://eve0415.net' />
                    <meta property='og:image' content='https://eve0415.net/icon-256x256.png' />
                    <meta property='og:image:alt' content='My Profile' />
                    <meta property='og:image:type' content='image/png' />
                    <meta property='og:image:width' content='256' />
                    <meta property='og:image:height' content='256' />
                </Head>

                <body
                    style={{
                        width: '100dvw',
                        height: '100dvh',
                        overflow: 'hidden',
                    }}
                >
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
