import { useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, ChevronRight, Clock3, ExternalLink, FileText, Monitor, Settings, Timer, Vote, Zap } from 'lucide-react';

const ToolsPage = () => {
  const [activeTab, setActiveTab] = useState('meeting');

  const menuItems = [
    { id: 'meeting', label: '例会资料', icon: <FileText size={18} /> },
    { id: 'timer', label: '计时工具', icon: <Timer size={18} /> },
    { id: 'voting', label: '投选工具', icon: <Vote size={18} /> },
    { id: 'impromptu', label: '即席工具', icon: <Zap size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row">
          <aside className="md:w-64 shrink-0">
            <div className="sticky top-28 space-y-2">
              <h1 className="mb-6 px-4 text-2xl font-black tracking-tight text-slate-800">资料和工具</h1>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center justify-between rounded-2xl px-5 py-4 transition-all duration-300 ${
                    activeTab === item.id
                      ? 'scale-[1.02] bg-[#006094] text-white shadow-lg shadow-[#006094]/20'
                      : 'border border-slate-100 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3 font-bold">
                    {item.icon}
                    {item.label}
                  </div>
                  {activeTab === item.id && (
                    <motion.div layoutId="arrow">
                      <ChevronRight size={16} />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </aside>

          <main className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="min-h-[560px] rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm md:p-10"
              >
                {activeTab === 'meeting' && (
                  <div>
                    <Header color="bg-[#772432]" title="例会资料" />
                    <div className="grid gap-4">
                      {['会员手册', '会议议程模板', '演讲作业说明', '来宾介绍资料'].map((name) => (
                        <div key={name} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5">
                          <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-white p-3 text-[#772432] shadow-sm">
                              <FileText size={24} />
                            </div>
                            <div>
                              <p className="text-lg font-bold text-slate-700">{name}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">待上传</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-400">Coming soon</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'timer' && (
                  <div>
                    <Header color="bg-green-500" title="计时工具与背景" />
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                      {[
                        { color: 'green', label: '绿灯', hex: '#28a745', img: '/timer-green.jpg' },
                        { color: 'yellow', label: '黄灯', hex: '#ffc107', img: '/timer-yellow.jpg' },
                        { color: 'red', label: '红灯', hex: '#dc3545', img: '/timer-red.jpg' },
                      ].map((item) => (
                        <div key={item.color} className="space-y-4 text-center">
                          <div className="aspect-video rounded-3xl border-4 border-slate-50 shadow-inner" style={{ backgroundColor: item.hex }} />
                          <p className="font-black text-slate-700">{item.label}</p>
                          <a href={item.img} download={`Chongpang-Timer-${item.color}.jpg`} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3 text-xs font-black text-slate-600 hover:bg-[#006094] hover:text-white">
                            <Clock3 size={14} /> 下载背景
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'voting' && (
                  <div>
                    <Header color="bg-blue-500" title="在线投选系统" />
                    <ToolLink href="https://www.hellosg.org/vote?id=chongpang" icon={<Vote size={28} />} title="观众投票链接" desc="供现场会友与观众实时投票" color="text-[#006094]" />
                    <ToolLink href="https://www.hellosg.org/tm-vote?id=chongpang" icon={<Settings size={28} />} title="投票管理后台" desc="执委专用：设置候选人信息" color="text-[#772432]" />
                    <ToolLink href="https://www.hellosg.org/results?id=chongpang" icon={<BarChart3 size={28} />} title="实时结果查看" desc="查看现场投票结果" color="text-green-600" />
                  </div>
                )}

                {activeTab === 'impromptu' && (
                  <div>
                    <Header color="bg-orange-500" title="即席演讲工具" />
                    <ToolLink href="https://www.hellosg.org/impromptu-display?id=chongpang" icon={<Monitor size={28} />} title="即席主持展示页面" desc="投射在大屏幕或共享屏幕，展示即席题目" color="text-orange-500" />
                    <ToolLink href="https://www.hellosg.org/impromptu-admin?id=chongpang" icon={<Settings size={28} />} title="即席题目管理后台" desc="执委专用：预设、编辑和控制题目展示顺序" color="text-slate-800" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

const Header = ({ color, title }: { color: string; title: string }) => (
  <div className="mb-8">
    <h2 className="flex items-center gap-3 text-2xl font-black text-slate-800">
      <div className={`h-8 w-2 rounded-full ${color}`} />
      {title}
    </h2>
  </div>
);

const ToolLink = ({ href, icon, title, desc, color }: { href: string; icon: ReactNode; title: string; desc: string; color: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="mb-5 flex items-center justify-between rounded-[2rem] border-2 border-transparent bg-slate-50 p-6 shadow-sm transition-all hover:border-slate-200 hover:bg-white">
    <div className="flex items-center gap-6">
      <div className={`rounded-2xl bg-white p-5 shadow-sm ${color}`}>{icon}</div>
      <div>
        <p className="text-xl font-black text-slate-800">{title}</p>
        <p className="mt-1 text-slate-500">{desc}</p>
      </div>
    </div>
    <ExternalLink className="text-slate-300" size={24} />
  </a>
);

export default ToolsPage;
