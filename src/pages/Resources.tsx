import ResourcesSection from '@/components/ResourcesSection';

const Resources = () => {
  return (
    <div className="bg-white">
      {/* 注意：
        1. 删除了 <Navbar /> 和 <Footer />，因为 App.tsx 已经统一处理了。
        2. 保留 pt-20 是为了防止内容被 App.tsx 中固定的导航栏遮挡。
      */}
      <div className="pt-20"> 
        <ResourcesSection />
      </div>
    </div>
  );
};

export default Resources;
