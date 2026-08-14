type Env = {
  DB: any;
  ADMIN_TOKEN?: string;
};

type MemberMessage = {
  id: string;
  name: string;
  title: string;
  summary: string;
  message: string;
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

const ensureTable = async (db: any) => {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS member_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      summary TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();
};

const getDb = (env: Env) => {
  if (!env.DB) {
    throw new Error('D1 database is not bound');
  }

  return env.DB;
};

const getAdminToken = (request: Request) => request.headers.get('x-admin-token')?.trim() ?? '';

const requireAdmin = (request: Request, env: Env) => {
  if (!env.ADMIN_TOKEN) {
    return json({ error: '后台密码还没有在 Cloudflare 设置' }, { status: 503 });
  }

  if (getAdminToken(request) !== env.ADMIN_TOKEN) {
    return json({ error: '后台密码不正确' }, { status: 401 });
  }

  return null;
};

const readBody = async (request: Request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

const cleanMessage = (body: Partial<MemberMessage>) => {
  const name = String(body.name ?? '').trim();
  const title = String(body.title ?? '').trim() || '忠邦会员';
  const summary = String(body.summary ?? '').trim();
  const message = String(body.message ?? '').trim();

  if (!name || !message) {
    return { error: '请填写姓名和感言内容' };
  }

  if (name.length > 60 || title.length > 80 || summary.length > 40 || message.length > 2000) {
    return { error: '内容太长，请稍微精简后再发布' };
  }

  return { name, title, summary, message };
};

export const onRequestGet = async ({ env }: { env: Env }) => {
  try {
    const db = getDb(env);
    await ensureTable(db);

    const { results } = await db
      .prepare(`
        SELECT id, name, title, summary, message, created_at
        FROM member_messages
        ORDER BY created_at DESC
      `)
      .all<MemberMessage>();

    return json({ messages: results ?? [] });
  } catch {
    return json({ error: '留言数据库还没有完成绑定' }, { status: 503 });
  }
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  let db: any;
  try {
    db = getDb(env);
    await ensureTable(db);
  } catch {
    return json({ error: '留言数据库还没有完成绑定' }, { status: 503 });
  }

  const body = await readBody(request);
  if (!body) {
    return json({ error: 'Invalid request body' }, { status: 400 });
  }

  const cleaned = cleanMessage(body);
  if ('error' in cleaned) {
    return json({ error: cleaned.error }, { status: 400 });
  }

  const record: MemberMessage = {
    id: crypto.randomUUID(),
    name: cleaned.name,
    title: cleaned.title,
    summary: cleaned.summary,
    message: cleaned.message,
    created_at: new Date().toISOString(),
  };

  await db
    .prepare(`
      INSERT INTO member_messages (id, name, title, summary, message, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .bind(record.id, record.name, record.title, record.summary, record.message, record.created_at)
    .run();

  return json({ message: record }, { status: 201 });
};

export const onRequestPut = async ({ request, env }: { request: Request; env: Env }) => {
  const adminError = requireAdmin(request, env);
  if (adminError) return adminError;

  let db: any;
  try {
    db = getDb(env);
    await ensureTable(db);
  } catch {
    return json({ error: '留言数据库还没有完成绑定' }, { status: 503 });
  }

  const body = await readBody(request);
  if (!body) {
    return json({ error: 'Invalid request body' }, { status: 400 });
  }

  const id = String(body.id ?? '').trim();
  const cleaned = cleanMessage(body);
  if (!id) return json({ error: '找不到要修改的留言' }, { status: 400 });
  if ('error' in cleaned) return json({ error: cleaned.error }, { status: 400 });

  await db
    .prepare(`
      UPDATE member_messages
      SET name = ?, title = ?, summary = ?, message = ?
      WHERE id = ?
    `)
    .bind(cleaned.name, cleaned.title, cleaned.summary, cleaned.message, id)
    .run();

  return json({
    message: {
      id,
      name: cleaned.name,
      title: cleaned.title,
      summary: cleaned.summary,
      message: cleaned.message,
    },
  });
};

export const onRequestDelete = async ({ request, env }: { request: Request; env: Env }) => {
  const adminError = requireAdmin(request, env);
  if (adminError) return adminError;

  let db: any;
  try {
    db = getDb(env);
    await ensureTable(db);
  } catch {
    return json({ error: '留言数据库还没有完成绑定' }, { status: 503 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id')?.trim();
  if (!id) return json({ error: '找不到要删除的留言' }, { status: 400 });

  await db.prepare('DELETE FROM member_messages WHERE id = ?').bind(id).run();

  return json({ ok: true });
};
