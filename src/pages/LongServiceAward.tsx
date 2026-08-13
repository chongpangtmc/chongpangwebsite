import { motion } from 'framer-motion';
import { Award, CalendarDays, HeartHandshake, Medal, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const milestones = [
  { years: '5', zh: '五年服务奖', en: '5-Year Service Award' },
  { years: '10', zh: '十年服务奖', en: '10-Year Service Award' },
  { years: '15+', zh: '长期贡献奖', en: 'Longstanding Contribution Award' },
];

const LongServiceAward = () => {
  const { t } = useLanguage();
  const TI_BLUE = '#004165';
  const TI_MAROON = '#772432';

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <section className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-sm"
        >
          <div
            className="absolute inset-x-0 top-0 h-2"
            style={{ background: `linear-gradient(90deg, ${TI_BLUE}, ${TI_MAROON}, #F2DF74)` }}
          />
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 p-8 sm:p-12 lg:p-14 items-center">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Award size={18} style={{ color: TI_MAROON }} />
                <p style={{ color: TI_MAROON }} className="font-black tracking-[0.18em] uppercase text-xs">
                  {t('荣耀与传承', 'Honour and Legacy')}
                </p>
              </div>
              <h1 style={{ color: TI_BLUE }} className="text-4xl sm:text-5xl font-black leading-tight mb-6">
                {t('长期服务奖', 'Long Service Award')}
              </h1>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                {t(
                  '感谢长期陪伴友诺士华语讲演会成长的会友与领袖。每一份持续服务，都是分会精神得以延续的重要力量。',
                  'Celebrating members and leaders whose steady service has helped Eunos Mandarin Toastmasters Club grow with purpose and heart.'
                )}
              </p>
            </div>

            <div className="bg-slate-50 rounded-[1.5rem] border border-slate-100 p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: TI_BLUE }}>
                  <Medal size={30} />
                </div>
                <div>
                  <h2 className="text-slate-900 text-xl font-black">
                    {t('表扬持续贡献', 'Recognising Steady Contribution')}
                  </h2>
                  <p className="text-slate-500 text-sm font-bold">
                    {t('友诺士华语讲演会', 'Eunos Mandarin TMC')}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {milestones.map((item) => (
                  <div key={item.years} className="flex items-center justify-between rounded-2xl bg-white border border-slate-100 p-4">
                    <div>
                      <p className="text-slate-900 font-black">{t(item.zh, item.en)}</p>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                        {t('服务年资', 'Years of Service')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span style={{ color: TI_MAROON }} className="text-3xl font-black">{item.years}</span>
                      <span className="text-slate-400 font-bold ml-1">{t('年', 'yrs')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {[
            {
              icon: CalendarDays,
              zhTitle: '记录岁月',
              enTitle: 'Years Remembered',
              zhText: '珍藏会友一路参与例会、活动、训练与服务的足迹。',
              enText: 'Preserving the journeys of members through meetings, events, training and service.',
            },
            {
              icon: HeartHandshake,
              zhTitle: '感谢付出',
              enTitle: 'Gratitude in Action',
              zhText: '向默默耕耘、支持分会运作的长期伙伴表达谢意。',
              enText: 'Thanking the steady hands and generous hearts behind the club.',
            },
            {
              icon: ShieldCheck,
              zhTitle: '传承精神',
              enTitle: 'Legacy Forward',
              zhText: '让服务、学习与领导力的精神继续影响下一代会友。',
              enText: 'Carrying the spirit of service, learning and leadership to future members.',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.zhTitle}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                  <Icon size={24} />
                </div>
                <h3 className="text-slate-900 text-xl font-black mb-3">{t(card.zhTitle, card.enTitle)}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{t(card.zhText, card.enText)}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 flex flex-col sm:flex-row gap-5 sm:items-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-slate-900 text-xl font-black mb-2">
              {t('获奖名单即将更新', 'Awardee List Coming Soon')}
            </h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              {t(
                '待名单与照片整理完成后，此页面将继续补上长期服务奖得主资料。',
                'Recipient details and photos will be added here once the list is finalised.'
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LongServiceAward;
