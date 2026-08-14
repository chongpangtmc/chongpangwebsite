type Env = {
  DB: any;
  ADMIN_TOKEN?: string;
};

type ContestAward = {
  id: string;
  year: string;
  level: string;
  type: string;
  first: string;
  second: string;
  third: string;
  created_at: string;
};

type PresidentMessage = {
  id: string;
  term: string;
  name: string;
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

const getDb = (env: Env) => {
  if (!env.DB) throw new Error('D1 database is not bound');
  return env.DB;
};

const getAdminToken = (request: Request) => request.headers.get('x-admin-token')?.trim() ?? '';

const requireAdmin = (request: Request, env: Env) => {
  if (!env.ADMIN_TOKEN) return json({ error: '后台密码还没有在 Cloudflare 设置' }, { status: 503 });
  if (getAdminToken(request) !== env.ADMIN_TOKEN) return json({ error: '后台密码不正确' }, { status: 401 });
  return null;
};

const readBody = async (request: Request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

const ensureTables = async (db: any) => {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS contest_awards (
      id TEXT PRIMARY KEY,
      year TEXT NOT NULL,
      level TEXT NOT NULL,
      type TEXT NOT NULL,
      first TEXT NOT NULL DEFAULT '',
      second TEXT NOT NULL DEFAULT '',
      third TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS president_messages (
      id TEXT PRIMARY KEY,
      term TEXT NOT NULL,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();
};

const cleanAward = (body: Partial<ContestAward>) => {
  const year = String(body.year ?? '').trim();
  const level = String(body.level ?? '').trim();
  const type = String(body.type ?? '').trim();
  const first = String(body.first ?? '').trim();
  const second = String(body.second ?? '').trim();
  const third = String(body.third ?? '').trim();

  if (!year || !level || !type) return { error: '请填写年份、分类和比赛项目' };
  if (year.length > 20 || level.length > 20 || type.length > 30) return { error: '分类内容太长' };

  return { year, level, type, first, second, third };
};

const cleanPresident = (body: Partial<PresidentMessage>) => {
  const term = String(body.term ?? '').trim();
  const name = String(body.name ?? '').trim();
  const message = String(body.message ?? '').trim();

  if (!term || !name || !message) return { error: '请填写届别、会长姓名和鼓励话语' };
  if (term.length > 30 || name.length > 60 || message.length > 1000) return { error: '内容太长，请稍微精简' };

  return { term, name, message };
};

export const onRequestGet = async ({ env }: { env: Env }) => {
  try {
    const db = getDb(env);
    await ensureTables(db);

    const awards = await db
      .prepare(`
        SELECT id, year, level, type, first, second, third, created_at
        FROM contest_awards
        ORDER BY year DESC, level ASC, type ASC
      `)
      .all<ContestAward>();

    const presidents = await db
      .prepare(`
        SELECT id, term, name, message, created_at
        FROM president_messages
        ORDER BY term DESC
      `)
      .all<PresidentMessage>();

    return json({
      awards: awards.results ?? [],
      presidents: presidents.results ?? [],
    });
  } catch {
    return json({ error: '荣誉数据库还没有完成绑定' }, { status: 503 });
  }
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const adminError = requireAdmin(request, env);
  if (adminError) return adminError;

  let db: any;
  try {
    db = getDb(env);
    await ensureTables(db);
  } catch {
    return json({ error: '荣誉数据库还没有完成绑定' }, { status: 503 });
  }

  const body = await readBody(request);
  if (!body) return json({ error: 'Invalid request body' }, { status: 400 });

  const section = String(body.section ?? '').trim();
  const createdAt = new Date().toISOString();

  if (section === 'award') {
    const cleaned = cleanAward(body);
    if ('error' in cleaned) return json({ error: cleaned.error }, { status: 400 });

    const record = { id: crypto.randomUUID(), ...cleaned, created_at: createdAt };
    await db
      .prepare(`
        INSERT INTO contest_awards (id, year, level, type, first, second, third, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(record.id, record.year, record.level, record.type, record.first, record.second, record.third, record.created_at)
      .run();

    return json({ award: record }, { status: 201 });
  }

  if (section === 'president') {
    const cleaned = cleanPresident(body);
    if ('error' in cleaned) return json({ error: cleaned.error }, { status: 400 });

    const record = { id: crypto.randomUUID(), ...cleaned, created_at: createdAt };
    await db
      .prepare(`
        INSERT INTO president_messages (id, term, name, message, created_at)
        VALUES (?, ?, ?, ?, ?)
      `)
      .bind(record.id, record.term, record.name, record.message, record.created_at)
      .run();

    return json({ president: record }, { status: 201 });
  }

  return json({ error: '未知资料类型' }, { status: 400 });
};

export const onRequestPut = async ({ request, env }: { request: Request; env: Env }) => {
  const adminError = requireAdmin(request, env);
  if (adminError) return adminError;

  let db: any;
  try {
    db = getDb(env);
    await ensureTables(db);
  } catch {
    return json({ error: '荣誉数据库还没有完成绑定' }, { status: 503 });
  }

  const body = await readBody(request);
  if (!body) return json({ error: 'Invalid request body' }, { status: 400 });

  const id = String(body.id ?? '').trim();
  const section = String(body.section ?? '').trim();
  if (!id) return json({ error: '找不到要修改的资料' }, { status: 400 });

  if (section === 'award') {
    const cleaned = cleanAward(body);
    if ('error' in cleaned) return json({ error: cleaned.error }, { status: 400 });

    await db
      .prepare(`
        UPDATE contest_awards
        SET year = ?, level = ?, type = ?, first = ?, second = ?, third = ?
        WHERE id = ?
      `)
      .bind(cleaned.year, cleaned.level, cleaned.type, cleaned.first, cleaned.second, cleaned.third, id)
      .run();

    return json({ award: { id, ...cleaned } });
  }

  if (section === 'president') {
    const cleaned = cleanPresident(body);
    if ('error' in cleaned) return json({ error: cleaned.error }, { status: 400 });

    await db
      .prepare(`
        UPDATE president_messages
        SET term = ?, name = ?, message = ?
        WHERE id = ?
      `)
      .bind(cleaned.term, cleaned.name, cleaned.message, id)
      .run();

    return json({ president: { id, ...cleaned } });
  }

  return json({ error: '未知资料类型' }, { status: 400 });
};

export const onRequestDelete = async ({ request, env }: { request: Request; env: Env }) => {
  const adminError = requireAdmin(request, env);
  if (adminError) return adminError;

  let db: any;
  try {
    db = getDb(env);
    await ensureTables(db);
  } catch {
    return json({ error: '荣誉数据库还没有完成绑定' }, { status: 503 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id')?.trim();
  const section = url.searchParams.get('section')?.trim();
  if (!id) return json({ error: '找不到要删除的资料' }, { status: 400 });

  if (section === 'award') {
    await db.prepare('DELETE FROM contest_awards WHERE id = ?').bind(id).run();
    return json({ ok: true });
  }

  if (section === 'president') {
    await db.prepare('DELETE FROM president_messages WHERE id = ?').bind(id).run();
    return json({ ok: true });
  }

  return json({ error: '未知资料类型' }, { status: 400 });
};
