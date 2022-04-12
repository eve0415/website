// This is for Cloudflare Workers
addEventListener('fetch', event => {
    if (`${event.request.headers.get('via')}`.includes('api/images')) return event.respondWith(fetch(event.request));

    event.respondWith(
        handleRequest(event.request).catch(err => new Response(err.stack, { status: 500 }))
    );
});

/**
 * Fetch and log a request
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleRequest(request) {
    const url = new URL(request.url);
    const accept = `${request.headers.get('Accept')}`;
    /** @type {CfRequestInit} options */
    const options = {
        cf: {
            image: {
                fit:
                    url.searchParams.get('fit') ?? undefined,
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

    const res = await fetch(
        new Request(
            imageURL.startsWith('http')
                ? imageURL
                : `${request.headers.get('referer')}${imageURL.substring(1)}`,
            {
                headers: request.headers,
            }
        ),
        options
    );
    return res;
}
