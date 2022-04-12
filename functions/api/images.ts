export function onRequest({ request, waitUntil }: EventContext<unknown, '', unknown>) {
    waitUntil(response(request));
}

async function response(request: Request) {
    const url = new URL(request.url);

    const accept = `${request.headers.get('Accept')}`;
    const options: CfRequestInit = {
        cf: {
            image: {
                fit:
                    (url.searchParams.get('fit') as
                        | 'scale-down'
                        | 'contain'
                        | 'cover'
                        | 'crop'
                        | 'pad'
                        | null) ?? undefined,
                width: parseInt(url.searchParams.get('width') ?? '0') ?? undefined,
                height: parseInt(url.searchParams.get('height') ?? '0') ?? undefined,
                quality: parseInt(url.searchParams.get('quality') ?? '75'),
                format: accept.includes('image/avif')
                    ? 'avif'
                    : accept.includes('image/webp')
                    ? 'webp'
                    : undefined,
            },
        },
    };

    const imageURL = url.searchParams.get('image');
    if (!imageURL) return new Response('Missing "image" value', { status: 400 });

    const imageRequest = new Request(
        imageURL.startsWith('http') ? imageURL : `${request.headers.get('referer')}${imageURL.substring(1)}`,
        {
            headers: request.headers,
        }
    );

    const res = await fetch(imageRequest, options);
    const data = await res.json();

    const isTesting = url.searchParams.get('test');
    if (isTesting) return new Response(JSON.stringify(data), { status: 200 });

    return res;
}
