export async function onRequest({ request }: EventContext<unknown, '', unknown>) {
    const url = new URL(request.url);
    const imageURL = url.searchParams.get('image');
    if (!imageURL) return new Response('Missing "image" value', { status: 400 });

    return fetch(
        new Request(
            `https://images.eve0415.net/_next/images?url=${
                imageURL.startsWith('http')
                    ? imageURL
                    : `${request.headers.get('referer')}${imageURL.substring(1)}`
            }&w=${url.searchParams.get('width')}&q=${url.searchParams.get('quality')}`,
            {
                headers: request.headers,
            }
        )
    );
}
