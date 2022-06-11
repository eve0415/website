import { Hono } from 'hono';
import { etag } from 'hono/etag';

interface Env {
    MY_BUCKET: R2Bucket;
    cache: KVNamespace;
    AUTH_KEY_SECRET: string;
}

const app = new Hono<Env>();

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

app.put('/:request', async ctx => {
    const key = ctx.req.param('request');

    if (!ctx.req.headers.get('Content-Type')?.includes(`multipart/form-data`)) {
        await ctx.env.MY_BUCKET.put(key, await ctx.req.text());
        return new Response(`Put ${key} successfully!`);
    }

    const form = await ctx.req.formData();
    const file = form.get('file') as File;
    await ctx.env.MY_BUCKET.put(key, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type },
    });
});

app.delete('/:request', async ctx => {
    await ctx.env.MY_BUCKET.delete(ctx.req.param('request'));
    ctx.event?.waitUntil(ctx.env.cache.delete(ctx.req.param('request')));

    return new Response('Deleted!', { status: 200 });
});

export default app;
