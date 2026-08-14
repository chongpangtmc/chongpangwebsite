import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Crown, Medal, Trophy } from 'lucide-react';

type ContestAward = {
  id: string;
  year: string;
  level: string;
  type: string;
  first: string;
  second: string;
  third: string;
};

type PresidentMessage = {
  id: string;
  term: string;
  name: string;
  message: string;
};

const contestLevels = ['分会', '分区', 'L区'];
const contestTypes = ['幽默演讲', '评论演讲', '备稿演讲', '即席演讲'];

const fallbackAwards: ContestAward[] = [
  { id: 'sample-award-1', year: '2026', level: '分会', type: '幽默演讲', first: '冠军姓名', second: '亚军姓名', third: '季军姓名' },
  { id: 'sample-award-2', year: '2026', level: '分会', type: '评论演讲', first: '冠军姓名', second: '亚军姓名', third: '季军姓名' },
  { id: 'sample-award-3', year: '2026', level: '分区', type: '备稿演讲', first: '冠军姓名', second: '亚军姓名', third: '季军姓名' },
];

const fallbackPresidents: PresidentMessage[] = [
  {
    id: 'sample-president-1',
    term: '2025-2026',
    name: '历届会长姓名',
    message: '愿每一位后来者都记得，演讲不是为了证明自己完美，而是为了让真实的自己被听见。',
  },
  {
    id: 'sample-president-2',
    term: '2024-2025',
    name: '历届会长姓名',
    message: '忠邦的力量来自每一次掌声、每一句建议、每一位愿意服务的会员。',
  },
];

const Heritage = () => {
  const [awards, setAwards] = useState<ContestAward[]>(fallbackAwards);
  const [presidents, setPresidents] = useState<PresidentMessage[]>(fallbackPresidents);
  const [activeLevel, setActiveLevel] = useState(contestLevels[0]);
  const [activeType, setActiveType] = useState(contestTypes[0]);
  const [activeYear, setActiveYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const readJson = async (response: Response) => {
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      throw new Error('荣誉资料接口还没有连接成功，请检查 Cloudflare Pages 的 D1 绑定。');
    }

    return response.json();
  };

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const response = await fetch('/api/heritage-records');
        const data = await readJson(response);
        if (!response.ok) throw new Error(data.error || '荣誉资料暂时无法载入');
        setAwards(data.awards?.length ? data.awards : fallbackAwards);
        setPresidents(data.presidents?.length ? data.presidents : fallbackPresidents);
      } catch (error) {
        setAwards(fallbackAwards);
        setPresidents(fallbackPresidents);
        setStatus(error instanceof Error ? `${error.message} 当前显示示例内容。` : '当前显示示例内容。');
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, []);

  const awardYears = useMemo(
    () => Array.from(new Set(awards.map((award) => award.year).filter(Boolean))).sort((a, b) => b.localeCompare(a)),
    [awards],
  );

  useEffect(() => {
    if (!awardYears.length) {
      setActiveYear('');
      return;
    }

    if (!activeYear || !awardYears.includes(activeYear)) {
      setActiveYear(awardYears[0]);
    }
  }, [activeYear, awardYears]);

  const filteredAwards = useMemo(
    () => awards.filter((award) => award.level === activeLevel && award.type === activeType && (!activeYear || award.year === activeYear)),
    [activeLevel, activeType, activeYear, awards],
  );

  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-[#772432]">Legacy & Honors</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">荣誉与传承</h1>
          <p className="mt-5 text-base leading-8 text-slate-600">
            这里记录忠邦华语演讲会的演讲比赛三甲名单，以及历届会长给后辈的鼓励与祝福。
          </p>
          {status && <p className="mt-4 text-xs font-bold text-[#772432]">{status}</p>}
        </motion.div>

        <section className="mt-14 rounded-[2rem] border border-slate-100 bg-slate-50 p-5 sm:p-8">
          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#004165] text-[#F2DF74]">
                <Trophy className="h-6 w-6" />
              </div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-[#006094]">Contest Records</p>
              <h2 className="text-2xl font-black text-slate-950">历届演讲比赛三甲名单</h2>
            </div>
            {loading && <p className="text-sm font-bold text-slate-400">载入中...</p>}
          </div>

          <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl bg-white p-2 shadow-sm">
            {contestLevels.map((level) => (
              <button
                key={level}
                onClick={() => setActiveLevel(level)}
                className={`rounded-xl px-3 py-3 text-sm font-black transition ${
                  activeLevel === level ? 'bg-[#004165] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-white p-2 shadow-sm sm:grid-cols-4">
            {contestTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`rounded-xl px-3 py-3 text-sm font-black transition ${
                  activeType === type ? 'bg-[#772432] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="mb-8 rounded-2xl bg-white p-4 shadow-sm">
            <label htmlFor="contest-year" className="mb-2 block text-xs font-black uppercase tracking-[0.25em] text-slate-400">
              年度
            </label>
            <select
              id="contest-year"
              value={activeYear}
              onChange={(event) => setActiveYear(event.target.value)}
              className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 outline-none transition focus:ring-2 focus:ring-[#772432]/10 sm:max-w-xs"
            >
              {awardYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4">
            {filteredAwards.length ? (
              filteredAwards.map((award) => (
                <article key={award.id} className="rounded-3xl bg-white p-5 shadow-sm">
                  <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-black text-[#772432]">{award.year} · {award.level}</p>
                      <h3 className="mt-1 text-xl font-black text-slate-900">{award.type}</h3>
                    </div>
                    <Award className="h-7 w-7 text-[#006094]" />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <Winner rank="冠军" name={award.first || '待补充'} tone="gold" />
                    <Winner rank="亚军" name={award.second || '待补充'} tone="blue" />
                    <Winner rank="季军" name={award.third || '待补充'} tone="slate" />
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-3xl bg-white p-10 text-center">
                <p className="text-sm font-bold text-slate-400">这个分类还没有资料，可在后台新增。</p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-8">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#772432]/10 text-[#772432]">
              <Crown className="h-6 w-6" />
            </div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-[#772432]">President Messages</p>
            <h2 className="text-2xl font-black text-slate-950">历届会长感言与鼓励</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">忠邦十周年的传承，也来自每一届会长留下的服务精神与鼓励。</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {presidents.map((item) => (
              <article key={item.id} className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-sm">
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
