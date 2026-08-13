import { motion } from 'framer-motion';
import { Award, Crown, Medal, MessageSquareQuote, Trophy } from 'lucide-react';

const contestLevels = ['分会', '分区', 'L区'];
const contestTypes = ['幽默演讲', '评论演讲', '备稿演讲', '即席演讲'];

const sampleAwards = [
  { year: '2026', level: '分会', type: '备稿演讲', first: '冠军姓名', second: '亚军姓名', third: '季军姓名' },
  { year: '2026', level: '分区', type: '即席演讲', first: '冠军姓名', second: '亚军姓名', third: '季军姓名' },
  { year: '2025', level: 'L区', type: '评论演讲', first: '冠军姓名', second: '亚军姓名', third: '季军姓名' },
];

const presidentMessages = [
  {
    term: '2025-2026',
    name: '历届会长姓名',
    message: '愿每一位后来者都记得，演讲不是为了证明自己完美，而是为了让真实的自己被听见。',
  },
  {
    term: '2024-2025',
    name: '历届会长姓名',
    message: '忠邦的力量来自每一次掌声、每一句建议、每一位愿意服务的会员。',
  },
];

const Heritage = () => {
  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-[#772432]">Legacy & Honors</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">荣誉与传承</h1>
          <p className="mt-5 text-base leading-8 text-slate-600">
            这里记录忠邦华语演讲会的比赛成绩、历届会长寄语，以及鼓励后辈继续前行的话语。
          </p>
        </motion.div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          <div className="rounded-[2rem] bg-[#004165] p-7 text-white shadow-xl shadow-slate-200">
            <Trophy className="mb-5 h-9 w-9 text-[#F2DF74]" />
            <h2 className="text-2xl font-black">历届演讲比赛三甲</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">按年份、比赛层级和演讲项目整理，形成分会的荣誉档案。</p>
          </div>
          <div className="rounded-[2rem] bg-[#772432] p-7 text-white shadow-xl shadow-slate-200">
            <MessageSquareQuote className="mb-5 h-9 w-9 text-[#F2DF74]" />
            <h2 className="text-2xl font-black">历届会长寄语</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">保留会长们对分会的祝福、经验与鼓励后辈的话。</p>
          </div>
        </div>

        <section className="mt-16 rounded-[2rem] border border-slate-100 bg-slate-50 p-6 sm:p-8">
          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-[#006094]">Contest Records</p>
              <h2 className="text-2xl font-black text-slate-950">比赛三甲名单</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {contestLevels.map((level) => <span key={level} className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">{level}</span>)}
              {contestTypes.map((type) => <span key={type} className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#772432]">{type}</span>)}
            </div>
          </div>

          <div className="grid gap-4">
            {sampleAwards.map((award) => (
              <article key={`${award.year}-${award.level}-${award.type}`} className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black text-[#772432]">{award.year} · {award.level}</p>
                    <h3 className="mt-1 text-xl font-black text-slate-900">{award.type}</h3>
                  </div>
                  <Award className="h-7 w-7 text-[#006094]" />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <Winner rank="冠军" name={award.first} tone="gold" />
                  <Winner rank="亚军" name={award.second} tone="blue" />
                  <Winner rank="季军" name={award.third} tone="slate" />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-8">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-[#772432]">President Messages</p>
            <h2 className="text-2xl font-black text-slate-950">历届会长感言与鼓励</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {presidentMessages.map((item) => (
              <article key={`${item.term}-${item.name}`} className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-sm">
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#772432]/10 text-[#772432]">
                    <Crown className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#006094]">{item.term}</p>
                    <h3 className="text-lg font-black text-slate-900">{item.name}</h3>
                  </div>
                </div>
                <p className="text-sm leading-7 text-slate-600">{item.message}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
};

const Winner = ({ rank, name, tone }: { rank: string; name: string; tone: 'gold' | 'blue' | 'slate' }) => {
  const styles = {
    gold: 'bg-[#F2DF74]/30 text-[#772432]',
    blue: 'bg-[#006094]/10 text-[#006094]',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className={`rounded-2xl p-4 ${styles[tone]}`}>
      <div className="mb-2 flex items-center gap-2">
        <Medal className="h-4 w-4" />
        <p className="text-xs font-black">{rank}</p>
      </div>
      <p className="text-base font-black">{name}</p>
    </div>
  );
};

export default Heritage;
