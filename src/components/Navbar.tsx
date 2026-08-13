import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { lang, toggle, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const TI_BLUE = "#004165";   
  const TI_BLUE_DARK = "#00314a"; 

  // 这里的图片路径请根据你的实际情况修改
  // 如果图片在 public/logo.png，直接写 "/logo.png"
  const LOGO_URL = "/tm-logo.png"; 

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const [today, setToday] = useState('');
  useEffect(() => {
    const date = new Date();
    const fullOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
    };
    setToday(date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', fullOptions));
  }, [lang]);

  const links = [
    { to: '/', label: t('首页', 'Home'), isAnchor: false },
    { to: '/resources', label: t('分会活动', 'Activities'), isAnchor: false },
    { to: '/tools', label: t('资料和工具', 'Tools'), isAnchor: false },
    { to: '/contact', label: t('联系我们', 'Contact'), isAnchor: false },
  ];

  return (
    <nav style={{ backgroundColor: `${TI_BLUE}f2` }} className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-md border-b border-[#00314a]/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 左侧 Logo + 文字区域 */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={LOGO_URL} 
              alt="Chong Pang Mandarin TMC Logo" 
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain"
            />
            <div className="flex flex-col justify-center">
              <span className="font-chinese text-white font-bold text-base sm:text-lg tracking-tight leading-tight group-hover:text-[#F2DF74] transition-colors">
                {t('忠邦华语演讲会', 'Chong Pang Mandarin TMC')}
              </span>
              <div className="flex items-center mt-0.5">
                <span className="text-white/40 text-[9px] font-medium tracking-wider uppercase">
                  {today}
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-5">
            {links.map(l => (
              l.isAnchor ? (
                <a key={l.to} href={l.to} className="text-white/90 hover:text-[#F2DF74] transition-colors text-xs lg:text-sm font-semibold tracking-wide">
                  {l.label}
                </a>
              ) : (
                <Link key={l.to} to={l.to} className="text-white/90 hover:text-[#F2DF74] transition-colors text-xs lg:text-sm font-semibold tracking-wide">
                  {l.label}
                </Link>
              )
            ))}
            <button onClick={toggle} className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/30 text-white hover:text-[#F2DF74] hover:border-[#F2DF74]/60 transition-all text-xs font-medium">
              <Globe className="w-3.5 h-3.5" />
              {lang === 'zh' ? 'EN' : '中文'}
            </button>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={toggle} className="text-white/60"><Globe className="w-4 h-4" /></button>
            <button 
              onClick={() => setOpen(!open)} 
              className="text-white p-2"
              aria-label="Toggle menu"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            style={{ backgroundColor: TI_BLUE_DARK }} 
            className="md:hidden overflow-hidden border-t border-white/10"
          >
            <div className="px-4 py-6 space-y-2 text-center">
              {links.map(l => (
                l.isAnchor ? (
                  <a 
                    key={l.to} 
                    href={l.to} 
                    onClick={() => setOpen(false)} 
                    className="block text-white/90 hover:text-[#F2DF74] font-bold py-3 border-b border-white/5 last:border-0"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link 
                    key={l.to} 
                    to={l.to} 
                    onClick={() => setOpen(false)} 
                    className="block text-white/90 hover:text-[#F2DF74] font-bold py-3 border-b border-white/5 last:border-0"
                  >
                    {l.label}
                  </Link>
                )
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
