type Env = {
  DB: any;
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

  let body: Partial<MemberMessage>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, { status: 400 });
  }

  const name = String(body.name ?? '').trim();
  const title = String(body.title ?? '').trim() || '忠邦会员';
  const summary = String(body.summary ?? '').trim();
  const message = String(body.message ?? '').trim();

  if (!name || !message) {
    return json({ error: '请填写姓名和感言内容' }, { status: 400 });
  }

  if (name.length > 60 || title.length > 80 || summary.length > 40 || message.length > 2000) {
    return json({ error: '内容太长，请稍微精简后再发布' }, { status: 400 });
  }

  const record: MemberMessage = {
    id: crypto.randomUUID(),
    name,
    title,
    summary,
    message,
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
