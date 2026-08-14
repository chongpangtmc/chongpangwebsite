import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, CalendarDays, MapPin, Mic2, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroBg from '@/assets/hero-bg.jpg';

const HeroSection = () => {
  const { t } = useLanguage();

  const highlights = [
    { icon: <Mic2 className="w-5 h-5" />, label: t('华语演讲练习', 'Mandarin Speaking') },
    { icon: <Users className="w-5 h-5" />, label: t('领导力成长', 'Leadership Growth') },
    { icon: <Sparkles className="w-5 h-5" />, label: t('温暖学习社群', 'Supportive Community') },
  ];

  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-[#f8fafc] pt-28">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white/92 to-[#f7f2d8]/80" />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#772432]/15 bg-white/80 px-4 py-2 text-xs font-black tracking-widest text-[#772432] shadow-sm">
            CHONG PANG MANDARIN TOASTMASTERS CLUB
          </div>

          <h1 className="font-chinese text-5xl font-black leading-tight text-slate-950 sm:text-6xl lg:text-7xl">
            {t('忠邦华语演讲会', 'Chong Pang Mandarin TMC')}
          </h1>

          <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-600 sm:text-xl">
            {t(
              '忠邦华语演讲会是新加坡义顺的华语 Toastmasters 分会。在友善、积极、互相支持的环境中，练习华语演讲、即席表达与领导能力。欢迎每一位想把话说得更清楚、更有力量的朋友。',
              'Chong Pang Mandarin Toastmasters Club is a Singapore Mandarin Toastmasters club in Yishun. Practice Mandarin public speaking, table topics, and leadership skills in a warm, supportive club community.'
            )}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/contact"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#772432] px-7 text-sm font-black text-white shadow-xl shadow-[#772432]/20 transition hover:bg-[#631d2a]"
            >
              {t('预约参观例会', 'Visit a Meeting')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/resources"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 text-sm font-black text-slate-700 shadow-sm transition hover:border-[#006094]/30 hover:text-[#006094]"
            >
              {t('查看分会活动', 'View Activities')}
            </Link>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 px-4 py-4 text-sm font-bold text-slate-700 shadow-sm">
                <span className="text-[#006094]">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative"
        >
          <div className="rounded-[2rem] border border-white bg-white p-3 shadow-2xl shadow-slate-200">
            <div className="rounded-[1.5rem] bg-[#004165] p-8 text-white sm:p-10">
              <div className="mb-10 flex items-center justify-between gap-4">
                <img src="/tm-logo.png" alt="Toastmasters Logo" className="h-16 w-16 object-contain" />
                <div className="text-right">
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-[#F2DF74]">Where Leaders Are Made</p>
                  <p className="mt-2 text-sm text-white/60">District 80 · Singapore</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl bg-white/10 p-5">
                  <div className="mb-2 flex items-center gap-2 text-[#F2DF74]">
                    <CalendarDays className="h-5 w-5" />
                    <span className="text-sm font-black">{t('例会时间', 'Meeting Time')}</span>
                  </div>
                  <p className="text-2xl font-black">{t('每个月第一个星期二', 'First Tuesday Monthly')}</p>
                  <p className="mt-1 text-sm text-white/65">{t('欢迎来宾提前联系确认当月安排', 'Guests may confirm the monthly schedule before visiting')}</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <div className="mb-2 flex items-center gap-2 text-[#F2DF74]">
                    <MapPin className="h-5 w-5" />
                    <span className="text-sm font-black">{t('地点', 'Venue')}</span>
                  </div>
                  <p className="text-2xl font-black">Block 108 Yishun Ring Road</p>
                  <p className="mt-1 text-sm text-white/65">#01-301 (S)760108</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
