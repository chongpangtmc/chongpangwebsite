import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MessageCircle, Quote, Send, Sparkles, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const SUPABASE_URL = 'https://ymkokxoxsbaediacqqvr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WBjtKR_5kGq-RNBxv01ikA_DQKeH7Wh';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type ExecutiveMessage = {
  id: string | number;
  name: string;
  title: string;
  summary?: string;
  message: string;
  avatar?: string | null;
};

type ExecutiveMessagesProps = {
  embedded?: boolean;
};

const ExecutiveMessages = ({ embedded = false }: ExecutiveMessagesProps) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [msg, setMsg] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [messages, setMessages] = useState<ExecutiveMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const TI_MAROON = '#772432';
  const TI_BLUE = '#004165';

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('executive_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    } catch (err) {
      console.error('Fetch executive messages error:', err);
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 220;
        const scaleSize = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('图片太大，请选择 2MB 以下的图片');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result as string);
      setAvatar(compressed);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async () => {
    if (!name.trim() || !msg.trim()) {
      alert('请完整填写姓名和感言内容');
      return;
    }

    const newMessageData = {
      name,
      title: title || t('执委', 'Committee Member'),
      summary,
      message: msg,
      date: new Date().toLocaleDateString('zh-CN'),
      avatar,
      is_featured: false,
    };

    const { data, error } = await supabase
      .from('executive_messages')
      .insert([newMessageData])
      .select();

    if (error) {
      alert('发布失败，请确认后台 executive_messages 数据表已建立');
    } else if (data) {
      setMessages([...messages, data[0]]);
      setName('');
      setTitle('');
      setSummary('');
      setMsg('');
      setAvatar(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className={`${embedded ? 'bg-white relative overflow-hidden' : 'pt-28 pb-24 bg-white relative min-h-screen overflow-hidden'}`}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[100vw] h-[40rem] bg-[#004165]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {!embedded && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <p style={{ color: TI_BLUE }} className="font-bold tracking-[0.3em] uppercase text-xs mb-4">
              {t('执委心声 · 服务同行', 'Committee Voices')}
            </p>
            <h2 className="font-chinese text-4xl sm:text-5xl font-black mb-6 text-slate-900">
              {t('执委感言', 'Committee Messages')}
            </h2>
            <div style={{ backgroundColor: TI_BLUE }} className="w-12 h-1.5 mx-auto rounded-full opacity-20" />
          </motion.div>
        )}

        <div className="space-y-16 mb-24">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-[#004165] rounded-full animate-spin mb-4" />
              <div className="text-slate-400 font-bold tracking-widest animate-pulse">载入中...</div>
            </div>
          ) : messages.length > 0 ? (
            <AnimatePresence>
              {messages.map((m) => (
                <motion.div key={m.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3rem] border border-slate-100 p-8 sm:p-14 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                  <Quote className="absolute -bottom-8 -right-8 w-48 h-48 text-[#004165]/5 rotate-12 pointer-events-none" />

                  <div className="flex flex-col sm:flex-row items-start gap-8 mb-10 pb-10 border-b border-slate-50 relative">
                    <div style={{ borderColor: TI_BLUE }} className="w-24 h-24 rounded-[2.5rem] border-2 p-1.5 shrink-0 overflow-hidden bg-white shadow-2xl flex items-center justify-center">
                      {m.avatar ? <img src={m.avatar} className="w-full h-full object-cover rounded-[2rem]" alt={m.name} /> : <User size={40} className="text-slate-100" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <h4 style={{ color: TI_BLUE }} className="text-2xl font-black tracking-tight">{m.name}</h4>
                        <span className="w-2 h-2 rounded-full bg-slate-100" />
                        <p className="text-slate-400 text-sm font-black tracking-[0.2em] uppercase opacity-70">{m.title}</p>
                      </div>

                      {m.summary && (
                        <span className="relative text-3xl sm:text-4xl font-chinese font-black text-[#004165] italic leading-[1.2] block tracking-tight">
                          {m.summary}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative z-10 px-2 sm:px-4">
                    <p className="text-xl sm:text-2xl leading-relaxed whitespace-pre-wrap font-medium opacity-90 tracking-wide text-slate-700">
                      {m.message}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-slate-100">
              <p className="text-slate-400 font-bold">{t('暂无执委感言', 'No committee messages yet')}</p>
            </div>
          )}
        </div>

        <div className="bg-slate-50/80 backdrop-blur-sm rounded-[2.5rem] border border-[#e8e8e8] p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="mb-8 flex items-center gap-3">
            <MessageCircle style={{ color: TI_BLUE }} size={24} />
            <h3 className="text-xl font-black text-slate-700">{t('留下执委感言', 'Leave a Committee Message')}</h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="flex flex-col items-center gap-3">
              <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-3xl bg-white border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-[#004165] transition-all overflow-hidden relative group shadow-sm">
                {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="预览照片" /> : <Camera size={24} className="text-slate-300" />}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-[10px] text-white font-bold">上传照片</span>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">照片(可选)</span>
            </div>

            <div className="flex-1 w-full space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('您的姓名', 'Your Name')} className="w-full bg-white border border-[#e8e8e8] rounded-2xl py-4 px-6 outline-none focus:ring-2 ring-[#004165]/5 transition-all" />
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('职务/荣衔', 'Role / Title')} className="w-full bg-white border border-[#e8e8e8] rounded-2xl py-4 px-6 outline-none focus:ring-2 ring-[#004165]/5 transition-all" />
              </div>

              <div className="relative">
                <input value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={30} placeholder={t('输入感言精简金句...', 'Summary sentence...')} className="w-full bg-white border border-[#e8e8e8] rounded-2xl py-5 px-6 outline-none focus:ring-2 ring-[#004165]/10 transition-all font-black text-2xl text-[#004165]" />
                <Sparkles size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#004165]/20" />
              </div>

              <div className="relative">
                <textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={t('详细感言内容...', 'Details...')} className="w-full bg-white border border-[#e8e8e8] rounded-2xl p-6 outline-none focus:ring-2 ring-[#004165]/5 transition-all resize-none h-32 text-lg" />
                <button onClick={handleSendMessage} style={{ backgroundColor: TI_MAROON }} className="absolute bottom-4 right-4 px-8 py-3 rounded-xl text-white font-bold hover:scale-105 transition-all shadow-lg flex items-center gap-2">
                  {t('发布', 'Post')} <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExecutiveMessages;
