import ClubHubSection from '@/components/ClubHubSection';

const Club = () => {
  return (
    <div className="bg-white">
      {/* 注意：
        1. 删除了 Navbar 和 Footer 的 import 和标签，防止与 App.tsx 冲突。
        2. 保留了 pt-20，确保内容不会被 App.tsx 中固定的导航栏遮挡。
      */}
      <div className="pt-20">
        <ClubHubSection />
      </div>
    </div>
  );
};

export default Club;
