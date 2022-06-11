import { Hono } from 'hono';
import { etag } from 'hono/etag';

interface Env {
    MY_BUCKET: R2Bucket;
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
    console.log(ctx.env);
    const object = await ctx.env.MY_BUCKET.get(ctx.req.param('request'));
    if (!object?.body) return ctx.notFound();

    return ctx.body(object.body);
});

app.put('/:request', async ctx => {
    if (!ctx.req.headers.get('Content-Type')?.includes(`multipart/form-data`)) {
        await ctx.env.MY_BUCKET.put(ctx.req.param('request'), await ctx.req.text());
        return new Response(`Put ${ctx.req.param('request')} successfully!`);
    }

    const form = await ctx.req.formData();
    const file = form.get('file') as File;
    await ctx.env.MY_BUCKET.put(ctx.req.param('request'), await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type },
    });
});
app.delete('/:request', async ctx => {
    await ctx.env.MY_BUCKET.delete(ctx.req.param('request'));
    return new Response('Deleted!', { status: 200 });
});

export default app;
