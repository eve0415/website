/* eslint-disable no-case-declarations */
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
    // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
    // MY_KV_NAMESPACE: KVNamespace;
    //
    // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
    // MY_DURABLE_OBJECT: DurableObjectNamespace;
    //
    // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
    MY_BUCKET: R2Bucket;

    AUTH_KEY_SECRET: string;
}

function authorizeRequest(request: Request, env: Env) {
    return request.headers.get('X-Custom-Auth-Key') === env.AUTH_KEY_SECRET;
}

const func = {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const key = url.pathname.slice(1);

        switch (request.method) {
            case 'PUT':
                if (!authorizeRequest(request, env)) return new Response('Forbidden', { status: 403 });

                if (!request.headers.get('Content-Type')?.includes(`multipart/form-data`)) {
                    await env.MY_BUCKET.put(key, await request.text());
                    return new Response(`Put ${key} successfully!`);
                }

                const form = await request.formData();
                const file = form.get('file') as File;
                await env.MY_BUCKET.put(key, await file.arrayBuffer(), {
                    httpMetadata: { contentType: file.type },
                });

                return new Response(`Put ${key} successfully!`);
            case 'GET':
                const object = await env.MY_BUCKET.get(key);
                if (!object?.body) return new Response('Object Not Found', { status: 404 });

                const headers = new Headers();
                object.writeHttpMetadata(headers);
                headers.set('etag', object.httpEtag);

                return new Response(object.body, { headers });
            case 'DELETE':
                if (!authorizeRequest(request, env)) return new Response('Forbidden', { status: 403 });

                await env.MY_BUCKET.delete(key);
                return new Response('Deleted!', { status: 200 });

            default:
                return new Response('Method Not Allowed', {
                    status: 405,
                    headers: {
                        Allow: 'PUT, GET, DELETE',
                    },
                });
        }
    },
};

export default func;
