import Document, { Head, Html, Main, NextScript } from 'next/document';

export default class WebDocument extends Document {
    render() {
        return (
            <Html lang='ja'>
                <Head>
                    <link
                        rel='stylesheet'
                        href='https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap'
                    />
                    <link rel='apple-touch-icon' type='image/png' href='/apple-touch-icon-180x180.png' />
                    <link rel='icon' type='image/png' href='/icon-192x192.png' />
                    <link rel='icon' type='image/png' href='/icon-256x256.png' />

                    <meta charSet='utf-8' />

                    <meta name='description' content='eve0415 のホームページ' />
                    <meta name='twitter:card' content='summary' />
                    <meta name='twitter:site' content='@eveevekun' />
                    <meta name='twitter:creator' content='@eveevekun' />
                    <meta property='og:title' content='eve0415' />
                    <meta property='og:description' content='eve0415 のホームページ' />
                    <meta property='og:url' content='https://eve0415.net' />
                    <meta property='og:image' content='https://eve0415.net/icon-256x256.png' />
                    <meta property='og:image:alt' content='My Profile' />
                    <meta property='og:image:type' content='image/png' />
                    <meta property='og:image:width' content='256' />
                    <meta property='og:image:height' content='256' />
                </Head>

                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
