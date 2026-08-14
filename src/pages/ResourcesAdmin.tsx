import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, GripVertical, Images, LayoutGrid, Loader2, Plus, RefreshCw, Save, Trash2, Upload, X } from 'lucide-react';

type SelectedFile = {
  id: string;
  file: File;
  preview: string;
};

type ResourcePhoto = {
  id: string;
  url: string;
  object_key: string;
  year: string;
  category: string;
  title: string;
  sort_order: number;
  created_at: string;
};

type AlbumOption = {
  key: string;
  label: string;
  year: string;
  category: string;
  title: string;
  photos: ResourcePhoto[];
};

const categories = [
  { id: 'meeting', label: '例会照片' },
  { id: 'contest', label: '演讲比赛' },
  { id: 'workshop', label: '工作坊' },
  { id: 'social', label: '康乐活动' },
  { id: 'others', label: '其他活动' },
];

const ResourcesAdmin = () => {
  const [adminToken, setAdminToken] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [status, setStatus] = useState('');
  const [manageStatus, setManageStatus] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<ResourcePhoto[]>([]);
  const [selectedAlbumKey, setSelectedAlbumKey] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedExistingIndex, setDraggedExistingIndex] = useState<number | null>(null);
  const [form, setForm] = useState({
    year: new Date().getFullYear().toString(),
    category: 'meeting',
    title: '',
  });

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2016;
    return Array.from({ length: currentYear - startYear + 1 }, (_, index) => (currentYear - index).toString());
  }, []);

  const albumOptions = useMemo(() => {
    const groups: Record<string, AlbumOption> = {};
    existingPhotos.forEach((photo) => {
      const key = `${photo.year}__${photo.category}__${photo.title}`;
      if (!groups[key]) {
        groups[key] = {
          key,
          label: `${photo.year} · ${categories.find((category) => category.id === photo.category)?.label ?? photo.category} · ${photo.title}`,
          year: photo.year,
          category: photo.category,
          title: photo.title,
          photos: [],
        };
      }
      groups[key].photos.push(photo);
    });

    return Object.values(groups).map((album) => ({
      ...album,
      photos: album.photos.sort((a, b) => a.sort_order - b.sort_order),
    }));
  }, [existingPhotos]);

  const selectedAlbum = useMemo(
    () => albumOptions.find((album) => album.key === selectedAlbumKey) ?? null,
    [albumOptions, selectedAlbumKey],
  );

  useEffect(() => {
    if (!selectedAlbumKey && albumOptions.length > 0) {
      setSelectedAlbumKey(albumOptions[0].key);
      return;
    }

    if (selectedAlbumKey && !albumOptions.some((album) => album.key === selectedAlbumKey)) {
      setSelectedAlbumKey(albumOptions[0]?.key ?? '');
    }
  }, [albumOptions, selectedAlbumKey]);

  const compressImage = (file: File): Promise<File> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const image = new Image();
      image.src = event.target?.result as string;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        let width = image.width;
        let height = image.height;
        const maxWidth = 1600;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')?.drawImage(image, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.74);
      };
      image.onerror = reject;
    };
    reader.onerror = reject;
  });

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const nextFiles = Array.from(event.target.files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setSelectedFiles((items) => [...items, ...nextFiles]);
    event.target.value = '';
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const nextFiles = [...selectedFiles];
    const [draggedItem] = nextFiles.splice(draggedIndex, 1);
    nextFiles.splice(index, 0, draggedItem);
    setSelectedFiles(nextFiles);
    setDraggedIndex(null);
  };

  const readJson = async (response: Response) => {
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      throw new Error('上传接口还没有连接成功，请检查 Cloudflare Pages 的 D1 和 R2 绑定。');
    }
    return response.json();
  };

  const loadExistingPhotos = async () => {
    setLoadingExisting(true);
    setManageStatus('');

    try {
      const response = await fetch('/api/resource-photos');
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || '已上传相册载入失败');
      setExistingPhotos(data.photos ?? []);
      setManageStatus(data.photos?.length ? `已载入 ${data.photos.length} 张照片。` : '目前还没有上传照片。');
    } catch (error) {
      setExistingPhotos([]);
      setManageStatus(error instanceof Error ? error.message : '已上传相册载入失败');
    } finally {
      setLoadingExisting(false);
    }
  };

  useEffect(() => {
    loadExistingPhotos();
  }, []);

  const handleBatchUpload = async () => {
    if (!adminToken.trim()) {
      setStatus('请先输入后台密码。');
      return;
    }

    if (!form.title.trim()) {
      setStatus('请填写相册标题。');
      return;
    }

    if (!selectedFiles.length) {
      setStatus('请先选择图片。');
      return;
    }

    setUploading(true);
    setStatus('');

    try {
      for (let index = 0; index < selectedFiles.length; index += 1) {
        const item = selectedFiles[index];
        const compressedFile = await compressImage(item.file);
        const formData = new FormData();
        formData.append('year', form.year);
        formData.append('category', form.category);
        formData.append('title', form.title.trim());
        formData.append('sort_order', String(index));
        formData.append('file', compressedFile);

        const response = await fetch('/api/resource-photos', {
          method: 'POST',
          headers: { 'x-admin-token': adminToken.trim() },
          body: formData,
        });
        const data = await readJson(response);
        if (!response.ok) throw new Error(data.error || '上传失败');
      }

      selectedFiles.forEach((item) => URL.revokeObjectURL(item.preview));
      setSelectedFiles([]);
      setForm((value) => ({ ...value, title: '' }));
      setShowSuccessOverlay(true);
      await loadExistingPhotos();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleExistingDrop = (index: number) => {
    if (!selectedAlbum || draggedExistingIndex === null || draggedExistingIndex === index) return;
    const photos = [...selectedAlbum.photos];
    const [draggedItem] = photos.splice(draggedExistingIndex, 1);
    photos.splice(index, 0, draggedItem);
    setExistingPhotos((items) => {
      const movingIds = new Set(photos.map((photo) => photo.id));
      const others = items.filter((photo) => !movingIds.has(photo.id));
      const reordered = photos.map((photo, sortIndex) => ({ ...photo, sort_order: sortIndex }));
      return [...others, ...reordered];
    });
    setDraggedExistingIndex(null);
  };

  const saveExistingOrder = async () => {
    if (!adminToken.trim()) {
      setManageStatus('请先输入后台密码。');
      return;
    }

    if (!selectedAlbum) {
      setManageStatus('请先选择相册。');
      return;
    }

    setSavingOrder(true);
    setManageStatus('');

    try {
      const response = await fetch('/api/resource-photos', {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          'x-admin-token': adminToken.trim(),
        },
        body: JSON.stringify({ ids: selectedAlbum.photos.map((photo) => photo.id) }),
      });
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || '保存排序失败');
      setManageStatus('相册顺序已保存，第一张会成为封面。');
      await loadExistingPhotos();
    } catch (error) {
      setManageStatus(error instanceof Error ? error.message : '保存排序失败');
    } finally {
      setSavingOrder(false);
    }
  };

  const deleteExistingPhoto = async (photo: ResourcePhoto) => {
    if (!adminToken.trim()) {
      setManageStatus('请先输入后台密码。');
      return;
    }

    if (!window.confirm('确定删除这张照片吗？删除后会同时从 R2 和数据库移除。')) return;

    setManageStatus('');

    try {
      const response = await fetch(`/api/resource-photos?id=${encodeURIComponent(photo.id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken.trim() },
      });
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || '删除失败');
      setExistingPhotos((items) => items.filter((item) => item.id !== photo.id));
      setManageStatus('照片已删除。');
    } catch (error) {
      setManageStatus(error instanceof Error ? error.message : '删除失败');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 pb-24 lg:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl lg:rounded-[3rem]">
        <div className="relative bg-[#772432] p-8 text-white lg:p-12">
          <a href="/resources" className="relative z-20 mb-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/60 transition-all hover:text-white">
            <ArrowLeft size={16} />
            返回分会活动
          </a>
          <h1 className="relative z-10 flex items-center gap-4 text-3xl font-black lg:text-4xl">
            <Upload size={36} /> 分会活动后台
          </h1>
          <p className="relative z-10 mt-3 text-sm font-medium opacity-70">批量上传活动照片 · 自动压缩 · 支持排序</p>
          <LayoutGrid className="pointer-events-none absolute bottom-[-20px] right-[-20px] h-48 w-48 text-white/10" />
        </div>

        <div className="space-y-10 p-6 lg:p-12">
          <section className="grid grid-cols-1 gap-6 rounded-[2rem] border border-slate-100 bg-slate-50 p-6 lg:rounded-[2.5rem] lg:p-8 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="ml-1 text-xs font-black uppercase text-slate-400">后台密码</label>
              <input
                type="password"
                value={adminToken}
                onChange={(event) => setAdminToken(event.target.value)}
                placeholder="输入 ADMIN_TOKEN"
                className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold outline-none transition-colors focus:border-[#772432]"
              />
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-xs font-black uppercase text-slate-400">年度</label>
              <select value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold outline-none transition-colors focus:border-[#772432]">
                {yearOptions.map((year) => <option key={year} value={year}>{year} 年度</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-xs font-black uppercase text-slate-400">分类</label>
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold outline-none transition-colors focus:border-[#772432]">
                {categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="ml-1 text-xs font-black uppercase text-slate-400">相册标题</label>
              <input
                placeholder="例如：2026年第一次例会"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold outline-none transition-colors focus:border-[#772432]"
              />
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-black uppercase text-slate-800">排序预览 ({selectedFiles.length})</h2>
              <p className="text-[10px] font-bold uppercase text-slate-400">拖拽图片可调整发布顺序</p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {selectedFiles.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => setDraggedIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  className={`relative aspect-square cursor-move overflow-hidden rounded-[1.5rem] border-2 bg-slate-100 transition-all lg:rounded-[2rem] ${
                    draggedIndex === index ? 'scale-90 opacity-20' : 'scale-100 opacity-100'
                  } ${draggedIndex !== null && draggedIndex !== index ? 'scale-105 border-[#772432]' : 'border-slate-100'}`}
                >
                  <img src={item.preview} className="h-full w-full object-cover pointer-events-none" alt="preview" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 transition-opacity hover:opacity-100">
                    <GripVertical className="text-white drop-shadow-md" size={24} />
                  </div>
                  <button onClick={() => setSelectedFiles((items) => items.filter((file) => file.id !== item.id))} className="absolute right-2 top-2 z-10 rounded-xl bg-white/90 p-1.5 text-red-500 shadow-md transition-all hover:bg-red-500 hover:text-white">
                    <X size={14} />
                  </button>
                  {index === 0 && <div className="absolute bottom-2 left-2 rounded-md bg-[#772432] px-2 py-0.5 text-[8px] font-black text-white shadow-lg">封面图</div>}
                </div>
              ))}

              <label className="group flex aspect-square cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-4 border-dashed border-slate-200 transition-all hover:border-[#772432]/30 hover:bg-slate-50 lg:rounded-[2rem]">
                <Plus size={32} className="text-slate-300 transition-colors group-hover:text-[#772432]" />
                <span className="mt-2 text-[10px] font-bold text-slate-400 group-hover:text-[#772432]">添加图片</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={onFileChange} />
              </label>
            </div>
          </section>

          {status && <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">{status}</div>}

          <button
            onClick={handleBatchUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-[#772432] py-6 text-xl font-black text-white shadow-xl transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 lg:rounded-[2.5rem]"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" />
                <span>正在上传并同步顺序...</span>
              </>
            ) : '确认按此顺序发布'}
          </button>

          <section className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6 lg:rounded-[2.5rem] lg:p-8">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#772432] shadow-sm">
                  <Images size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900">已上传相册管理</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">选择一个相册后，可拖拽调整顺序；第一张会作为封面，也可以删除单张照片。</p>
              </div>
              <button
                onClick={loadExistingPhotos}
                disabled={loadingExisting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-600 shadow-sm disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${loadingExisting ? 'animate-spin' : ''}`} />
                重新载入
              </button>
            </div>

            <div className="mb-5 space-y-2">
              <label className="ml-1 text-xs font-black uppercase text-slate-400">选择相册</label>
              <select
                value={selectedAlbumKey}
                onChange={(event) => setSelectedAlbumKey(event.target.value)}
                className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold outline-none transition-colors focus:border-[#772432]"
              >
                {albumOptions.map((album) => (
                  <option key={album.key} value={album.key}>
                    {album.label} ({album.photos.length} 张)
                  </option>
                ))}
              </select>
            </div>

            {manageStatus && <div className="mb-5 rounded-2xl border border-[#772432]/10 bg-white p-4 text-sm font-bold text-[#772432]">{manageStatus}</div>}

            {loadingExisting ? (
              <div className="rounded-3xl bg-white p-10 text-center text-sm font-bold text-slate-400">载入中...</div>
            ) : selectedAlbum ? (
              <>
                <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {selectedAlbum.photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      draggable
                      onDragStart={() => setDraggedExistingIndex(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleExistingDrop(index)}
                      className={`relative aspect-square cursor-move overflow-hidden rounded-[1.5rem] border-2 bg-white shadow-sm transition-all ${
                        draggedExistingIndex === index ? 'scale-90 opacity-30' : 'scale-100 opacity-100'
                      } ${draggedExistingIndex !== null && draggedExistingIndex !== index ? 'scale-105 border-[#772432]' : 'border-white'}`}
                    >
                      <img src={photo.url} className="h-full w-full object-cover pointer-events-none" alt={photo.title} />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity hover:opacity-100">
                        <GripVertical className="text-white drop-shadow-md" size={24} />
                      </div>
                      <button
                        onClick={() => deleteExistingPhoto(photo)}
                        className="absolute right-2 top-2 z-10 rounded-xl bg-white/90 p-1.5 text-red-500 shadow-md transition-all hover:bg-red-500 hover:text-white"
                        title="删除照片"
                      >
                        <Trash2 size={14} />
                      </button>
                      {index === 0 && <div className="absolute bottom-2 left-2 rounded-md bg-[#772432] px-2 py-0.5 text-[8px] font-black text-white shadow-lg">封面图</div>}
                    </div>
                  ))}
                </div>

                <button
                  onClick={saveExistingOrder}
                  disabled={savingOrder || selectedAlbum.photos.length === 0}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#004165] px-5 py-4 text-sm font-black text-white shadow-lg disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
                >
                  {savingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  保存当前排序
                </button>
              </>
            ) : (
              <div className="rounded-3xl bg-white p-10 text-center text-sm font-bold text-slate-400">目前还没有相册。</div>
            )}
          </section>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/90 p-6 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm rounded-[3rem] bg-white p-12 text-center shadow-2xl">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="mb-2 text-2xl font-black text-slate-800">发布成功</h2>
              <p className="mb-8 text-sm leading-relaxed text-slate-500">相册内容已上传，并按照您调整的顺序完成入库。</p>
              <button onClick={() => setShowSuccessOverlay(false)} className="w-full rounded-2xl bg-[#772432] py-4 font-black text-white shadow-lg transition-all hover:brightness-110">
                继续上传
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResourcesAdmin;
