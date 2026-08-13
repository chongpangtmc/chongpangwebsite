import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Images, Maximize2, MessageCircle, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ExecutiveMessages from './ExecutiveMessages';

const SUPABASE_URL = 'https://ymkokxoxsbaediacqqvr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WBjtKR_5kGq-RNBxv01ikA_DQKeH7Wh';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type CommitteePhoto = {
  id: string | number;
  year: string;
  title: string;
  url: string;
  sort_order?: number;
};

const ExecutiveColumn = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'committee' | 'messages'>('committee');
  const [photos, setPhotos] = useState<CommitteePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const TI_BLUE = '#004165';
  const TI_MAROON = '#772432';

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('executive_committee_photos')
          .select('*')
          .order('year', { ascending: false })
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (!error && data) {
          setPhotos(data);
        }
      } catch (err) {
        console.error('Fetch executive committee photos error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const groupedPhotos = useMemo(() => {
    const groups: Record<string, CommitteePhoto[]> = {};
    photos.forEach((photo) => {
      const key = `${photo.year}__${photo.title}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(photo);
    });

    return Object.entries(groups).map(([key, items]) => {
      const [year, title] = key.split('__');
      return { year, title, items };
    });
  }, [photos]);

  return (
    <div className="pt-28 pb-24 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p style={{ color: TI_MAROON }} className="font-bold tracking-[0.3em] uppercase text-xs mb-4">
            {t('服务团队 · 传承同行', 'Committee Column')}
          </p>
          <h1 className="font-chinese text-4xl sm:text-5xl font-black text-slate-900 mb-6">
            {t('执委专栏', 'Committee Column')}
          </h1>
          <div style={{ backgroundColor: TI_BLUE }} className="w-12 h-1.5 mx-auto rounded-full opacity-20" />
        </motion.div>

        <div className="mb-12 flex flex-col sm:flex-row gap-3 justify-center">
          {[
            { id: 'committee', zh: '历届执委', en: 'Past Committees', icon: Images },
            { id: 'messages', zh: '执委感言', en: 'Committee Messages', icon: MessageCircle },
          ].map((item) => {
            const Icon = item.icon;
            const selected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as 'committee' | 'messages')}
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
          {activeTab === 'committee' ? (
            <motion.div
              key="committee"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? (
                <div className="py-24 text-center text-slate-400 font-bold animate-pulse">载入中...</div>
              ) : groupedPhotos.length > 0 ? (
                <div className="space-y-12">
                  {groupedPhotos.map((group) => (
                    <section key={`${group.year}-${group.title}`} className="bg-slate-50 rounded-[2rem] border border-slate-100 p-5 sm:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
                        <div>
                          <p style={{ color: TI_MAROON }} className="text-xs font-black uppercase tracking-[0.2em] mb-2">{group.year}</p>
                          <h2 className="text-2xl font-black text-slate-900">{group.title}</h2>
                        </div>
                        <div className="text-slate-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                          <Camera size={14} /> {group.items.length} photos
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {group.items.map((photo) => (
                          <button
                            key={photo.id}
                            onClick={() => setSelectedImage(photo.url)}
                            className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm text-left"
                          >
                            <img src={photo.url} alt={photo.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 bg-white/20 backdrop-blur-md p-3 rounded-full text-white transition-opacity">
                                <Maximize2 size={22} />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <Camera className="mx-auto mb-4 text-slate-300" size={36} />
                  <p className="text-slate-400 font-bold">{t('暂无历届执委照片', 'No committee photos yet')}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <ExecutiveMessages embedded />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-4 sm:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-5 right-5 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors" onClick={() => setSelectedImage(null)}>
              <X size={24} />
            </button>
            <img src={selectedImage} alt="历届执委照片" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExecutiveColumn;
