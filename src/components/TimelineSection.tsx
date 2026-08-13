import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Award, BookOpen, Camera, MessageSquareText, ShieldCheck, Users } from 'lucide-react';

const sections = [
  {
    icon: Users,
    zhTitle: '分会介绍',
    enTitle: 'About the Club',
    zhText: '介绍忠邦华语演讲会的使命、例会形式与学习氛围。',
    enText: 'Introduce the club mission, meeting format, and learning culture.',
  },
  {
    icon: ShieldCheck,
    zhTitle: '执委团队',
    enTitle: 'Committee',
    zhText: '展示现任执委、职责分工与历届服务团队照片。',
    enText: 'Show the current committee, roles, and past committee photos.',
  },
  {
    icon: Award,
    zhTitle: '历届会长',
    enTitle: 'Past Presidents',
    zhText: '记录历届会长与分会传承。',
    enText: 'Document past presidents and the club legacy.',
  },
  {
    icon: MessageSquareText,
    zhTitle: '会员专栏',
    enTitle: 'Member Column',
    zhText: '发布会员心得、演讲感言和成长故事。',
    enText: 'Publish member reflections, speeches, and growth stories.',
  },
  {
    icon: Camera,
    zhTitle: '活动相册',
    enTitle: 'Gallery',
    zhText: '后台上传照片后，可按活动与年份展示。',
    enText: 'Upload photos and display them by event and year.',
  },
  {
    icon: BookOpen,
    zhTitle: '资料工具',
    enTitle: 'Resources',
    zhText: '整理例会计时、投票、即席题库与会员资料。',
    enText: 'Organize meeting timers, voting tools, topics, and club resources.',
  },
];

const TimelineSection = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-[#772432]">
            {t('网站第一版规划', 'First Version Structure')}
          </p>
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {t('一个适合长期维护的演讲会官网', 'A club website built for long-term use')}
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {t(
              '先把官网骨架、内容栏目和后台入口打稳；之后只需要通过后台更新照片、文字和活动资料。',
              'Start with a solid structure, content sections, and admin entry; later updates can happen through the admin area.'
            )}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.zhTitle}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-6 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#006094] shadow-sm">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900">{t(item.zhTitle, item.enTitle)}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{t(item.zhText, item.enText)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
