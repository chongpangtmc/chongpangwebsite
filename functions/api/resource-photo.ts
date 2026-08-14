type Env = {
  chongpang_bucket?: R2Bucket;
};

const getBucket = (env: Env) => {
  if (!env.chongpang_bucket) throw new Error('R2 bucket is not bound');
  return env.chongpang_bucket;
};

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    if (!key) return new Response('Missing image key', { status: 400 });

    const object = await getBucket(env).get(key);
    if (!object) return new Response('Image not found', { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=31536000, immutable');

    return new Response(object.body, { headers });
  } catch {
    return new Response('Activity gallery bucket is not bound', { status: 503 });
  }
};
