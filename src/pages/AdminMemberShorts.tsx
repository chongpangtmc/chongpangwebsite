import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ImagePlus, Loader2, Upload } from 'lucide-react';

const AdminMemberShorts = () => {
  const TI_BLUE = '#004165';
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [status, setStatus] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [form, setForm] = useState({ name: '', title: '', quote: '', sort_order: '0' });

  const compressImage = (file: File): Promise<File | Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxWidth = 1000;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(blob ? new File([blob], 'member-short.jpg', { type: 'image/jpeg' }) : file), 'image/jpeg', 0.76);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!photo || !form.name.trim() || !form.quote.trim()) return;
    setUploading(true);
    setStatus('');

    try {
      const fileToUpload = await compressImage(photo);
      const filePath = `member-shorts/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;
      const { error: uploadError } = await supabase.storage.from('club-gallery').upload(filePath, fileToUpload);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('club-gallery').getPublicUrl(filePath);
      const { error: insertError } = await supabase.from('member_shorts').insert([{
        name: form.name.trim(),
        title: form.title.trim(),
        quote: form.quote.trim(),
        photo_url: publicUrl,
        sort_order: Number(form.sort_order) || 0,
      }]);
      if (insertError) throw insertError;

      setShowSuccess(true);
      setPhoto(null);
      setPreview('');
      setForm({ name: '', title: '', quote: '', sort_order: '0' });
    } catch (err: any) {
      setStatus(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 pb-24 lg:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div style={{ backgroundColor: TI_BLUE }} className="p-8 lg:p-12 text-white relative">
          <a href="/member-column" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-all group text-xs font-black uppercase tracking-widest relative z-20">
            <ArrowLeft size={16} /> 返回会友专栏
          </a>
          <h1 className="text-3xl lg:text-4xl font-black flex items-center gap-4 relative z-10"><Upload size={36} /> 三言两语后台</h1>
          <p className="opacity-70 text-sm mt-3 font-medium relative z-10">上传会友照片、名字和几句话</p>
          <ImagePlus className="absolute right-[-20px] bottom-[-20px] text-white/10 w-48 h-48 pointer-events-none" />
        </div>

        <div className="p-6 lg:p-12 space-y-6">
          <label className="block aspect-[4/3] rounded-[2rem] border-4 border-dashed border-slate-200 bg-slate-50 overflow-hidden cursor-pointer hover:border-[#004165]/30 transition-colors">
            {preview ? <img src={preview} className="w-full h-full object-cover" alt="预览" /> : <div className="h-full flex flex-col items-center justify-center text-slate-400 font-bold"><ImagePlus size={36} className="mb-3" />添加会友照片</div>}
            <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="会友名字" className="bg-slate-50 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-2 ring-[#004165]/10" />
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="身份/分会（可选）" className="bg-slate-50 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-2 ring-[#004165]/10" />
          </div>
          <textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} placeholder="三言两语内容" className="w-full bg-slate-50 rounded-2xl p-5 h-32 font-bold outline-none focus:ring-2 ring-[#004165]/10 resize-none" />
          <input value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} placeholder="排序数字" className="w-full bg-slate-50 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-2 ring-[#004165]/10" />

          {status && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">{status}</div>}

          <button onClick={handleUpload} disabled={uploading || !photo || !form.name.trim() || !form.quote.trim()} style={{ backgroundColor: photo && form.name.trim() && form.quote.trim() ? TI_BLUE : '#cbd5e1' }} className="w-full text-white py-5 rounded-[2rem] font-black text-xl shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-3">
            {uploading ? <><Loader2 className="animate-spin" />正在上传...</> : '发布三言两语'}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-white/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-sm w-full border border-slate-100">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-black text-slate-800 mb-3">上传成功</h2>
              <button onClick={() => setShowSuccess(false)} style={{ backgroundColor: TI_BLUE }} className="w-full py-4 rounded-2xl text-white font-black">继续上传</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMemberShorts;
