import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, GripVertical, ImagePlus, Loader2, Plus, Upload, X } from 'lucide-react';

const AdminExecutiveCommittee = () => {
  const TI_BLUE = '#004165';
  const [uploading, setUploading] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [selectedFiles, setSelectedFiles] = useState<{ id: string; file: File; preview: string }[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [form, setForm] = useState({
    year: new Date().getFullYear().toString(),
    title: '',
  });

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1996 + 1 }, (_, i) => (currentYear - i).toString());
  }, []);

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
          const maxWidth = 1600;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          }, 'image/jpeg', 0.72);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map((file) => ({
      id: Math.random().toString(36).slice(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const newFiles = [...selectedFiles];
    const draggedItem = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedItem);
    setSelectedFiles(newFiles);
    setDraggedIndex(null);
  };

  const handleBatchUpload = async () => {
    if (!form.title.trim() || selectedFiles.length === 0) return;
    setUploading(true);
    setStatus({ type: '', message: '' });

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const item = selectedFiles[i];
        const fileToUpload = await compressImage(item.file);
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;
        const filePath = `executive-committee/${form.year}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('club-gallery')
          .upload(filePath, fileToUpload);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('club-gallery')
          .getPublicUrl(filePath);

        const { error: insertError } = await supabase.from('executive_committee_photos').insert([{
          url: publicUrl,
          year: form.year,
          title: form.title.trim(),
          sort_order: i,
        }]);

        if (insertError) throw insertError;
      }

      setShowSuccessOverlay(true);
      setSelectedFiles([]);
      setForm((prev) => ({ ...prev, title: '' }));
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 pb-24 lg:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto bg-white rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        <div style={{ backgroundColor: TI_BLUE }} className="p-8 lg:p-12 text-white relative">
          <a href="/executive-column" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-all group text-xs font-black uppercase tracking-widest relative z-20">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            返回执委专栏
          </a>
          <h1 className="text-3xl lg:text-4xl font-black flex items-center gap-4 relative z-10">
            <Upload size={36} /> 历届执委照片后台
          </h1>
          <p className="opacity-70 text-sm mt-3 font-medium relative z-10">
            上传并排序历届执委照片，前台会按年度与标题展示
          </p>
          <ImagePlus className="absolute right-[-20px] bottom-[-20px] text-white/10 w-48 h-48 pointer-events-none" />
        </div>

        <div className="p-6 lg:p-12 space-y-10">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 ml-1 uppercase">年度</label>
              <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:border-[#004165] focus:outline-none appearance-none cursor-pointer transition-colors">
                {yearOptions.map((year) => <option key={year} value={year}>{year} 年度</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 ml-1 uppercase">照片组标题</label>
              <input placeholder="例如：2025-2026 年度执委" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:border-[#004165] focus:outline-none transition-colors" />
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-black text-slate-800 text-sm uppercase">排序预览 ({selectedFiles.length})</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase">拖拽图片可调整展示顺序</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {selectedFiles.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  className={`relative aspect-square rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden border-2 transition-all cursor-move bg-slate-100 ${draggedIndex === index ? 'opacity-20 scale-90' : 'opacity-100 scale-100'} ${draggedIndex !== null && draggedIndex !== index ? 'border-[#004165] scale-105' : 'border-slate-100'}`}
                >
                  <img src={item.preview} className="w-full h-full object-cover pointer-events-none" alt="preview" />
                  <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <GripVertical className="text-white drop-shadow-md" size={24} />
                  </div>
                  <button onClick={() => setSelectedFiles((prev) => prev.filter((file) => file.id !== item.id))} className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-xl shadow-md hover:bg-red-500 hover:text-white transition-all z-10">
                    <X size={14} />
                  </button>
                </div>
              ))}

              <label className="aspect-square border-4 border-dashed border-slate-200 rounded-[1.5rem] lg:rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-[#004165]/30 transition-all group">
                <Plus size={32} className="text-slate-300 group-hover:text-[#004165] transition-colors" />
                <span className="text-[10px] font-bold text-slate-400 mt-2 group-hover:text-[#004165]">添加图片</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={onFileChange} />
              </label>
            </div>
          </section>

          {status.message && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
              {status.message}
            </motion.div>
          )}

          <button onClick={handleBatchUpload} disabled={uploading || selectedFiles.length === 0 || !form.title.trim()} style={{ backgroundColor: selectedFiles.length > 0 && form.title.trim() ? TI_BLUE : '#cbd5e1' }} className="w-full text-white py-6 rounded-[2rem] lg:rounded-[2.5rem] font-black text-xl shadow-xl transition-all active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-3">
            {uploading ? (
              <>
                <Loader2 className="animate-spin" />
                <span>正在上传...</span>
              </>
            ) : '确认发布历届执委照片'}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-white/90 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-sm w-full border border-slate-100">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-black text-slate-800 mb-3">上传成功</h2>
              <p className="text-slate-500 text-sm mb-8">历届执委照片已发布到前台</p>
              <button onClick={() => setShowSuccessOverlay(false)} style={{ backgroundColor: TI_BLUE }} className="w-full py-4 rounded-2xl text-white font-black hover:opacity-90 transition-opacity">
                继续上传
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminExecutiveCommittee;
