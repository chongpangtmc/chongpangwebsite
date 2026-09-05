import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Bell, BellRing, BusFront, Clock3, Download, LocateFixed, MapPinned, QrCode, RefreshCw, Search } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Arrival = { service: string; minutes: number[]; load: string; type: string; wheelchair: boolean };
type NearbyStop = { code: string; name: string; road: string; lat: number; lng: number; distance: number };
type AddressResult = { address: string; postal: string; building: string; lat: number; lng: number };
type Language = "zh" | "en";

const copy = {
  zh: { brand:"忠邦华语演讲会温馨服务", title:"查看您的巴士到站时间。", heading:"请输入巴士站编号、邮编或地址", hint:"例如：59719、760101 或 Yishun Ring Road", input:"巴士站编号、邮编或地址", placeholder:"输入站号、邮编或地址", go:"查询", searching:"正在搜索地址…", matches:"请选择正确的地址", noAddress:"找不到匹配地址，请尝试完整邮编或其他关键词。", searchError:"地址搜索暂时无法使用，请稍后重试。", location:"使用我的位置", locating:"正在查找附近巴士站…", nearby:"距离最近的5个车站", locationDenied:"无法取得位置，请允许浏览器使用定位后重试。", locationError:"暂时无法查找附近巴士站，请稍后重试。", metres:"米", arrivals:"实时到站", stop:"巴士站", refresh:"刷新", loading:"正在读取陆交局实时数据", success:"数据来自陆交局，每20秒自动更新，到站提醒是指1分钟之内到达的巴士会有声音提醒。", invalid:"请输入正确的巴士站编号、邮编或地址", error:"暂时无法读取巴士到站数据", empty:"这个车站目前没有可用的巴士到站资料", next:"下一班", arriving:"即将到站", min:"分钟", wheelchair:"轮椅可通行", updated:"更新时间", estimate:"到站时间仅供参考", remind:"到站提醒", reminderOn:"已设提醒", reminderReady:"将在巴士进入1分钟内提醒一次", reminderAlert:"巴士即将到站，请准备上车！", route:"路线", qrButton:"生成本站二维码", qrTitle:"本站专属二维码", qrHelp:"乘客扫码后将直接打开这个巴士站的实时到站页面。", download:"保存／分享二维码", saveHint:"如果手机没有弹出保存窗口，请长按下方图片并选择“存储到照片”。", filename:"巴士站" },
  en: { brand:"A warm service from Chong Pang TMC", title:"Check your bus arrival time.", heading:"Enter a bus stop, postal code or address", hint:"For example: 59719, 760101 or Yishun Ring Road", input:"Bus stop, postal code or address", placeholder:"Stop code, postal code or address", go:"Search", searching:"Searching addresses…", matches:"Choose the correct address", noAddress:"No matching address found. Try a full postal code or different keywords.", searchError:"Address search is temporarily unavailable. Please try again.", location:"Use my location", locating:"Finding nearby bus stops…", nearby:"5 nearest bus stops", locationDenied:"We could not access your location. Please allow location access and try again.", locationError:"Nearby bus stops are temporarily unavailable. Please try again.", metres:"m", arrivals:"Live arrivals", stop:"Bus stop", refresh:"Refresh", loading:"Loading real-time data from LTA", success:"Data from LTA DataMall · refreshes every 20 seconds", invalid:"Enter a valid bus stop, postal code or address", error:"Bus arrival data is temporarily unavailable", empty:"No bus arrival information is currently available for this stop", next:"Next bus", arriving:"Arr", min:"min", wheelchair:"Wheelchair accessible", updated:"Updated", estimate:"Times are estimates", remind:"Arrival alert", reminderOn:"Alert set", reminderReady:"We will alert you once when the bus is within 1 minute", reminderAlert:"Your bus is arriving. Please get ready!", route:"Route", qrButton:"Generate stop QR code", qrTitle:"QR code for this stop", qrHelp:"Passengers can scan this code to open live arrivals for this bus stop.", download:"Save / share QR code", saveHint:"If no save window appears, press and hold the image below and choose Save to Photos.", filename:"bus-stop" },
} as const;

const BusStatus = () => {
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem("bus-status-language") === "en" ? "en" : "zh");
  const [stop, setStop] = useState("59009");
  const [activeStop, setActiveStop] = useState("59009");
  const [stopName, setStopName] = useState("");
  const [stopRoad, setStopRoad] = useState("");
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
  const [addressResults, setAddressResults] = useState<AddressResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [reminders, setReminders] = useState<Set<string>>(() => new Set());
  const qrRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
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
    const due = arrivals.filter((bus) => reminders.has(`${activeStop}:${bus.service}`) && bus.minutes[0] <= 1);
    if (!due.length) return;
    due.forEach((bus) => {
      const context = audioRef.current;
      if (context) {
        void context.resume().then(() => {
          [
            { delay: 0, frequencies: [1047, 1319], duration: 0.32, volume: 0.18 },
            { delay: 0.48, frequencies: [392, 523], duration: 0.55, volume: 0.2 },
            { delay: 1.18, frequencies: [1175, 1568], duration: 0.38, volume: 0.14 },
          ].forEach(({ delay, frequencies, duration, volume }) => {
            frequencies.forEach((frequency, harmonicIndex) => {
              const oscillator = context.createOscillator(); const gain = context.createGain(); const start = context.currentTime + delay;
              oscillator.type = "sine"; oscillator.frequency.value = frequency; gain.gain.setValueAtTime(0.0001, start); gain.gain.exponentialRampToValueAtTime(harmonicIndex === 0 ? volume : volume * 0.55, start + 0.025); gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
              oscillator.connect(gain); gain.connect(context.destination); oscillator.start(start); oscillator.stop(start + duration + 0.03);
            });
          });
        });
      }
      navigator.vibrate?.([220, 180, 220, 180, 220]);
      toast.success(`${bus.service} · ${t.reminderAlert}`);
    });
    setReminders((current) => { const next = new Set(current); due.forEach((bus) => next.delete(`${activeStop}:${bus.service}`)); return next; });
  }, [activeStop, arrivals, reminders, t.reminderAlert]);

  const toggleReminder = (service: string) => {
    if (!audioRef.current) audioRef.current = new AudioContext();
    void audioRef.current.resume();
    const key = `${activeStop}:${service}`;
    setReminders((current) => { const next = new Set(current); if (next.has(key)) next.delete(key); else { next.add(key); toast.success(`${service} · ${t.reminderReady}`); } return next; });
  };

  useEffect(() => {
    let cancelled = false;
    setStopName("");
    setStopRoad("");
    fetch(`/api/bus-stop?stop=${activeStop}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data: { name?: string; roadName?: string } | null) => {
        if (!cancelled) {
          setStopName(data?.name || "");
          setStopRoad(data?.roadName || "");
        }
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [activeStop]);

  const switchLanguage = (next: Language) => { setLanguage(next); localStorage.setItem("bus-status-language", next); };
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setShowQr(false); setNearbyStops([]); setAddressResults([]); setLocationMessage("");
    const query = stop.trim();
    if (/^\d{5}$/.test(query)) { void loadArrivals(query); return; }
    if (query.length < 3) { setLocationMessage(t.invalid); return; }
    setSearching(true);
    try {
      const response = await fetch(`/api/address-search?q=${encodeURIComponent(query)}`);
      const data = await response.json() as { results?: AddressResult[] };
      if (!response.ok) throw new Error();
      setAddressResults(data.results || []);
      if (!data.results?.length) setLocationMessage(t.noAddress);
    } catch { setLocationMessage(t.searchError); }
    finally { setSearching(false); }
  };
  const distanceInMetres = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const toRad = (value: number) => value * Math.PI / 180;
    const dLat = toRad(lat2 - lat1); const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return Math.round(6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };
  const findNearbyStops = async (lat: number, lng: number) => {
    const response = await fetch("/api/bus-stops");
    const data = await response.json() as { stops?: Omit<NearbyStop, "distance">[] };
    if (!response.ok || !data.stops) throw new Error();
    const nearest = data.stops.map((item) => ({ ...item, distance: distanceInMetres(lat, lng, item.lat, item.lng) })).sort((a, b) => a.distance - b.distance).slice(0, 5);
    setNearbyStops(nearest);
  };
  const useMyLocation = () => {
    setLocationMessage(""); setNearbyStops([]);
    if (!navigator.geolocation) { setLocationMessage(t.locationDenied); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        await findNearbyStops(coords.latitude, coords.longitude);
      } catch { setLocationMessage(t.locationError); }
      finally { setLocating(false); }
    }, () => { setLocationMessage(t.locationDenied); setLocating(false); }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  };
  const selectAddress = async (item: AddressResult) => {
    setStop(item.postal || item.address); setAddressResults([]); setLocationMessage(""); setLocating(true);
    try { await findNearbyStops(item.lat, item.lng); }
    catch { setLocationMessage(t.locationError); }
    finally { setLocating(false); }
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

  const pageTitle = language === "zh"
    ? "新加坡巴士到站时间｜实时查询、邮编查附近巴士站｜忠邦华语演讲会"
    : "Yishun Bus Arrival & Singapore Bus Timing in Chinese | Chong Pang TMC";
  const pageDescription = language === "zh"
    ? "免费进行新加坡巴士实时查询。输入巴士站编号、邮编或地址，查看新加坡巴士到站时间、附近5个巴士站、义顺巴士到站时间、车型及载客情况。"
    : "Check Yishun bus arrival and Singapore bus timing in Chinese or English. Search live arrivals by bus stop number, postal code, address or current location.";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "新加坡巴士到站时间查询",
    alternateName: "Singapore Bus Arrival Time",
    url: "https://chongpangtmc.hellosg.org/bus_status",
    description: pageDescription,
    applicationCategory: "TravelApplication",
    operatingSystem: "Web",
    inLanguage: ["zh-CN", "en"],
    offers: { "@type": "Offer", price: "0", priceCurrency: "SGD" },
    provider: { "@type": "Organization", name: "忠邦华语演讲会 Chong Pang TMC", url: "https://chongpangtmc.hellosg.org/" },
  };

  return <main className="min-h-screen bg-[#f2f6ed] text-[#092623] font-body">
    <Helmet>
      <html lang={language === "zh" ? "zh-CN" : "en"} />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content="新加坡巴士到站时间,新加坡巴士实时查询,邮编查询附近巴士站,义顺巴士到站时间,Yishun bus arrival,Singapore bus timing Chinese" />
      <link rel="canonical" href="https://chongpangtmc.hellosg.org/bus_status" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content="https://chongpangtmc.hellosg.org/bus_status" />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
    <header className="border-b border-emerald-950/10 bg-[#092f2b] text-white"><div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 py-4">
      <div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-950/20"><BusFront size={22}/></span><div className="min-w-0"><div className="flex flex-wrap items-baseline gap-x-2"><p className="font-body text-base font-black leading-none tracking-tight text-white sm:text-xl">{language === "zh" ? <><span>忠邦华语演讲会</span><span className="ml-1.5 text-red-400">温馨服务</span></> : t.brand}</p><a href="https://chongpangtmc.hellosg.org/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-white/80 underline decoration-red-500 decoration-2 underline-offset-4 hover:text-white sm:text-xs">chongpangtmc.hellosg.org</a></div><p className="mt-1 text-sm font-semibold text-white/90 sm:text-base">{t.title}</p></div></div>
      <div className="flex rounded-full bg-white/10 p-1 text-xs font-bold" aria-label="Language"><button onClick={() => switchLanguage("zh")} className={`rounded-full px-2.5 py-1 ${language === "zh" ? "bg-white text-[#092f2b]" : "text-emerald-100"}`}>中文</button><button onClick={() => switchLanguage("en")} className={`rounded-full px-2.5 py-1 ${language === "en" ? "bg-white text-[#092f2b]" : "text-emerald-100"}`}>EN</button></div>
    </div></header>

    <div className="mx-auto max-w-2xl px-4 pb-12 pt-5 sm:px-5">
      <nav className="mb-5 grid grid-cols-2 rounded-2xl bg-white p-1.5 shadow-sm" aria-label="Transport status"><span className="rounded-xl bg-[#092f2b] px-4 py-2.5 text-center text-sm font-bold text-white">{language === "zh" ? "巴士查询" : "Bus arrivals"}</span><Link to="/mrt_status" className="rounded-xl px-4 py-2.5 text-center text-sm font-bold text-slate-500 hover:bg-slate-50">{language === "zh" ? "地铁状态" : "Train status"}</Link></nav>
      <section className="rounded-[28px] bg-[#092f2b] p-5 text-white shadow-[0_20px_50px_rgba(9,38,35,.16)] sm:p-7">
        <h1 className="text-2xl font-bold tracking-[-.03em] sm:text-3xl">{t.heading}</h1><p className="mt-2 text-sm text-emerald-100">{t.hint}</p>
        <form onSubmit={submit} className="mt-6 flex gap-2"><div className="relative min-w-0 flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={19}/><Input aria-label={t.input} maxLength={100} value={stop} onChange={e => setStop(e.target.value)} className="h-12 rounded-2xl border-0 bg-white pl-11 text-base font-semibold text-slate-950" placeholder={t.placeholder}/></div><Button disabled={searching} className="h-12 rounded-2xl bg-[#c9f45b] px-5 font-bold text-[#092f2b] hover:bg-lime-300 disabled:opacity-60">{searching ? t.searching : t.go}</Button></form>
        <button type="button" disabled={locating} onClick={useMyLocation} className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-100 disabled:opacity-60"><LocateFixed className={locating ? "animate-pulse" : ""} size={17}/> {locating ? t.locating : t.location}</button>
        {locationMessage && <p className="mt-3 rounded-xl bg-amber-100 px-3 py-2 text-xs text-amber-950">{locationMessage}</p>}
        {addressResults.length > 0 && <div className="mt-4 overflow-hidden rounded-2xl bg-white text-[#092623]"><p className="border-b border-slate-100 px-4 py-3 text-sm font-bold">{t.matches}</p>{addressResults.map((item, index) => <button type="button" key={`${item.address}-${index}`} onClick={() => void selectAddress(item)} className="block w-full border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-emerald-50"><strong className="text-sm">{item.address}</strong>{item.building && <span className="mt-0.5 block text-xs text-slate-500">{item.building}</span>}</button>)}</div>}
        {nearbyStops.length > 0 && <div className="mt-4 overflow-hidden rounded-2xl bg-white text-[#092623]"><p className="border-b border-slate-100 px-4 py-3 text-sm font-bold">{t.nearby}</p>{nearbyStops.map((item) => <button type="button" key={item.code} onClick={() => selectNearbyStop(item)} className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-emerald-50"><span className="min-w-0"><strong className="text-sm">{item.code} · {item.name}</strong><span className="mt-0.5 block truncate text-xs text-slate-500">{item.road}</span></span><span className="shrink-0 rounded-full bg-[#e8f8bd] px-2.5 py-1 text-xs font-bold">{item.distance} {t.metres}</span></button>)}</div>}
      </section>

      <section className="mt-7"><div className="mb-4 flex items-end justify-between gap-4 px-1"><div><p className="text-xs font-bold uppercase tracking-[.13em] text-emerald-700">{t.arrivals}</p><h2 className="mt-1 text-xl font-bold">{t.stop} {activeStop}{stopName ? ` · ${stopName}` : ""}</h2>{stopRoad && <p className="mt-1 text-sm font-medium text-slate-500">{stopRoad}</p>}</div><button disabled={loading} onClick={() => void loadArrivals(activeStop)} className="flex items-center gap-1.5 rounded-full border border-emerald-950/10 bg-white px-3 py-2 text-xs font-semibold shadow-sm disabled:opacity-50"><RefreshCw className={loading ? "animate-spin" : ""} size={14}/> {t.refresh}</button></div>
        <div className={`mb-3 flex items-start gap-2 rounded-2xl px-3.5 py-3 text-xs font-medium ${status === "success" ? "border border-emerald-200 bg-emerald-50 text-emerald-900" : "border border-amber-200 bg-amber-50 text-amber-900"}`}><AlertTriangle className="mt-0.5 shrink-0" size={15}/><span>{notice}</span></div>
        <div className="space-y-3">{!loading && arrivals.length === 0 && <div className="rounded-[24px] border border-emerald-950/10 bg-white p-8 text-center text-sm text-slate-500">{t.empty}</div>}{arrivals.map(bus => { const reminderOn = reminders.has(`${activeStop}:${bus.service}`); const arrivingSoon = bus.minutes[0] <= 1; return <article key={bus.service} className="rounded-[24px] border border-emerald-950/10 bg-white p-4 shadow-[0_8px_30px_rgba(9,38,35,.06)] sm:p-5"><div className="flex items-center gap-3"><div className="flex shrink-0 flex-col items-center gap-1"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#c9f45b] text-xl font-black">{bus.service}</div><a href={`/bus_route?service=${encodeURIComponent(bus.service)}&stop=${activeStop}`} target="_blank" rel="noopener noreferrer" aria-label={`${bus.service} ${t.route}`} className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 hover:bg-emerald-50"><MapPinned size={11}/>{t.route}</a></div><div className="min-w-0 flex-1"><div className="flex items-baseline justify-between gap-2"><span className="text-xs font-semibold text-slate-500">{t.next}</span><span className="text-xs text-slate-400">{bus.type}</span></div><div className="mt-1 flex items-baseline gap-2"><span className={`text-3xl font-black tracking-[-.05em] ${arrivingSoon ? "animate-pulse text-red-600" : ""}`}>{bus.minutes[0] === 0 ? t.arriving : bus.minutes[0]}</span>{bus.minutes[0] !== 0 && <span className={`font-semibold ${arrivingSoon ? "animate-pulse text-red-600" : "text-slate-500"}`}>{t.min}</span>}<span className="ml-auto text-sm font-bold text-emerald-700">{bus.minutes.slice(1).join(" · ")} {t.min}</span></div></div><button type="button" onClick={() => toggleReminder(bus.service)} aria-label={`${bus.service} ${reminderOn ? t.reminderOn : t.remind}`} className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl px-2.5 py-2 text-[10px] font-bold ${reminderOn ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-emerald-50"}`}>{reminderOn ? <BellRing size={19}/> : <Bell size={19}/>}<span>{reminderOn ? t.reminderOn : t.remind}</span></button></div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs"><span className="font-semibold text-emerald-700">● {bus.load}</span><span className="text-slate-400">{bus.wheelchair ? t.wheelchair : ""}</span></div></article>})}</div>
        <button onClick={() => setShowQr(v => !v)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-950/10 bg-white px-4 py-3 text-sm font-bold shadow-sm"><QrCode size={18}/> {t.qrButton}</button>
        {showQr && <div className="mt-3 rounded-[24px] border border-emerald-950/10 bg-white p-5 text-center shadow-[0_8px_30px_rgba(9,38,35,.06)]"><h3 className="font-bold">{t.qrTitle} · {activeStop}</h3><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">{t.qrHelp}</p><div className="mx-auto mt-4 w-fit rounded-2xl border border-slate-200 p-3"><QRCodeCanvas ref={qrRef} value={qrUrl} size={220} level="H" marginSize={1}/></div><button onClick={() => void downloadQr()} className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-[#c9f45b] px-5 py-2.5 text-sm font-bold"><Download size={17}/> {t.download}</button>{qrImage && <div className="mt-4 rounded-2xl bg-amber-50 p-3"><p className="mb-2 text-xs leading-5 text-amber-900">{t.saveHint}</p><img src={qrImage} alt={`${t.stop} ${activeStop} QR`} className="mx-auto h-[220px] w-[220px]"/></div>}<p className="mt-3 break-all text-[11px] text-slate-400">{qrUrl}</p></div>}
        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-500"><Clock3 size={14}/> {t.updated} {updated} · {t.estimate}</p>
        <section className="mt-8 rounded-[24px] border border-emerald-950/10 bg-white p-5 shadow-[0_8px_30px_rgba(9,38,35,.04)] sm:p-6">
          <h2 className="text-lg font-black tracking-tight text-[#092f2b]">{language === "zh" ? "新加坡巴士实时查询使用说明" : "Singapore bus arrival guide"}</h2>
          {language === "zh" ? <>
            <p className="mt-3 text-sm leading-7 text-slate-600">本页提供免费的<strong className="text-slate-800">新加坡巴士到站时间</strong>查询。输入五位数巴士站编号，即可查看下一班巴士预计还有几分钟到达、车型和载客情况，页面每20秒自动更新。</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl bg-[#f2f6ed] p-4"><h3 className="font-bold text-[#092f2b]">如何用邮编查询附近巴士站？</h3><p className="mt-2 text-sm leading-6 text-slate-600">在上方输入新加坡六位数邮编，选择正确地址后，系统会列出距离该地址最近的5个巴士站。也可以输入道路名称或允许网页使用当前位置。</p></article>
              <article className="rounded-2xl bg-[#f2f6ed] p-4"><h3 className="font-bold text-[#092f2b]">如何查询义顺巴士到站时间？</h3><p className="mt-2 text-sm leading-6 text-slate-600">输入义顺一带的邮编、Yishun道路名称或巴士站编号，再选择附近车站，即可进行义顺巴士到站时间查询。</p></article>
            </div>
          </> : <>
            <p className="mt-3 text-sm leading-7 text-slate-600">Use this free tool for <strong className="text-slate-800">Singapore bus timing in Chinese or English</strong>. Enter a five-digit bus stop code to see live arrival estimates, bus type and crowd level, refreshed every 20 seconds.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl bg-[#f2f6ed] p-4"><h3 className="font-bold text-[#092f2b]">Find stops by postal code</h3><p className="mt-2 text-sm leading-6 text-slate-600">Enter a six-digit Singapore postal code or address and choose a result to find the five nearest bus stops.</p></article>
              <article className="rounded-2xl bg-[#f2f6ed] p-4"><h3 className="font-bold text-[#092f2b]">Yishun bus arrival</h3><p className="mt-2 text-sm leading-6 text-slate-600">Search a Yishun postal code, road name or bus stop number to check live arrivals for nearby stops.</p></article>
            </div>
          </>}
          <p className="mt-5 text-xs leading-6 text-slate-500">{language === "zh" ? "资料来源：新加坡陆路交通管理局 DataMall。到站时间为实时估算，仅供出行参考。" : "Data source: Singapore Land Transport Authority DataMall. Arrival times are live estimates for journey planning."}</p>
        </section>
      </section>
    </div>
  </main>;
};

export default BusStatus;
