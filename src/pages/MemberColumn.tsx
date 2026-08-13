import { motion } from 'framer-motion';
import { BookOpenText, MessageCircleHeart, Mic2, Quote, UserRound } from 'lucide-react';

const memberStories = [
  {
    name: '会员姓名',
    role: '忠邦会员',
    type: '三言两语',
    quote: '在这里，我学会把心里的想法说得更清楚，也更勇敢地站在人前表达自己。',
  },
  {
    name: '会员姓名',
    role: '新会员心得',
    type: '会友感言',
    quote: '每一次例会都是一次小小的练习。有人聆听，有人鼓励，也有人真诚地给建议。',
  },
  {
    name: '会员姓名',
    role: '演讲成长故事',
    type: '成长故事',
    quote: '从第一次紧张到忘词，到后来愿意参加比赛，这段路不是一个人走完的。',
  },
];

const featureCards = [
  {
    icon: MessageCircleHeart,
    title: '三言两语',
    text: '会员照片、姓名与几句话，适合快速展示每位会员的声音。',
  },
  {
    icon: BookOpenText,
    title: '会友感言',
    text: '较完整的学习心得、入会感受、例会体验与个人成长故事。',
  },
  {
    icon: Mic2,
    title: '演讲成长故事',
    text: '记录会员参加比赛、担任会议角色、突破表达关卡的历程。',
  },
];

const MemberColumn = () => {
  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-[#772432]">Member Voices</p>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">会友专栏</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              这里收集会员的感言、心得与成长故事。每一段真诚分享，都是给后来者的一盏灯。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="rounded-[2rem] bg-[#004165] p-7 text-white shadow-xl shadow-slate-200"
          >
            <Quote className="mb-5 h-9 w-9 text-[#F2DF74]" />
            <p className="text-xl font-black leading-9">
              “一个演讲会最珍贵的地方，不只是舞台，而是每个人都愿意陪你慢慢变好。”
            </p>
          </motion.div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {featureCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-6"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#006094] shadow-sm">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-black text-slate-900">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.text}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 rounded-[2rem] border border-slate-100 bg-slate-50 p-6 sm:p-8">
          <div className="mb-7">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-[#006094]">Story Wall</p>
            <h2 className="text-2xl font-black text-slate-950">会员分享展示</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {memberStories.map((story) => (
              <article key={`${story.type}-${story.name}`} className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-[#772432]">
                    <UserRound className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#772432]">{story.type}</p>
                    <h3 className="text-lg font-black text-slate-900">{story.name}</h3>
                    <p className="text-xs font-bold text-slate-400">{story.role}</p>
                  </div>
                </div>
                <p className="text-sm leading-7 text-slate-600">{story.quote}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MemberColumn;
