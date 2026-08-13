import { Database, ImagePlus, LockKeyhole, PencilLine, ShieldCheck, UploadCloud } from 'lucide-react';

const adminModules = [
  {
    icon: ImagePlus,
    title: '活动相册',
    text: '上传例会、比赛、工作坊和会员活动照片。建议接 Cloudflare R2。',
  },
  {
    icon: PencilLine,
    title: '文字栏目',
    text: '编辑分会介绍、历届会长、执委团队、会员专栏和联络资料。',
  },
  {
    icon: Database,
    title: '资料数据库',
    text: '使用 Cloudflare D1 保存栏目资料、照片标题、排序和年份分类。',
  },
  {
    icon: ShieldCheck,
    title: '后台权限',
    text: '后续可加入管理员密码、一次性登录链接或 Cloudflare Access。',
  },
];

const Admin = () => {
  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-20 pt-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 rounded-[2rem] bg-[#004165] p-8 text-white shadow-xl shadow-slate-200 sm:p-10">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#F2DF74]">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-black sm:text-4xl">忠邦官网后台管理</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/70">
            第一版先放后台结构，避免把忠邦资料误写入友诺士 Supabase。等 Cloudflare R2 和 D1 开通后，这里会变成真正的照片上传和文字编辑后台。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {adminModules.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-[#772432]">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-black text-slate-900">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-[2rem] border border-dashed border-[#006094]/30 bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#006094]/10 text-[#006094]">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">下一步要接入的 Cloudflare 资源</h2>
              <div className="mt-4 grid gap-3 text-sm font-medium text-slate-600 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-black text-slate-900">R2 Bucket</p>
                  <p className="mt-1">建议名称：chongpang-gallery</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-black text-slate-900">D1 Database</p>
                  <p className="mt-1">建议名称：chongpang-site</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-black text-slate-900">Pages Project</p>
                  <p className="mt-1">建议名称：chongpang-toastmasters</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
