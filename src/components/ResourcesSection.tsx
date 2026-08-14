import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Camera, History, Layers, Loader2, Maximize2, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type ResourcePhoto = {
  id: string;
  url: string;
  year: string;
  category: string;
  title: string;
  sort_order: number;
};

type Album = {
  title: string;
  year: string;
  category: string;
  cover: string;
  images: string[];
};

const categories = [
  { id: 'all', zh: '全部', en: 'All' },
  { id: 'meeting', zh: '例会', en: 'Meetings' },
  { id: 'contest', zh: '演讲比赛', en: 'Contests' },
  { id: 'workshop', zh: '工作坊', en: 'Workshops' },
  { id: 'social', zh: '康乐活动', en: 'Socials' },
  { id: 'others', zh: '其他', en: 'Others' },
];

const fallbackPhotos: ResourcePhoto[] = [
  { id: 'sample-1', url: '', year: '2026', category: 'meeting', title: '新年度例会', sort_order: 0 },
  { id: 'sample-2', url: '', year: '2026', category: 'contest', title: '华语演讲比赛', sort_order: 0 },
  { id: 'sample-3', url: '', year: '2025', category: 'social', title: '会员交流活动', sort_order: 0 },
];

const ResourcesSection = () => {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState<ResourcePhoto[]>(fallbackPhotos);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const readJson = async (response: Response) => {
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      throw new Error('分会活动接口还没有连接成功，请检查 Cloudflare Pages 的 D1 和 R2 绑定。');
    }

    return response.json();
  };

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const response = await fetch('/api/resource-photos');
        const data = await readJson(response);
        if (!response.ok) throw new Error(data.error || '分会活动暂时无法载入');
        setPhotos(data.photos?.length ? data.photos : fallbackPhotos);
      } catch (error) {
        setPhotos(fallbackPhotos);
        setStatus(error instanceof Error ? `${error.message} 当前显示示例内容。` : '当前显示示例内容。');
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, []);

  const years = useMemo(
    () => Array.from(new Set(photos.map((photo) => photo.year).filter(Boolean))).sort((a, b) => b.localeCompare(a)),
    [photos],
  );

  useEffect(() => {
    if (!years.length) {
      setSelectedYear('');
      return;
    }

    if (!selectedYear || !years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [selectedYear, years]);

  const albums = useMemo(() => {
    const filtered = photos
      .filter((photo) => photo.year === selectedYear)
      .filter((photo) => selectedCategory === 'all' || photo.category === selectedCategory)
      .sort((a, b) => a.sort_order - b.sort_order);

    const groups: Record<string, Album> = {};
    filtered.forEach((photo) => {
      const key = `${photo.year}-${photo.category}-${photo.title}`;
      if (!groups[key]) {
        groups[key] = {
          title: photo.title || '未命名活动',
          year: photo.year,
          category: photo.category,
          cover: photo.url,
          images: [],
        };
      }
      if (photo.url) groups[key].images.push(photo.url);
    });

    return Object.values(groups);
  }, [photos, selectedCategory, selectedYear]);

  return (
    <section id="resources" className="relative min-h-screen bg-white py-24">
      <div className="absolute left-0 top-0 h-40 w-full bg-gradient-to-b from-[#004165]/5 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <History size={16} className="text-[#772432]" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#772432]">Activities Archive</p>
          </div>
          <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">{t('分会活动', 'Club Activities')}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">
            {t('收藏忠邦华语演讲会的例会、比赛、工作坊与会员交流足迹。', 'A visual archive of Chong Pang Mandarin TMC meetings, contests, workshops, and fellowship.')}
          </p>
          {status && <p className="mt-4 text-xs font-bold text-[#772432]">{status}</p>}
        </div>

        <div className="mb-12 flex flex-col items-center justify-between gap-6 rounded-[2rem] border border-slate-100 bg-slate-50 p-4 shadow-sm sm:p-6 lg:flex-row">
          <div className="flex w-full items-center gap-4 lg:w-auto">
            <Calendar size={18} className="text-slate-500" />
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-black text-[#772432] outline-none lg:w-36"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year} 年度
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-full gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap rounded-xl border border-slate-100 px-5 py-2 text-xs font-bold shadow-sm transition-all sm:text-sm ${
                  selectedCategory === category.id ? 'bg-[#772432] text-white' : 'bg-white text-slate-500 hover:shadow-md'
                }`}
              >
                {t(category.zh, category.en)}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="mb-4 animate-spin text-[#772432]" />
              <p className="font-bold text-slate-400">正在载入分会活动...</p>
            </div>
          ) : albums.length > 0 ? (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => (
                <motion.div key={`${album.year}-${album.category}-${album.title}`} whileHover={{ y: -10 }} className="group cursor-pointer" onClick={() => setActiveAlbum(album)}>
                  <div className="relative aspect-[4/3]">
                    <div className="absolute inset-0 -z-10 translate-x-2 translate-y-2 rounded-[2rem] bg-slate-200 transition-transform group-hover:translate-x-3 group-hover:translate-y-3" />
                    <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-md">
                      {album.cover ? (
                        <img src={album.cover} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt={album.title} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#004165] to-[#772432] text-white">
                          <Camera className="h-12 w-12 opacity-80" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="scale-75 rounded-full bg-white/20 p-3 text-white backdrop-blur-md transition-transform group-hover:scale-100">
                          <Maximize2 size={24} />
                        </div>
                      </div>
                      <div className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full bg-black/70 px-4 py-1.5 text-[10px] font-black text-white backdrop-blur-md">
                        <Layers size={14} /> {album.images.length || 1} PHOTOS
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 px-2">
                    <h3 className="line-clamp-1 text-xl font-black text-slate-800 transition-colors group-hover:text-[#772432]">{album.title}</h3>
                    <div className="mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                      <Camera size={14} /> <span>Chong Pang Mandarin TMC</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center font-bold text-slate-300">
              该年度暂无内容存档
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {activeAlbum && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex flex-col bg-slate-900/98 backdrop-blur-2xl">
            <div className="flex items-start justify-between p-6 sm:p-10">
              <div className="text-white">
                <h2 className="mb-1 text-2xl font-black sm:text-3xl">{activeAlbum.title}</h2>
                <p className="text-sm font-medium uppercase tracking-tight text-slate-400">
                  {activeAlbum.year} ARCHIVE - {activeAlbum.images.length} ITEMS
                </p>
              </div>
              <button onClick={() => setActiveAlbum(null)} className="rounded-full bg-white/10 p-3 text-white transition-all hover:rotate-90 hover:bg-red-500 sm:p-4">
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-20">
              <div className="mx-auto max-w-7xl columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3 xl:columns-4">
                {activeAlbum.images.map((image, index) => (
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    key={`${image}-${index}`}
                    className="break-inside-avoid cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-white/5 shadow-2xl"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img src={image} className="block h-auto w-full transition-transform duration-500 hover:scale-105" alt={`${activeAlbum.title} - ${index + 1}`} loading="lazy" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 p-4 sm:p-10" onClick={() => setSelectedImage(null)}>
            <button onClick={() => setSelectedImage(null)} className="absolute right-6 top-6 rounded-full bg-white/10 p-4 text-white transition-all hover:bg-red-500">
              <X size={24} />
            </button>
            <motion.img initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} src={selectedImage} className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl" onClick={(event) => event.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ResourcesSection;
