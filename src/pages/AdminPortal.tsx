import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera, Send, UploadCloud, CheckCircle2, Image as ImageIcon, ExternalLink } from 'lucide-react';

const AdminPortal = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success'>('idle');

  // 1. WhatsApp 转发逻辑
  const shareToWhatsApp = (fileName: string) => {
    const websiteUrl = "https://eunos-toastmasters.hellosg.org/resources";
    const message = `📢 *友诺士讲演会通知* \n\n新的例会资料（照片）已上传：\n🖼️ *${fileName}*\n\n请点击下方链接查看：\n🔗 ${websiteUrl}\n\n祝 学习愉快！✨`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // 2. 上传处理逻辑
  const handleUpload = async () => {
    if (!file || !title) {
      alert("请填写标题并选择照片");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('resources')
        .upload(fileName, file);

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('photos')
        .insert([{
          title_zh: title,
          url: publicUrl,
          category: 'meeting',
          year: new Date().getFullYear().toString(),
          created_at: new Date()
        }]);

      if (dbError) throw dbError;

      setUploadStatus('success');
      
      setTimeout(() => {
        if (window.confirm("🎉 照片上传成功！是否立即通知 WhatsApp 群组？")) {
          shareToWhatsApp(title);
        }
      }, 500);

    } catch (error: any) {
      alert("上传失败: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#772432]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ImageIcon style={{ color: '#772432' }} size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-800">资料照片上传</h2>
        <p className="text-slate-400 text-sm">仅支持图片格式 (JPG/PNG)</p>
      </div>

      <div className="space-y-6">
        {/* 标题输入 */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">资料标题</label>
          <input 
            type="text" 
            placeholder="例如：2026年3月15日 例会表格"
            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 ring-[#772432]/20 outline-none transition-all text-slate-800"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* 文件选择 */}
        <div className="space-y-3">
          <div 
            onClick={() => document.getElementById('file-upload')?.click()}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer hover:border-[#772432]/50 transition-colors bg-slate-50/50"
          >
            <input 
              id="file-upload"
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] || null;
                setFile(selectedFile);
                setUploadStatus('idle');
              }}
            />
            {file ? (
              <div className="flex flex-col items-center gap-2 text-[#772432] font-bold">
                <Camera size={24} />
                <span className="truncate max-w-[200px] text-xs">{file.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="text-slate-300" size={24} />
                <p className="text-slate-400 font-medium text-sm">点击选择资料照片</p>
              </div>
            )}
          </div>

          {/* PDF 转换提示工具 */}
          <div className="bg-amber-50 rounded-xl p-3 flex items-start gap-3 border border-amber-100">
            <div className="bg-amber-100 p-1.5 rounded-lg text-amber-600">
              <ExternalLink size={14} />
            </div>
            <div className="text-[11px] leading-relaxed text-amber-800">
              只有 PDF 文件？请先
              <a 
                href="https://www.ilovepdf.com/zh-cn/pdf_to_jpg" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mx-1 font-bold underline decoration-amber-300 hover:text-amber-900"
              >
                在这里将其转换为 JPG
              </a>
              ，然后再上传。
            </div>
          </div>
        </div>

        {/* 提交按钮 */}
        <button
          onClick={handleUpload}
          disabled={isUploading}
          style={{ backgroundColor: '#772432' }}
          className="w-full py-4 rounded-2xl text-white font-black shadow-lg shadow-[#772432]/30 flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all"
        >
          {isUploading ? (
            <span className="flex items-center gap-2 animate-pulse"><UploadCloud size={20}/> 正在上传...</span>
          ) : uploadStatus === 'success' ? (
            <span className="flex items-center gap-2"><CheckCircle2 size={20}/> 上传完成</span>
          ) : (
            <span className="flex items-center gap-2">确认上传并通知群组 <Send size={18}/></span>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminPortal;
