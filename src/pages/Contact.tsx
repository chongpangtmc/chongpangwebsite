import ContactSection from '@/components/ContactSection';

const ContactPage = () => {
  return (
    /** * 注意：
     * 1. 删除了 <Navbar /> 和 <Footer />，因为 App.tsx 已经统一包含了它们。
     * 2. 保留了 min-h-screen 确保背景色填充整个屏幕。
     * 3. 这里的 pt-20 (Padding Top) 确保内容不被 App.tsx 中固定的 Navbar 遮挡。
     */
    <div className="min-h-screen bg-slate-50">
      <div className="pt-20"> 
        <ContactSection />
      </div>
    </div>
  );
};

export default ContactPage;
