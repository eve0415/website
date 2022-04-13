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
                    <link rel='icon' type='image/png' href='/icon-256x256.png' />

                    <meta charSet='utf-8' />
                </Head>
                <body style={{ backgroundColor: '#E5FCFB' }}>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
