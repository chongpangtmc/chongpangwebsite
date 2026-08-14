import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Quote, Send, Sparkles, User } from 'lucide-react';

type MemberMessage = {
  id: string;
  name: string;
  title: string;
  summary: string;
  message: string;
  created_at?: string;
};

const initialMessages: MemberMessage[] = [
  {
    id: 'sample-1',
    name: '会员姓名',
    title: '忠邦会员',
    summary: '在这里，我学会勇敢开口。',
    message: '每一次例会都是一次小小的练习。有人聆听，有人鼓励，也有人真诚地给建议。慢慢地，我开始相信自己也可以把话说得清楚、有力量。',
  },
  {
    id: 'sample-2',
    name: '会员姓名',
    title: '新会员心得',
    summary: '一个温暖的舞台，一群真诚的伙伴。',
    message: '第一次参加例会时很紧张，但会友们的掌声和笑容让我放松下来。忠邦华语演讲会让我感受到，成长不是一个人的事。',
  },
];

const MemberColumn = () => {
  const [messages, setMessages] = useState<MemberMessage[]>(initialMessages);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('');

  const TI_MAROON = '#772432';

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/member-messages');
        if (!response.ok) throw new Error('load failed');
        const data = await response.json();
        setMessages(data.messages?.length ? data.messages : initialMessages);
      } catch {
        setMessages(initialMessages);
        setStatus('留言数据库还没有完成绑定，当前显示示例内容。');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !message.trim()) {
      alert('请填写姓名和感言内容');
      return;
    }

    setSubmitting(true);
    setStatus('');

    try {
      const response = await fetch('/api/member-messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          title: title.trim(),
          summary: summary.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '发布失败');

      setMessages([data.message, ...messages.filter((item) => !item.id.startsWith('sample-'))]);
      setName('');
      setTitle('');
      setSummary('');
      setMessage('');
      setStatus('感言已保存。');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '发布失败，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-white pt-28 pb-20 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 h-[36rem] w-full max-w-[100vw] -translate-x-1/2 rounded-full bg-[#772432]/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p style={{ color: TI_MAROON }} className="mb-4 text-xs font-bold uppercase tracking-[0.3em]">
            温馨社区 · 语你同行
          </p>
          <h1 className="font-chinese text-4xl font-black text-slate-900 sm:text-5xl">会友专栏</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">
            欢迎会员留下学习心得、例会感受与成长故事。这里不上传照片，只保留文字里的真诚与温度。
          </p>
          <div style={{ backgroundColor: TI_MAROON }} className="mx-auto mt-6 h-1.5 w-12 rounded-full opacity-20" />
        </motion.div>

        <div className="mb-24 space-y-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#772432]" />
              <p className="text-sm font-bold tracking-widest text-slate-400">载入中...</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((item) => (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[3rem] border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200/50 sm:p-12"
              >
                <Quote className="absolute -bottom-8 -right-8 h-48 w-48 rotate-12 text-[#772432]/5 pointer-events-none" />

                <div className="relative mb-8 border-b border-slate-50 pb-8">
                  <div className="mb-5 flex items-center gap-5">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[2rem] border-2 border-[#772432] bg-white text-slate-200 shadow-xl">
                      <User size={36} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 style={{ color: TI_MAROON }} className="text-2xl font-black tracking-tight">
                          {item.name}
                        </h2>
                        <span className="h-2 w-2 rounded-full bg-slate-100" />
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{item.title}</p>
                      </div>
                    </div>
                  </div>

                  {item.summary && (
                    <p className="font-chinese text-3xl font-black italic leading-tight text-[#772432] sm:text-4xl">
                      {item.summary}
                    </p>
                  )}
                </div>

                <p className="relative z-10 whitespace-pre-wrap px-1 text-xl font-medium leading-relaxed tracking-wide text-slate-700 sm:text-2xl">
                  {item.message}
                </p>
              </motion.article>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-[#e8e8e8] bg-slate-50/80 p-6 shadow-sm backdrop-blur-sm sm:p-10">
          <div className="mb-8 flex items-center gap-3">
            <MessageCircle style={{ color: TI_MAROON }} size={24} />
            <h2 className="text-xl font-black text-slate-700">留下您的感言</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="您的姓名"
                className="w-full rounded-2xl border border-[#e8e8e8] bg-white px-6 py-4 outline-none transition-all focus:ring-2 ring-[#772432]/5"
              />
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="身份 / 荣衔"
                className="w-full rounded-2xl border border-[#e8e8e8] bg-white px-6 py-4 outline-none transition-all focus:ring-2 ring-[#772432]/5"
              />
            </div>

            <div className="relative">
              <input
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                maxLength={30}
                placeholder="输入一句感言金句..."
                className="w-full rounded-2xl border border-[#e8e8e8] bg-white px-6 py-5 text-2xl font-black text-[#772432] outline-none transition-all focus:ring-2 ring-[#772432]/10"
              />
              <Sparkles size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#772432]/20" />
            </div>

            <div className="relative">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="详细感言内容..."
                className="h-40 w-full resize-none rounded-2xl border border-[#e8e8e8] bg-white p-6 text-lg outline-none transition-all focus:ring-2 ring-[#772432]/5"
              />
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ backgroundColor: TI_MAROON }}
                className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl px-8 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? '发布中...' : '发布'} <Send size={16} />
              </button>
            </div>

            {status && <p className="text-xs font-bold text-[#772432]">{status}</p>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MemberColumn;
