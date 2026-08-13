import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, Camera, ImagePlus, Mic2, Trophy, Users } from 'lucide-react';

const activities = [
  {
    icon: Mic2,
    zhTitle: '常规例会',
    enTitle: 'Club Meetings',
    zhText: '备稿演讲、即席演讲、评论环节与会议角色练习。',
    enText: 'Prepared speeches, table topics, evaluations, and meeting roles.',
  },
  {
    icon: Trophy,
    zhTitle: '演讲比赛',
    enTitle: 'Speech Contests',
    zhText: '国际演讲、幽默演讲、即席演讲等比赛训练与展示。',
    enText: 'Contest practice and showcases for different speech categories.',
  },
  {
    icon: Users,
    zhTitle: '会员交流',
    enTitle: 'Member Fellowship',
    zhText: '在轻松交流中建立信任，也让学习更有温度。',
    enText: 'Build friendship and trust through informal fellowship.',
  },
  {
    icon: Calendar,
    zhTitle: '特别活动',
    enTitle: 'Special Events',
    zhText: '工作坊、联合例会、节庆聚会与社区活动。',
    enText: 'Workshops, joint meetings, festive events, and community activities.',
  },
];

const sampleAlbums = [
  { year: '2026', title: '新年度执委与会员合影', count: 12 },
  { year: '2026', title: '华语演讲例会', count: 18 },
  { year: '2025', title: '会员交流与特别活动', count: 24 },
];

const ResourcesSection = () => {
  const { t } = useLanguage();

  return (
    <section className="min-h-screen bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 max-w-3xl">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-[#772432]">Activities & Gallery</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">{t('分会活动', 'Club Activities')}</h1>
          <p className="mt-5 text-base leading-7 text-slate-600">
            {t(
              '这里会展示忠邦华语讲演会的例会、比赛、工作坊与会员活动。第一版先放栏目结构，接上 Cloudflare R2 后就可以从后台上传照片。',
              'This page will show meetings, contests, workshops, and member activities. Once Cloudflare R2 is connected, photos can be uploaded from the admin area.'
            )}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <motion.div
                key={activity.zhTitle}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-6"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#006094] shadow-sm">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900">{t(activity.zhTitle, activity.enTitle)}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{t(activity.zhText, activity.enText)}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 rounded-[2rem] border border-slate-100 bg-slate-50 p-6 sm:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-[#006094]">{t('相册预留区', 'Gallery Placeholder')}</p>
              <h2 className="text-2xl font-black text-slate-950">{t('活动照片', 'Activity Photos')}</h2>
            </div>
            <a href="/admin" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#772432] px-5 py-3 text-sm font-black text-white">
              <ImagePlus className="h-4 w-4" />
              {t('进入后台上传', 'Upload in Admin')}
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {sampleAlbums.map((album) => (
              <div key={album.title} className="overflow-hidden rounded-3xl border border-white bg-white shadow-sm">
                <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[#004165] to-[#772432] text-white">
                  <Camera className="h-12 w-12 opacity-80" />
                </div>
                <div className="p-5">
                  <p className="text-xs font-black text-[#772432]">{album.year}</p>
                  <h3 className="mt-1 text-lg font-black text-slate-900">{album.title}</h3>
                  <p className="mt-2 text-sm font-medium text-slate-400">{album.count} photos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
