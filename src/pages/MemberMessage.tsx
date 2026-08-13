import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Quote, Camera, User, Sparkles } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase
const SUPABASE_URL = 'https://ymkokxoxsbaediacqqvr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WBjtKR_5kGq-RNBxv01ikA_DQKeH7Wh';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MemberMessage = () => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState(''); 
  const [msg, setMsg] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null); 
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const THEME_COLOR = "#004165"; 

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('member_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setMessages(data);
    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("图片太大，请选择 1MB 以下的图片");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if (!name.trim() || !msg.trim()) {
      alert("请完整填写姓名和感言内容");
      return;
    }

    const { data, error } = await supabase
      .from('member_messages')
      .insert([{
        name,
        title: title || t('会友', 'Member'),
        summary,
        message: msg,
        avatar
      }])
      .select();

    if (error) {
      alert("发布失败");
    } else {
      setMessages([data[0], ...messages]); 
      setName(''); setTitle(''); setSummary(''); setMsg(''); setAvatar(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* --- 30周年特别公告栏 --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-8 rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 relative overflow-hidden shadow-md"
        >
          {/* 背景装饰数字 30 */}
          <span className="absolute -right-2 -bottom-8 text-9xl font-black text-amber-500/10 italic select-none pointer-events-none">
            30
          </span>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            <div className="bg-amber-500 p-4 rounded-2xl text-white shadow-lg shadow-amber-200 flex-shrink-0">
              <Sparkles size={32} className="animate-pulse" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-amber-900 font-black text-2xl mb-2">
                {t('三十周年 · 语你同行', '30th Anniversary Celebration')}
              </h3>
              <p className="text-amber-800/90 leading-relaxed font-medium text-lg">
                {t(
                  '欣逢友诺士华语讲演会 30 周年，诚邀国际讲演会的所有会友留下您的真诚祝福，无论您身在何方，您的每一份祝福都是对我们最大的鼓励。让我们一起续写讲演精神的新篇章！', 
                  'We welcome all Toastmasters to share your blessings for our 30th Anniversary. Let’s pass on the spirit of Toastmasters together!'
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 头部标题 */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-16">
          <h2 style={{ color: THEME_COLOR }} className="text-4xl font-black mb-4">
            {t('会友园地', 'Member Hub')}
          </h2>
          <p className="text-slate-500 font-medium">
            {t('分享您的成长点滴，记录每一份讲演的感动', 'Share your journey and speech moments')}
          </p>
        </motion.div>

        {/* 留言列表 */}
        <div className="space-y-8 mb-20">
          {loading ? (
            <div className="text-center py-10 text-slate-400 animate-pulse font-bold">加载中...</div>
          ) : (
            <AnimatePresence mode='popLayout'>
              {messages.map((m) => (
                <motion.div 
                  key={m.id} 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden"
                >
                  <Quote className="absolute top-6 right-8 w-12 h-12 text-slate-50" />
                  <div className="flex gap-6 items-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                      {m.avatar ? (
                        <img src={m.avatar} className="w-full h-full object-cover" alt={m.name} />
                      ) : (
                        <User className="w-full h-full p-3 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-800">{m.name}</h4>
                      <p className="text-sm text-slate-400 uppercase tracking-wider font-bold">{m.title}</p>
                    </div>
                  </div>
                  {m.summary && (
                    <p style={{ color: THEME_COLOR }} className="text-xl font-black mb-4 italic leading-snug">
                      "{m.summary}"
                    </p>
                  )}
                  <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                    {m.message}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* 发布表单 */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-blue-50">
          <div className="flex items-center gap-3 mb-8">
            <MessageSquare className="text-blue-600" />
            <h3 className="text-2xl font-black text-slate-800">{t('我也要分享', 'Join the Conversation')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center gap-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-all overflow-hidden relative group"
              >
                {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <Camera className="text-slate-300" />}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold">上传</div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              <p className="text-[10px] text-slate-400 font-bold uppercase">个人照片（可选）</p>
            </div>

            <div className="md:col-span-3 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input value={name} onChange={e => setName(e.target.value)} placeholder={t('姓名', 'Name')} className="w-full bg-slate-50 rounded-xl py-3 px-5 outline-none focus:ring-2 ring-blue-100 border-none font-medium" />
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('荣衔/分会 (如: 会员/友诺士)', 'Title/Club')} className="w-full bg-slate-50 rounded-xl py-3 px-5 outline-none focus:ring-2 ring-blue-100 border-none font-medium" />
              </div>
              <div className="relative">
                <input value={summary} onChange={e => setSummary(e.target.value)} placeholder={t('感言标题 (30字以内)', 'Golden Quote')} className="w-full bg-slate-50 rounded-xl py-4 px-5 outline-none focus:ring-2 ring-blue-100 border-none font-bold text-blue-900" />
                <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-200 w-5 h-5" />
              </div>
              <div className="relative">
                <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder={t('说点祝福的话吧...', 'Blessings...')} className="w-full bg-slate-50 rounded-xl p-5 outline-none focus:ring-2 ring-blue-100 border-none h-32 resize-none font-medium" />
                <button 
                  onClick={handleSendMessage}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 group"
                >
                  {t('立即发布', 'Post Now')} 
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberMessage;
