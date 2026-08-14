import { useEffect, useState } from 'react';
import { Database, LockKeyhole, PencilLine, RefreshCw, Save, ShieldCheck, Trash2 } from 'lucide-react';

type MemberMessage = {
  id: string;
  name: string;
  title: string;
  summary: string;
  message: string;
  created_at?: string;
};

const Admin = () => {
  const [adminToken, setAdminToken] = useState('');
  const [messages, setMessages] = useState<MemberMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [status, setStatus] = useState('');

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

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-20 pt-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-[2rem] bg-[#004165] p-8 text-white shadow-xl shadow-slate-200 sm:p-10">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#F2DF74]">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-black sm:text-4xl">忠邦官网后台管理</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/70">
            这里用于管理会友专栏留言。后台入口不会显示在首页菜单，请直接使用 /admin 进入。
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
      </div>
    </div>
  );
};

export default Admin;
