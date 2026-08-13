import HeroSection from '@/components/HeroSection';
import TimelineSection from '@/components/TimelineSection';
import ContactSection from '@/components/ContactSection'; // 1. 引入它

const Index = () => {
  return (
    <div className="bg-white">
      {/* 注意：已经删除了 <Navbar /> 和 <Footer />
        因为它们现在由 App.tsx 统一显示，这里再写就会导致页面出现双份。
      */}
      
      <HeroSection />
      
      {/* 历史里程碑 */}
      <TimelineSection />
      
      {/* 2. 在这里加入联系模块，这样 #contact 锚点才能生效 */}
      <ContactSection /> 
      
    </div>
  );
};

export default Index;
