export async function onRequest({ request }: EventContext<unknown, '', unknown>) {
    let url = new URL(request.url);

    const accept = `${request.headers.get('Accept')}`;
    let options: CfRequestInit = {
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
                format: /image\/avif/.test(accept) ? 'avif' : /image\/webp/.test(accept) ? 'webp' : undefined,
            },
        },
    };

    const imageURL = url.searchParams.get('image');
    if (!imageURL) return new Response('Missing "image" value', { status: 400 });

    const imageRequest = new Request(`${process.env["CF_PAGES_URL"]}${imageURL.substring(1)}`, {
        headers: request.headers,
    });

    return fetch(imageRequest, options);
}
