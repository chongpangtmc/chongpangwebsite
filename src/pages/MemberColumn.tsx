import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Image, MessageSquare, Quote, Star, Trophy, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const SUPABASE_URL = 'https://ymkokxoxsbaediacqqvr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WBjtKR_5kGq-RNBxv01ikA_DQKeH7Wh';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type MemberShort = {
  id: string | number;
  name: string;
  photo_url: string;
  quote: string;
  title?: string;
  sort_order?: number;
};

type LongServiceAward = {
  id: string | number;
  award_name: string;
  member_name: string;
  photo_url: string;
  description?: string;
  year?: string;
  sort_order?: number;
};

const MemberColumn = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'shorts' | 'awards'>('shorts');
  const [shorts, setShorts] = useState<MemberShort[]>([]);
  const [awards, setAwards] = useState<LongServiceAward[]>([]);
  const [loading, setLoading] = useState(true);

  const TI_BLUE = '#004165';
  const TI_MAROON = '#772432';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [{ data: shortData }, { data: awardData }] = await Promise.all([
        supabase
          .from('member_shorts')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false }),
        supabase
          .from('long_service_awards')
          .select('*')
          .order('year', { ascending: false })
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false }),
      ]);

      setShorts(shortData || []);
      setAwards(awardData || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="pt-28 pb-24 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p style={{ color: TI_MAROON }} className="font-bold tracking-[0.3em] uppercase text-xs mb-4">
            {t('会友风采 · 语你同行', 'Member Stories')}
          </p>
          <h1 style={{ color: TI_BLUE }} className="font-chinese text-4xl sm:text-5xl font-black mb-6">
            {t('会友专栏', 'Member Column')}
          </h1>
          <div style={{ backgroundColor: TI_BLUE }} className="w-12 h-1.5 mx-auto rounded-full opacity-20" />
        </motion.div>

        <div className="mb-12 flex flex-col sm:flex-row gap-3 justify-center">
          {[
            { id: 'shorts', zh: '三言两语', en: 'In a Few Words', icon: MessageSquare },
            { id: 'awards', zh: '长期服务奖', en: 'Long Service Award', icon: Award },
          ].map((item) => {
            const Icon = item.icon;
            const selected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as 'shorts' | 'awards')}
                style={{ backgroundColor: selected ? TI_BLUE : 'white', color: selected ? 'white' : '#475569' }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-100 px-6 py-4 font-black shadow-sm transition-all hover:shadow-md"
              >
                <Icon size={18} />
                {t(item.zh, item.en)}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'shorts' ? (
            <motion.div key="shorts" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
              {loading ? (
                <div className="py-24 text-center text-slate-400 font-bold animate-pulse">载入中...</div>
              ) : shorts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shorts.map((item) => (
                    <article key={item.id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm relative overflow-hidden">
                      <Quote className="absolute right-5 top-5 text-slate-100" size={42} />
                      <div className="flex items-center gap-4 mb-5 relative z-10">
                        <div className="w-20 h-20 rounded-3xl overflow-hidden bg-slate-100 border-4 border-white shadow-sm">
                          {item.photo_url ? <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" /> : <User className="w-full h-full p-4 text-slate-300" />}
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-slate-900">{item.name}</h2>
                          {item.title && <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{item.title}</p>}
                        </div>
                      </div>
                      <p style={{ color: TI_BLUE }} className="text-xl font-black leading-relaxed italic relative z-10">
                        “{item.quote}”
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100">
                  <Image className="mx-auto mb-4 text-slate-300" size={36} />
                  <p className="text-slate-400 font-bold">{t('暂无三言两语内容', 'No member notes yet')}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="awards" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
              <div className="mb-8 bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: TI_MAROON }}>
                    <Trophy size={30} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{t('长期服务奖', 'Long Service Award')}</h2>
                    <p className="text-slate-500 leading-relaxed font-medium">
                      {t('感谢长期陪伴分会成长、持续服务与贡献的会友。', 'Recognising members whose steady service has helped the club grow.')}
                    </p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="py-24 text-center text-slate-400 font-bold animate-pulse">载入中...</div>
              ) : awards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {awards.map((award) => (
                    <article key={award.id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                      <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                        <img src={award.photo_url} alt={award.member_name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Star size={16} className="text-amber-500 fill-amber-500" />
                          <p style={{ color: TI_MAROON }} className="text-sm font-black uppercase tracking-wider">{award.award_name}</p>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">{award.member_name}</h3>
                        {award.year && <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{award.year}</p>}
                        {award.description && <p className="text-slate-500 leading-relaxed font-medium">{award.description}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100">
                  <Award className="mx-auto mb-4 text-slate-300" size={36} />
                  <p className="text-slate-400 font-bold">{t('暂无长期服务奖资料', 'No long service award records yet')}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MemberColumn;
