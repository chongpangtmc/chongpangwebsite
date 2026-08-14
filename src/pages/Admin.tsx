import { useEffect, useState } from 'react';
import { Award, Crown, Database, LockKeyhole, PencilLine, PlusCircle, RefreshCw, Save, ShieldCheck, Trash2 } from 'lucide-react';

type MemberMessage = {
  id: string;
  name: string;
  title: string;
  summary: string;
  message: string;
  created_at?: string;
};

type ContestAward = {
  id: string;
  year: string;
  level: string;
  type: string;
  first: string;
  second: string;
  third: string;
  created_at?: string;
};

type PresidentMessage = {
  id: string;
  term: string;
  name: string;
  message: string;
  created_at?: string;
};

const emptyAward = { year: '', level: '分会', type: '幽默演讲', first: '', second: '', third: '' };
const emptyPresident = { term: '', name: '', message: '' };
const contestLevels = ['分会', '分区', 'L区'];
const contestTypes = ['幽默演讲', '评论演讲', '备稿演讲', '即席演讲'];

const Admin = () => {
  const [adminToken, setAdminToken] = useState('');
  const [messages, setMessages] = useState<MemberMessage[]>([]);
  const [awards, setAwards] = useState<ContestAward[]>([]);
  const [presidents, setPresidents] = useState<PresidentMessage[]>([]);
  const [newAward, setNewAward] = useState(emptyAward);
  const [newPresident, setNewPresident] = useState(emptyPresident);
  const [loading, setLoading] = useState(true);
  const [heritageLoading, setHeritageLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [status, setStatus] = useState('');
  const [heritageStatus, setHeritageStatus] = useState('');

  const readJson = async (response: Response) => {
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      throw new Error('后台接口还没有连接成功，请检查 Cloudflare Pages 的 Functions 与 D1 绑定。');
    }

    return response.json();
  };

  const loadMessages = async () => {
    setLoading(true);
    setStatus('');

    try {
      const response = await fetch('/api/member-messages');
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || '留言载入失败');
      setMessages(data.messages ?? []);
      setStatus(data.messages?.length ? `已载入 ${data.messages.length} 条留言。` : '目前还没有留言。');
    } catch (error) {
      setMessages([]);
      setStatus(error instanceof Error ? error.message : '留言载入失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    loadHeritage();
  }, []);

  const updateMessage = (id: string, field: keyof MemberMessage, value: string) => {
    setMessages((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const saveMessage = async (item: MemberMessage) => {
    if (!adminToken.trim()) {
      setStatus('请先输入后台密码。');
      return;
    }

    setSavingId(item.id);
    setStatus('');

    try {
      const response = await fetch('/api/member-messages', {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          'x-admin-token': adminToken.trim(),
        },
        body: JSON.stringify(item),
      });
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || '保存失败');
      setStatus('留言已更新。');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '保存失败');
    } finally {
      setSavingId('');
    }
  };

  const deleteMessage = async (item: MemberMessage) => {
    if (!adminToken.trim()) {
      setStatus('请先输入后台密码。');
      return;
    }

    const confirmed = window.confirm(`确定删除 ${item.name} 的留言吗？`);
    if (!confirmed) return;

    setSavingId(item.id);
    setStatus('');

    try {
      const response = await fetch(`/api/member-messages?id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken.trim() },
      });
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || '删除失败');
      setMessages((items) => items.filter((message) => message.id !== item.id));
      setStatus('留言已删除。');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '删除失败');
    } finally {
      setSavingId('');
    }
  };

  const loadHeritage = async () => {
    setHeritageLoading(true);
    setHeritageStatus('');

    try {
      const response = await fetch('/api/heritage-records');
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || '荣誉资料载入失败');
      setAwards(data.awards ?? []);
      setPresidents(data.presidents ?? []);
      setHeritageStatus('荣誉资料已载入。');
    } catch (error) {
      setAwards([]);
      setPresidents([]);
      setHeritageStatus(error instanceof Error ? error.message : '荣誉资料载入失败');
    } finally {
      setHeritageLoading(false);
    }
  };

  const updateAward = (id: string, field: keyof ContestAward, value: string) => {
    setAwards((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const updatePresident = (id: string, field: keyof PresidentMessage, value: string) => {
    setPresidents((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const createAward = async () => {
    if (!adminToken.trim()) {
      setHeritageStatus('请先输入后台密码。');
      return;
    }

    setSavingId('new-award');
    setHeritageStatus('');

    try {
      const response = await fetch('/api/heritage-records', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-admin-token': adminToken.trim(),
        },
        body: JSON.stringify({ section: 'award', ...newAward }),
      });
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || '新增失败');
      setAwards((items) => [data.award, ...items]);
      setNewAward(emptyAward);
      setHeritageStatus('比赛三甲已新增。');
    } catch (error) {
      setHeritageStatus(error instanceof Error ? error.message : '新增失败');
    } finally {
      setSavingId('');
    }
  };

  const saveAward = async (item: ContestAward) => {
    if (!adminToken.trim()) {
      setHeritageStatus('请先输入后台密码。');
      return;
    }

    setSavingId(item.id);
    setHeritageStatus('');

    try {
      const response = await fetch('/api/heritage-records', {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          'x-admin-token': adminToken.trim(),
        },
        body: JSON.stringify({ section: 'award', ...item }),
      });
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || '保存失败');
      setHeritageStatus('比赛三甲已更新。');
    } catch (error) {
      setHeritageStatus(error instanceof Error ? error.message : '保存失败');
    } finally {
      setSavingId('');
    }
  };

  const deleteAward = async (item: ContestAward) => {
    if (!adminToken.trim()) {
      setHeritageStatus('请先输入后台密码。');
      return;
    }

    if (!window.confirm(`确定删除 ${item.year} ${item.level} ${item.type} 吗？`)) return;

    setSavingId(item.id);
    setHeritageStatus('');

    try {
      const response = await fetch(`/api/heritage-records?section=award&id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken.trim() },
      });
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || '删除失败');
      setAwards((items) => items.filter((award) => award.id !== item.id));
      setHeritageStatus('比赛三甲已删除。');
    } catch (error) {
      setHeritageStatus(error instanceof Error ? error.message : '删除失败');
    } finally {
      setSavingId('');
    }
  };

  const createPresident = async () => {
    if (!adminToken.trim()) {
      setHeritageStatus('请先输入后台密码。');
      return;
    }

    setSavingId('new-president');
    setHeritageStatus('');

    try {
      const response = await fetch('/api/heritage-records', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-admin-token': adminToken.trim(),
        },
        body: JSON.stringify({ section: 'president', ...newPresident }),
      });
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || '新增失败');
      setPresidents((items) => [data.president, ...items]);
      setNewPresident(emptyPresident);
      setHeritageStatus('会长感言已新增。');
    } catch (error) {
      setHeritageStatus(error instanceof Error ? error.message : '新增失败');
    } finally {
      setSavingId('');
    }
  };

  const savePresident = async (item: PresidentMessage) => {
    if (!adminToken.trim()) {
      setHeritageStatus('请先输入后台密码。');
      return;
    }

    setSavingId(item.id);
    setHeritageStatus('');

    try {
      const response = await fetch('/api/heritage-records', {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          'x-admin-token': adminToken.trim(),
        },
        body: JSON.stringify({ section: 'president', ...item }),
      });
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || '保存失败');
      setHeritageStatus('会长感言已更新。');
    } catch (error) {
      setHeritageStatus(error instanceof Error ? error.message : '保存失败');
    } finally {
      setSavingId('');
    }
  };

  const deletePresident = async (item: PresidentMessage) => {
    if (!adminToken.trim()) {
      setHeritageStatus('请先输入后台密码。');
      return;
    }

    if (!window.confirm(`确定删除 ${item.term} ${item.name} 的感言吗？`)) return;

    setSavingId(item.id);
    setHeritageStatus('');

    try {
      const response = await fetch(`/api/heritage-records?section=president&id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken.trim() },
      });
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || '删除失败');
      setPresidents((items) => items.filter((president) => president.id !== item.id));
      setHeritageStatus('会长感言已删除。');
    } catch (error) {
      setHeritageStatus(error instanceof Error ? error.message : '删除失败');
    } finally {
      setSavingId('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-20 pt-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-[2rem] bg-[#004165] p-8 text-white shadow-xl shadow-slate-200 sm:p-10">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#F2DF74]">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-black sm:text-4xl">忠邦官网后台管理</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/70">
            这里用于管理会友专栏留言、比赛三甲和历届会长感言。后台入口不会显示在首页菜单，请直接使用 /admin 进入。
          </p>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#772432]" />
              <h2 className="text-lg font-black text-slate-900">后台密码</h2>
            </div>
            <input
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              type="password"
              placeholder="输入 Cloudflare 里的 ADMIN_TOKEN"
              className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-[#772432]/10"
            />
            <p className="mt-3 text-xs leading-5 text-slate-500">修改和删除需要密码；只查看留言不需要。</p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Database className="h-5 w-5 text-[#006094]" />
              <h2 className="text-lg font-black text-slate-900">留言数据库</h2>
            </div>
            <button
              onClick={loadMessages}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#004165] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              重新载入
            </button>
            {status && <p className="mt-3 text-xs font-bold leading-5 text-[#772432]">{status}</p>}
          </div>
        </div>

        <SectionHeader title="会友专栏留言" note="修改会员留下的感言与心得。" />
        <div className="space-y-5">
          {loading ? (
            <div className="rounded-3xl bg-white p-10 text-center text-sm font-bold text-slate-400">载入中...</div>
          ) : messages.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center text-sm font-bold text-slate-400">目前没有可管理的留言。</div>
          ) : (
            messages.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#772432]/10 text-[#772432]">
                      <PencilLine className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{item.name || '未命名留言'}</p>
                      <p className="text-xs text-slate-400">{item.created_at ? new Date(item.created_at).toLocaleString('zh-SG') : '无日期'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveMessage(item)}
                      disabled={savingId === item.id}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#004165] px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      保存
                    </button>
                    <button
                      onClick={() => deleteMessage(item)}
                      disabled={savingId === item.id}
                      className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600 disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      删除
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={item.name}
                    onChange={(event) => updateMessage(item.id, 'name', event.target.value)}
                    placeholder="姓名"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#772432]/10"
                  />
                  <input
                    value={item.title}
                    onChange={(event) => updateMessage(item.id, 'title', event.target.value)}
                    placeholder="身份 / 荣衔"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#772432]/10"
                  />
                </div>

                <input
                  value={item.summary}
                  onChange={(event) => updateMessage(item.id, 'summary', event.target.value)}
                  maxLength={40}
                  placeholder="一句感言金句"
                  className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-[#772432] outline-none focus:ring-2 focus:ring-[#772432]/10"
                />

                <textarea
                  value={item.message}
                  onChange={(event) => updateMessage(item.id, 'message', event.target.value)}
                  placeholder="详细感言内容"
                  className="mt-3 h-36 w-full resize-none rounded-2xl border border-slate-200 p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-[#772432]/10"
                />
              </div>
            ))
          )}
        </div>

        <div className="mt-12 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">荣誉与传承资料</h2>
              <p className="mt-2 text-sm text-slate-500">管理 /heritage 里的比赛三甲和历届会长感言。</p>
            </div>
            <button
              onClick={loadHeritage}
              disabled={heritageLoading}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#772432] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${heritageLoading ? 'animate-spin' : ''}`} />
              重新载入
            </button>
          </div>
          {heritageStatus && <p className="text-xs font-bold leading-5 text-[#772432]">{heritageStatus}</p>}
        </div>

        <SectionHeader title="新增比赛三甲" note="分类可选：分会、分区、L区；项目可选：幽默、评论、备稿、即席。" />
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              value={newAward.year}
              onChange={(event) => setNewAward({ ...newAward, year: event.target.value })}
              placeholder="年份，例如 2026"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#772432]/10"
            />
            <select
              value={newAward.level}
              onChange={(event) => setNewAward({ ...newAward, level: event.target.value })}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#772432]/10"
            >
              {contestLevels.map((level) => <option key={level}>{level}</option>)}
            </select>
            <select
              value={newAward.type}
              onChange={(event) => setNewAward({ ...newAward, type: event.target.value })}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#772432]/10"
            >
              {contestTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <input
              value={newAward.first}
              onChange={(event) => setNewAward({ ...newAward, first: event.target.value })}
              placeholder="冠军姓名"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#772432]/10"
            />
            <input
              value={newAward.second}
              onChange={(event) => setNewAward({ ...newAward, second: event.target.value })}
              placeholder="亚军姓名"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#772432]/10"
            />
            <input
              value={newAward.third}
              onChange={(event) => setNewAward({ ...newAward, third: event.target.value })}
              placeholder="季军姓名"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#772432]/10"
            />
          </div>
          <button
            onClick={createAward}
            disabled={savingId === 'new-award'}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#004165] px-5 py-3 text-xs font-bold text-white disabled:opacity-60"
          >
            <PlusCircle className="h-4 w-4" />
            新增比赛三甲
          </button>
        </div>

        <SectionHeader title="比赛三甲管理" note="这些资料会显示在荣誉与传承页面上方的分类切换中。" />
        <div className="space-y-4">
          {heritageLoading ? (
            <div className="rounded-3xl bg-white p-10 text-center text-sm font-bold text-slate-400">载入中...</div>
          ) : awards.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center text-sm font-bold text-slate-400">目前没有比赛资料。</div>
          ) : (
            awards.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                <AdminItemHeader
                  icon={<Award className="h-5 w-5" />}
                  title={`${item.year || '未填年份'} · ${item.level} · ${item.type}`}
                  onSave={() => saveAward(item)}
                  onDelete={() => deleteAward(item)}
                  disabled={savingId === item.id}
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <input value={item.year} onChange={(event) => updateAward(item.id, 'year', event.target.value)} placeholder="年份" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#772432]/10" />
                  <select value={item.level} onChange={(event) => updateAward(item.id, 'level', event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#772432]/10">
                    {contestLevels.map((level) => <option key={level}>{level}</option>)}
                  </select>
                  <select value={item.type} onChange={(event) => updateAward(item.id, 'type', event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#772432]/10">
                    {contestTypes.map((type) => <option key={type}>{type}</option>)}
                  </select>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <input value={item.first} onChange={(event) => updateAward(item.id, 'first', event.target.value)} placeholder="冠军姓名" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#772432]/10" />
                  <input value={item.second} onChange={(event) => updateAward(item.id, 'second', event.target.value)} placeholder="亚军姓名" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#772432]/10" />
                  <input value={item.third} onChange={(event) => updateAward(item.id, 'third', event.target.value)} placeholder="季军姓名" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#772432]/10" />
                </div>
              </div>
            ))
          )}
        </div>

        <SectionHeader title="新增历届会长感言" note="忠邦十周年，可以每一届会长放一张传承卡片。" />
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={newPresident.term}
              onChange={(event) => setNewPresident({ ...newPresident, term: event.target.value })}
              placeholder="届别，例如 2025-2026"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#772432]/10"
            />
            <input
              value={newPresident.name}
              onChange={(event) => setNewPresident({ ...newPresident, name: event.target.value })}
              placeholder="会长姓名"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#772432]/10"
            />
          </div>
          <textarea
            value={newPresident.message}
            onChange={(event) => setNewPresident({ ...newPresident, message: event.target.value })}
            placeholder="鼓励后辈的一句话"
            className="mt-3 h-28 w-full resize-none rounded-2xl border border-slate-200 p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-[#772432]/10"
          />
          <button
            onClick={createPresident}
            disabled={savingId === 'new-president'}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#772432] px-5 py-3 text-xs font-bold text-white disabled:opacity-60"
          >
            <PlusCircle className="h-4 w-4" />
            新增会长感言
          </button>
        </div>

        <SectionHeader title="历届会长感言管理" note="这些资料会显示在荣誉与传承页面下方。" />
        <div className="space-y-4">
          {presidents.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center text-sm font-bold text-slate-400">目前没有会长感言。</div>
          ) : (
            presidents.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                <AdminItemHeader
                  icon={<Crown className="h-5 w-5" />}
                  title={`${item.term || '未填届别'} · ${item.name || '未填姓名'}`}
                  onSave={() => savePresident(item)}
                  onDelete={() => deletePresident(item)}
                  disabled={savingId === item.id}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={item.term} onChange={(event) => updatePresident(item.id, 'term', event.target.value)} placeholder="届别" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#772432]/10" />
                  <input value={item.name} onChange={(event) => updatePresident(item.id, 'name', event.target.value)} placeholder="会长姓名" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#772432]/10" />
                </div>
                <textarea value={item.message} onChange={(event) => updatePresident(item.id, 'message', event.target.value)} placeholder="鼓励后辈的一句话" className="mt-3 h-28 w-full resize-none rounded-2xl border border-slate-200 p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-[#772432]/10" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ title, note }: { title: string; note: string }) => (
  <div className="mb-4 mt-10">
    <h2 className="text-xl font-black text-slate-900">{title}</h2>
    <p className="mt-2 text-sm text-slate-500">{note}</p>
  </div>
);

const AdminItemHeader = ({
  icon,
  title,
  onSave,
  onDelete,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  onSave: () => void;
  onDelete: () => void;
  disabled: boolean;
}) => (
  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#772432]/10 text-[#772432]">{icon}</div>
      <p className="text-sm font-black text-slate-900">{title}</p>
    </div>
    <div className="flex gap-2">
      <button onClick={onSave} disabled={disabled} className="inline-flex items-center gap-2 rounded-xl bg-[#004165] px-4 py-2 text-xs font-bold text-white disabled:opacity-60">
        <Save className="h-4 w-4" />
        保存
      </button>
      <button onClick={onDelete} disabled={disabled} className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600 disabled:opacity-60">
        <Trash2 className="h-4 w-4" />
        删除
      </button>
    </div>
  </div>
);

export default Admin;
