import Document, { Head, Html, Main, NextScript } from 'next/document';

export default class WebDocument extends Document {
    render() {
        return (
            <Html lang='ja'>
                <Head>
                    <link rel='dns-prefetch' href='//fonts.googleapis.com' />
                    <link rel='dns-prefetch' href='//fonts.gtatic.com/' />

                    <link rel='preconnect' href='https://fonts.googleapis.com' crossOrigin='anonymous' />
                    <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />

                    <link
                        rel='stylesheet'
                        href='https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap'
                    />

                    <link rel='apple-touch-icon' type='image/png' href='/apple-touch-icon-180x180.png' />
                    <link rel='icon' type='image/png' href='/icon-192x192.png' />

                    <meta charSet='utf-8' />

                    <meta property='og:title' content='eve0415' />
                    <meta property='og:description' content='eve0415 のホームページ' />
                    <meta property='og:url' content='https://eve0415.net' />
                    <meta
                        property='og:image'
                        content='https://eve0415.net/api/images?quality=75&image=https://eve0415.net/icon-192x192.png'
                    />
                    <meta property='og:type' content='website' />
                    <meta property='og:locale' content='ja_JP' />

                    <meta name='twitter:site' content='@eveevekun' />
                    <meta name='twitter:creator' content='@eveevekun' />
                    <meta name='twitter:card' content='summary' />

                    <meta name='description' content='eve0415 のサイト' />
                </Head>
                <body style={{ backgroundColor: '#E5FCFB' }}>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
