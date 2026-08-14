import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, Mail, MapPin, MessageCircle, UserPlus } from 'lucide-react';

const getFirstTuesday = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay();
  const firstTuesday = (2 - firstDay + 7) % 7;
  return firstTuesday + 1;
};

const MeetingCalendar = () => {
  const { lang } = useLanguage();
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const meetingDate = useMemo(() => getFirstTuesday(year, month), [year, month]);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const monthNames = lang === 'zh'
    ? ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="w-full rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-black text-[#006094]">{monthNames[month]} {year}</span>
        <div className="flex gap-2">
          <button onClick={() => setViewDate(new Date(year, month - 1))} className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-50">←</button>
          <button onClick={() => setViewDate(new Date(year, month + 1))} className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-50">→</button>
        </div>
      </div>
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
        {(lang === 'zh' ? ['日', '一', '二', '三', '四', '五', '六'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']).map((day) => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {blanks.map((item) => <div key={`blank-${item}`} />)}
        {days.map((day) => (
          <div
            key={day}
            className={`flex aspect-square items-center justify-center rounded-xl text-xs ${
              day === meetingDate ? 'bg-[#772432] font-black text-white shadow-lg shadow-[#772432]/20' : 'text-slate-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>
      <p className="mt-4 border-t border-slate-100 pt-3 text-xs font-bold text-slate-500">
        {lang === 'zh' ? '例会日：每个月第一个星期二。' : 'Meeting day: first Tuesday of every month.'}
      </p>
    </div>
  );
};

const ContactSection = () => {
  const { t } = useLanguage();

  const contacts = [
    {
      icon: <Clock className="h-5 w-5" />,
      title: t('例会时间', 'Meeting Time'),
      value: t('每个月第一个星期二', 'First Tuesday Monthly'),
      note: '',
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: t('例会地点', 'Venue'),
      value: 'Block 108 Yishun Ring Road #01-301 (S)760108',
      note: t(
        '最快路径：从义顺地铁站往右出口出站，过马路来到 Blk 154 Bus Stop 59091，乘搭 812，三个站后在 Blk 137 下车，过马路就是 Blk 108。',
        'Fastest route: exit right from Yishun MRT, cross to Blk 154 Bus Stop 59091, take bus 812 for three stops, alight at Blk 137, then cross the road to Blk 108.'
      ),
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: t('联络邮箱', 'Email'),
      value: 'cp.mtmc@gmail.com',
      note: '',
    },
  ];

  return (
    <section id="contact" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#006094] text-white shadow-lg shadow-[#006094]/20">
              <UserPlus className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">{t('欢迎来宾参加例会', 'Guests Are Welcome')}</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              {t(
                '如果你正在寻找新加坡华语演讲会、华语讲演会或 Toastmasters 练习平台，欢迎先来义顺参加忠邦华语演讲会例会。第一次来不需要准备演讲，你可以先旁听，感受流程、气氛和会员之间的支持。',
                'If you are looking for a Singapore Mandarin Toastmasters club or a Mandarin public speaking practice platform, visit Chong Pang Mandarin TMC in Yishun. No prepared speech is needed for your first visit; come observe the meeting flow and supportive atmosphere.'
              )}
            </p>

            <div className="mt-8 grid gap-4">
              {contacts.map((item) => (
                <div key={item.title} className="flex gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-[#772432]">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{item.title}</p>
                    <p className="mt-1 text-lg font-black text-[#006094]">{item.value}</p>
                    {item.note && <p className="mt-1 text-xs font-medium text-slate-400">{item.note}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="mailto:cp.mtmc@gmail.com" className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#772432] px-6 py-4 text-sm font-black text-white">
                <MessageCircle className="h-4 w-4" />
                {t('联系报名参观', 'Contact to Visit')}
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="rounded-[2rem] border border-white bg-white/70 p-4 shadow-xl shadow-slate-200"
          >
            <MeetingCalendar />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
