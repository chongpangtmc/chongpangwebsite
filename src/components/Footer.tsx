import { useLanguage } from '@/contexts/LanguageContext';
import { Heart, Facebook, Globe } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  // --- 颜色定义：与 Navbar 保持一致 ---
  const TI_BLUE = "#004165";       // 导航栏主色
  const TI_BLUE_DARK = "#00314a";  // 手机端菜单/深色背景色
  const TI_GOLD = "#F2DF74";       // 官方金黄色 (Navbar hover 颜色)
  const TI_MAROON = "#772432";     // 官方枣红

  return (
    <footer 
      style={{ backgroundColor: TI_BLUE }} 
      className="border-t border-[#00314a]/50 py-12 relative overflow-hidden"
    >
      {/* 底部装饰：增加一个微弱的渐变层，让底部看起来更有厚度 */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ background: `linear-gradient(to bottom, transparent, ${TI_BLUE_DARK}4d)` }}
      />

      <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
        {/* 标题 */}
        <p 
          style={{ color: TI_GOLD }} 
          className="font-chinese text-sm mb-3 tracking-widest font-bold"
        >
          {t('忠邦华语演讲会', 'Chong Pang Mandarin TMC')}
        </p>
        
        {/* 版权信息 */}
        <p className="text-white/40 text-xs flex items-center justify-center gap-1.5 mb-6">
          © 2026 · {t('用', 'Made with')} 
          <Heart 
            className="w-3.5 h-3.5" 
            style={{ color: TI_MAROON }} 
            fill={TI_MAROON} 
            fillOpacity="0.6"
          /> 
          {t('传递声音的力量', 'the power of voice')}
        </p>

        {/* --- 友情链接区域 --- */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mb-8 text-[11px] font-bold tracking-wider uppercase">
          <a 
            href="https://www.d80toastmasters.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/60 hover:text-[#F2DF74] transition-colors flex items-center gap-1.5"
          >
            <Globe size={12} /> District 80
          </a>
          <a 
            href="https://www.sgdivisionv.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/60 hover:text-[#F2DF74] transition-colors"
          >
            Division V
          </a>
          <a 
            href="https://divisionl.sg/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/60 hover:text-[#F2DF74] transition-colors"
          >
            Division L
          </a>
          
          <span className="w-px h-3 bg-white/10 hidden sm:block" /> {/* 分隔线 */}

          <a 
            href="https://www.facebook.com/cpmtmc" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/50 hover:text-[#F2DF74] transition-all hover:scale-110 flex items-center gap-1.5"
            title="Follow us on Facebook"
          >
            <Facebook size={16} fill="currentColor" fillOpacity="0.2" />
            <span className="sm:hidden text-[10px]">Facebook</span>
          </a>
        </div>

        {/* 口号 */}
        <div className="mb-8">
          <p className="text-white/30 text-[10px] font-medium uppercase tracking-[0.4em]">
            Where Leaders Are Made
          </p>
        </div>

        {/* --- 技术支持：哈啰狮城网 --- */}
        <div className="pt-6 border-t border-white/5">
          <p className="text-white/20 text-[11px] font-chinese">
            {t('本站技术支持由', 'Technical Support by ')}
            <a 
              href="https://www.facebook.com/hellosgweb" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: TI_GOLD }}
              className="mx-1 opacity-70 hover:opacity-100 transition-opacity underline underline-offset-4"
            >
              {t('哈啰狮城网', 'HelloSG.org')}
            </a>
            {t('提供', ' ')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
