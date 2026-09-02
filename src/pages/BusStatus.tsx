import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, BusFront, Clock3, Download, LocateFixed, QrCode, RefreshCw, Search } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Arrival = { service: string; minutes: number[]; load: string; type: string; wheelchair: boolean };
type NearbyStop = { code: string; name: string; road: string; lat: number; lng: number; distance: number };
type Language = "zh" | "en";

const copy = {
  zh: { brand:"忠邦华语演讲会温馨服务", title:"查看您的巴士到站时间。", heading:"请输入您的巴士站编号", hint:"注：编号可以在巴士站牌上找到，例如：59719", input:"巴士站编号", placeholder:"输入五位数巴士站编号", go:"查询", location:"使用我的位置", locating:"正在查找附近巴士站…", nearby:"距离您最近的5个车站", locationDenied:"无法取得位置，请允许浏览器使用定位后重试。", locationError:"暂时无法查找附近巴士站，请稍后重试。", metres:"米", arrivals:"实时到站", stop:"巴士站", refresh:"刷新", loading:"正在读取陆交局实时数据", success:"数据来自陆交局 DataMall，每20秒自动更新", invalid:"请输入正确的五位数巴士站编号", error:"暂时无法读取巴士到站数据", empty:"这个车站目前没有可用的巴士到站资料", next:"下一班", arriving:"即将到站", min:"分钟", wheelchair:"轮椅可通行", updated:"更新时间", estimate:"到站时间仅供参考", qrButton:"生成本站二维码", qrTitle:"本站专属二维码", qrHelp:"乘客扫码后将直接打开这个巴士站的实时到站页面。", download:"保存／分享二维码", saveHint:"如果手机没有弹出保存窗口，请长按下方图片并选择“存储到照片”。", filename:"巴士站" },
  en: { brand:"A warm service from Chong Pang TMC", title:"Check your bus arrival time.", heading:"Enter your bus stop number", hint:"You can find it on the bus stop sign, for example: 59719", input:"Bus stop code", placeholder:"Enter 5-digit stop code", go:"Go", location:"Use my location", locating:"Finding nearby bus stops…", nearby:"5 nearest bus stops", locationDenied:"We could not access your location. Please allow location access and try again.", locationError:"Nearby bus stops are temporarily unavailable. Please try again.", metres:"m", arrivals:"Live arrivals", stop:"Bus stop", refresh:"Refresh", loading:"Loading real-time data from LTA", success:"Data from LTA DataMall · refreshes every 20 seconds", invalid:"Enter a valid 5-digit bus stop code", error:"Bus arrival data is temporarily unavailable", empty:"No bus arrival information is currently available for this stop", next:"Next bus", arriving:"Arr", min:"min", wheelchair:"Wheelchair accessible", updated:"Updated", estimate:"Times are estimates", qrButton:"Generate stop QR code", qrTitle:"QR code for this stop", qrHelp:"Passengers can scan this code to open live arrivals for this bus stop.", download:"Save / share QR code", saveHint:"If no save window appears, press and hold the image below and choose Save to Photos.", filename:"bus-stop" },
} as const;

const BusStatus = () => {
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem("bus-status-language") === "en" ? "en" : "zh");
  const [stop, setStop] = useState("59009");
  const [activeStop, setActiveStop] = useState("59009");
  const [stopName, setStopName] = useState("");
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"loading"|"success"|"invalid"|"error">("loading");
  const [message, setMessage] = useState("");
  const [updated, setUpdated] = useState("--");
  const [showQr, setShowQr] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [nearbyStops, setNearbyStops] = useState<NearbyStop[]>([]);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const qrRef = useRef<HTMLCanvasElement>(null);
  const t = copy[language];

  const loadArrivals = useCallback(async (busStop: string, quiet = false) => {
    if (!/^\d{5}$/.test(busStop)) { setStatus("invalid"); return; }
    if (!quiet) setLoading(true);
    try {
      const response = await fetch(`/api/bus-arrival?stop=${busStop}`, { cache: "no-store" });
      const data = await response.json() as { arrivals?: Arrival[]; error?: string };
      if (!response.ok) throw new Error(data.error);
      setArrivals(data.arrivals || []); setActiveStop(busStop); setStatus("success"); setMessage("");
      setUpdated(new Date().toLocaleTimeString(language === "zh" ? "zh-SG" : "en-SG", { hour:"2-digit", minute:"2-digit", second:"2-digit" }));
      history.replaceState({}, "", `/bus_status?stop=${busStop}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : ""); setStatus("error");
    } finally { setLoading(false); }
  }, [language]);

  useEffect(() => {
    const queryStop = new URLSearchParams(location.search).get("stop");
    const initial = queryStop && /^\d{5}$/.test(queryStop) ? queryStop : "59009";
    setStop(initial); setActiveStop(initial); void loadArrivals(initial);
  }, [loadArrivals]);

  useEffect(() => {
    const timer = window.setInterval(() => void loadArrivals(activeStop, true), 20_000);
    return () => clearInterval(timer);
  }, [activeStop, loadArrivals]);

  useEffect(() => {
    let cancelled = false;
    setStopName("");
    fetch(`/api/bus-stop?stop=${activeStop}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data: { name?: string } | null) => { if (!cancelled) setStopName(data?.name || ""); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [activeStop]);

  const switchLanguage = (next: Language) => { setLanguage(next); localStorage.setItem("bus-status-language", next); };
  const submit = (event: FormEvent) => { event.preventDefault(); setShowQr(false); void loadArrivals(stop); };
  const distanceInMetres = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const toRad = (value: number) => value * Math.PI / 180;
    const dLat = toRad(lat2 - lat1); const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return Math.round(6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };
  const useMyLocation = () => {
    setLocationMessage(""); setNearbyStops([]);
    if (!navigator.geolocation) { setLocationMessage(t.locationDenied); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const response = await fetch("/api/bus-stops");
        const data = await response.json() as { stops?: Omit<NearbyStop, "distance">[] };
        if (!response.ok || !data.stops) throw new Error();
        const nearest = data.stops.map((item) => ({ ...item, distance: distanceInMetres(coords.latitude, coords.longitude, item.lat, item.lng) })).sort((a, b) => a.distance - b.distance).slice(0, 5);
        setNearbyStops(nearest);
      } catch { setLocationMessage(t.locationError); }
      finally { setLocating(false); }
    }, () => { setLocationMessage(t.locationDenied); setLocating(false); }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  };
  const selectNearbyStop = (item: NearbyStop) => { setStop(item.code); setNearbyStops([]); setShowQr(false); void loadArrivals(item.code); };
  const qrUrl = `${location.origin}/bus_status?stop=${activeStop}`;
  const downloadQr = async () => {
    if (!qrRef.current) return;
    const dataUrl = qrRef.current.toDataURL("image/png");
    setQrImage(dataUrl);
    const blob = await new Promise<Blob | null>((resolve) => qrRef.current?.toBlob(resolve, "image/png"));
    const filename = `${t.filename}-${activeStop}-qr.png`;
    if (blob) {
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: `${t.stop} ${activeStop}` }); return; }
        catch (error) { if (error instanceof DOMException && error.name === "AbortError") return; }
      }
    }
    const link = document.createElement("a"); link.download = filename; link.href = dataUrl; link.click();
  };
  const notice = status === "success" ? t.success : status === "invalid" ? t.invalid : status === "error" ? (message || t.error) : t.loading;

  return <main className="min-h-screen bg-[#f2f6ed] text-[#092623] font-body">
    <header className="border-b border-emerald-950/10 bg-[#092f2b] text-white"><div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 py-4">
      <div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#c9f45b] text-[#092f2b]"><BusFront size={22}/></span><div className="min-w-0"><div className="flex flex-wrap items-baseline gap-x-2"><p className="text-sm font-black tracking-[.03em] text-[#d9ff73] sm:text-base">{t.brand}</p><a href="https://chongpangtmc.hellosg.org/" className="text-[10px] font-medium text-emerald-100 underline decoration-emerald-300/60 underline-offset-2 hover:text-white sm:text-xs">chongpangtmc.hellosg.org</a></div><p className="mt-0.5 text-sm font-semibold sm:text-base">{t.title}</p></div></div>
      <div className="flex rounded-full bg-white/10 p-1 text-xs font-bold" aria-label="Language"><button onClick={() => switchLanguage("zh")} className={`rounded-full px-2.5 py-1 ${language === "zh" ? "bg-white text-[#092f2b]" : "text-emerald-100"}`}>中文</button><button onClick={() => switchLanguage("en")} className={`rounded-full px-2.5 py-1 ${language === "en" ? "bg-white text-[#092f2b]" : "text-emerald-100"}`}>EN</button></div>
    </div></header>

    <div className="mx-auto max-w-2xl px-4 pb-12 pt-5 sm:px-5">
      <section className="rounded-[28px] bg-[#092f2b] p-5 text-white shadow-[0_20px_50px_rgba(9,38,35,.16)] sm:p-7">
        <h1 className="text-2xl font-bold tracking-[-.03em] sm:text-3xl">{t.heading}</h1><p className="mt-2 text-sm text-emerald-100">{t.hint}</p>
        <form onSubmit={submit} className="mt-6 flex gap-2"><div className="relative min-w-0 flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={19}/><Input aria-label={t.input} inputMode="numeric" maxLength={5} value={stop} onChange={e => setStop(e.target.value.replace(/\D/g,""))} className="h-12 rounded-2xl border-0 bg-white pl-11 text-base font-semibold text-slate-950" placeholder={t.placeholder}/></div><Button className="h-12 rounded-2xl bg-[#c9f45b] px-5 font-bold text-[#092f2b] hover:bg-lime-300">{t.go}</Button></form>
        <button type="button" disabled={locating} onClick={useMyLocation} className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-100 disabled:opacity-60"><LocateFixed className={locating ? "animate-pulse" : ""} size={17}/> {locating ? t.locating : t.location}</button>
        {locationMessage && <p className="mt-3 rounded-xl bg-amber-100 px-3 py-2 text-xs text-amber-950">{locationMessage}</p>}
        {nearbyStops.length > 0 && <div className="mt-4 overflow-hidden rounded-2xl bg-white text-[#092623]"><p className="border-b border-slate-100 px-4 py-3 text-sm font-bold">{t.nearby}</p>{nearbyStops.map((item) => <button type="button" key={item.code} onClick={() => selectNearbyStop(item)} className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-emerald-50"><span className="min-w-0"><strong className="text-sm">{item.code} · {item.name}</strong><span className="mt-0.5 block truncate text-xs text-slate-500">{item.road}</span></span><span className="shrink-0 rounded-full bg-[#e8f8bd] px-2.5 py-1 text-xs font-bold">{item.distance} {t.metres}</span></button>)}</div>}
      </section>

      <section className="mt-7"><div className="mb-4 flex items-end justify-between gap-4 px-1"><div><p className="text-xs font-bold uppercase tracking-[.13em] text-emerald-700">{t.arrivals}</p><h2 className="mt-1 text-xl font-bold">{t.stop} {activeStop}{stopName ? ` · ${stopName}` : ""}</h2></div><button disabled={loading} onClick={() => void loadArrivals(activeStop)} className="flex items-center gap-1.5 rounded-full border border-emerald-950/10 bg-white px-3 py-2 text-xs font-semibold shadow-sm disabled:opacity-50"><RefreshCw className={loading ? "animate-spin" : ""} size={14}/> {t.refresh}</button></div>
        <div className={`mb-3 flex items-start gap-2 rounded-2xl px-3.5 py-3 text-xs font-medium ${status === "success" ? "border border-emerald-200 bg-emerald-50 text-emerald-900" : "border border-amber-200 bg-amber-50 text-amber-900"}`}><AlertTriangle className="mt-0.5 shrink-0" size={15}/><span>{notice}</span></div>
        <div className="space-y-3">{!loading && arrivals.length === 0 && <div className="rounded-[24px] border border-emerald-950/10 bg-white p-8 text-center text-sm text-slate-500">{t.empty}</div>}{arrivals.map(bus => <article key={bus.service} className="rounded-[24px] border border-emerald-950/10 bg-white p-4 shadow-[0_8px_30px_rgba(9,38,35,.06)] sm:p-5"><div className="flex items-center gap-4"><div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#c9f45b] text-xl font-black">{bus.service}</div><div className="min-w-0 flex-1"><div className="flex items-baseline justify-between gap-2"><span className="text-xs font-semibold text-slate-500">{t.next}</span><span className="text-xs text-slate-400">{bus.type}</span></div><div className="mt-1 flex items-baseline gap-2"><span className="text-3xl font-black tracking-[-.05em]">{bus.minutes[0] === 0 ? t.arriving : bus.minutes[0]}</span>{bus.minutes[0] !== 0 && <span className="font-semibold text-slate-500">{t.min}</span>}<span className="ml-auto text-sm font-bold text-emerald-700">{bus.minutes.slice(1).join(" · ")} {t.min}</span></div></div></div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs"><span className="font-semibold text-emerald-700">● {bus.load}</span><span className="text-slate-400">{bus.wheelchair ? t.wheelchair : ""}</span></div></article>)}</div>
        <button onClick={() => setShowQr(v => !v)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-950/10 bg-white px-4 py-3 text-sm font-bold shadow-sm"><QrCode size={18}/> {t.qrButton}</button>
        {showQr && <div className="mt-3 rounded-[24px] border border-emerald-950/10 bg-white p-5 text-center shadow-[0_8px_30px_rgba(9,38,35,.06)]"><h3 className="font-bold">{t.qrTitle} · {activeStop}</h3><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">{t.qrHelp}</p><div className="mx-auto mt-4 w-fit rounded-2xl border border-slate-200 p-3"><QRCodeCanvas ref={qrRef} value={qrUrl} size={220} level="H" marginSize={1}/></div><button onClick={() => void downloadQr()} className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-[#c9f45b] px-5 py-2.5 text-sm font-bold"><Download size={17}/> {t.download}</button>{qrImage && <div className="mt-4 rounded-2xl bg-amber-50 p-3"><p className="mb-2 text-xs leading-5 text-amber-900">{t.saveHint}</p><img src={qrImage} alt={`${t.stop} ${activeStop} QR`} className="mx-auto h-[220px] w-[220px]"/></div>}<p className="mt-3 break-all text-[11px] text-slate-400">{qrUrl}</p></div>}
        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-500"><Clock3 size={14}/> {t.updated} {updated} · {t.estimate}</p>
      </section>
    </div>
  </main>;
};

export default BusStatus;
