type Env = {
  DB: any;
  ADMIN_TOKEN?: string;
  chongpang_bucket?: R2Bucket;
};

type ResourcePhoto = {
  id: string;
  object_key: string;
  year: string;
  category: string;
  title: string;
  sort_order: number;
  created_at: string;
};

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init.headers,
    },
  });

const getDb = (env: Env) => {
  if (!env.DB) throw new Error('D1 database is not bound');
  return env.DB;
};

const getBucket = (env: Env) => {
  if (!env.chongpang_bucket) throw new Error('R2 bucket is not bound');
  return env.chongpang_bucket;
};

const getAdminToken = (request: Request) => request.headers.get('x-admin-token')?.trim() ?? '';

const requireAdmin = (request: Request, env: Env) => {
  if (!env.ADMIN_TOKEN) return json({ error: '后台密码还没有在 Cloudflare 设置' }, { status: 503 });
  if (getAdminToken(request) !== env.ADMIN_TOKEN) return json({ error: '后台密码不正确' }, { status: 401 });
  return null;
};

const ensureTable = async (db: any) => {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS resource_photos (
      id TEXT PRIMARY KEY,
      object_key TEXT NOT NULL,
      year TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `).run();
};

const cleanText = (value: FormDataEntryValue | null) => String(value ?? '').trim();

const readJsonBody = async (request: Request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

export const onRequestGet = async ({ env }: { env: Env }) => {
  try {
    const db = getDb(env);
    await ensureTable(db);

    const { results } = await db
      .prepare(`
        SELECT id, object_key, year, category, title, sort_order, created_at
        FROM resource_photos
        ORDER BY year DESC, title ASC, sort_order ASC, created_at DESC
      `)
      .all<ResourcePhoto>();

    return json({
      photos: (results ?? []).map((photo) => ({
        ...photo,
        url: `/api/resource-photo?key=${encodeURIComponent(photo.object_key)}`,
      })),
    });
  } catch {
    return json({ error: '分会活动数据库还没有完成绑定' }, { status: 503 });
  }
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const adminError = requireAdmin(request, env);
  if (adminError) return adminError;

  let db: any;
  let bucket: R2Bucket;
  try {
    db = getDb(env);
    bucket = getBucket(env);
    await ensureTable(db);
  } catch {
    return json({ error: 'D1 或 R2 还没有完成绑定' }, { status: 503 });
  }

  const formData = await request.formData();
  const year = cleanText(formData.get('year'));
  const category = cleanText(formData.get('category')) || 'meeting';
  const title = cleanText(formData.get('title'));
  const sortOrder = Number(cleanText(formData.get('sort_order')) || '0');
  const file = formData.get('file');

  if (!year || !title || !(file instanceof File)) {
    return json({ error: '请填写年份、相册标题并选择图片' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return json({ error: '只能上传图片文件' }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const extension = file.type === 'image/png' ? 'png' : 'jpg';
  const objectKey = `resources/${year}/${id}.${extension}`;
  const createdAt = new Date().toISOString();

  await bucket.put(objectKey, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });

  await db
    .prepare(`
      INSERT INTO resource_photos (id, object_key, year, category, title, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(id, objectKey, year, category, title, sortOrder, createdAt)
    .run();

  return json({
    photo: {
      id,
      object_key: objectKey,
      year,
      category,
      title,
      sort_order: sortOrder,
      created_at: createdAt,
      url: `/api/resource-photo?key=${encodeURIComponent(objectKey)}`,
    },
  }, { status: 201 });
};

export const onRequestPut = async ({ request, env }: { request: Request; env: Env }) => {
  const adminError = requireAdmin(request, env);
  if (adminError) return adminError;

  let db: any;
  try {
    db = getDb(env);
    await ensureTable(db);
  } catch {
    return json({ error: 'D1 还没有完成绑定' }, { status: 503 });
  }

  const body = await readJsonBody(request);
  const ids = Array.isArray(body?.ids) ? body.ids.map((id: unknown) => String(id).trim()).filter(Boolean) : [];

  if (!ids.length) {
    return json({ error: '没有收到要保存的照片顺序' }, { status: 400 });
  }

  const statements = ids.map((id: string, index: number) =>
    db.prepare('UPDATE resource_photos SET sort_order = ? WHERE id = ?').bind(index, id),
  );

  await db.batch(statements);

  return json({ ok: true });
};

export const onRequestDelete = async ({ request, env }: { request: Request; env: Env }) => {
  const adminError = requireAdmin(request, env);
  if (adminError) return adminError;

  let db: any;
  let bucket: R2Bucket;
  try {
    db = getDb(env);
    bucket = getBucket(env);
    await ensureTable(db);
  } catch {
    return json({ error: 'D1 或 R2 还没有完成绑定' }, { status: 503 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id')?.trim();
  if (!id) return json({ error: '找不到要删除的照片' }, { status: 400 });

  const photo = await db.prepare('SELECT object_key FROM resource_photos WHERE id = ?').bind(id).first<ResourcePhoto>();
  if (photo?.object_key) await bucket.delete(photo.object_key);

  await db.prepare('DELETE FROM resource_photos WHERE id = ?').bind(id).run();

  return json({ ok: true });
};
