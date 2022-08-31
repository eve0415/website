/* eslint-disable */
import { Hono } from 'hono';
import { etag } from 'hono/etag';

interface Env {
    MY_BUCKET: R2Bucket;
    cache: KVNamespace;
    AUTH_KEY_SECRET: string;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        if (request.method !== `GET`) {
            return new Response(`Method Not Allowed`, {
                status: 405,
                headers: { Allow: `GET` },
            });
        }

        const url = new URL(request.url);
        const cacheKey = new Request(url.toString(), request);
        const cachedRes = await caches.default.match(cacheKey);

        if (cachedRes && request.headers.get(`If-None-Match`) === cachedRes.headers.get(`ETag`))
            return new Response(null, {
                status: 304,
                headers: cachedRes.headers,
            });

        const cache = await env.cache.get(`${cacheKey}`, 'arrayBuffer');
        if (cache) return new Response(cache);

        const object = await env.MY_BUCKET.get(url.pathname.slice(1));
        if (!object?.body) return new Response(`Object Not Found`, { status: 404 });

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set(`etag`, object.httpEtag);
        headers.set(`Cache-Control`, `max-age=5184000, s-max-age=2592000, immutable`);
        headers.set(`Cloudflare-CDN-Cache-Control`, `max-age=1296000`);
        headers.set(`CDN-Cache-Control`, `max-age=648000`);

        const response = new Response(object.body, { headers });
        ctx.waitUntil(caches.default.put(cacheKey, response.clone()));
        ctx.waitUntil(env.cache.put(`${cacheKey}`, await response.clone().arrayBuffer()));

        return response;
    },
};

const app = new Hono<{ Bindings: Env }>();

app.use('*', etag());

app.use('*', async (ctx, next) => {
    if (!(ctx.req.method === 'GET' || ctx.req.headers.get('X-Custom-Auth-Key') === ctx.env.AUTH_KEY_SECRET)) {
        ctx.res = new Response('Unauthorized', { status: 401 });
        return;
    }
    // eslint-disable-next-line callback-return
    await next();
});

app.get('/:request', async ctx => {
    const key = ctx.req.param('request');

    const cache = await ctx.env.cache.get(key, 'arrayBuffer');
    if (cache) return ctx.body(cache);

    const object = await ctx.env.MY_BUCKET.get(key);
    if (!object?.body) return ctx.notFound();

    ctx.event?.waitUntil(ctx.env.cache.put(key, await object.arrayBuffer()));
    return ctx.body(object.body);
});
