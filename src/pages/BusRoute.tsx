import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BusFront, MapPin } from "lucide-react";
import { Helmet } from "react-helmet-async";

type Language = "zh" | "en";
type RouteStop = { ServiceNo: string; Operator: string; Direction: number; StopSequence: number; BusStopCode: string; Distance: number };
type StopInfo = { code: string; name: string; road: string };

const BusRoute = () => {
  const params = new URLSearchParams(location.search);
  const service = (params.get("service") || "").toUpperCase();
  const selectedStop = params.get("stop") || "";
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem("bus-status-language") === "en" ? "en" : "zh");
  const [routes, setRoutes] = useState<RouteStop[]>([]);
  const [stops, setStops] = useState<Record<string, StopInfo>>({});
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const routeController = new AbortController();
    const stopController = new AbortController();
    const routeTimeout = window.setTimeout(() => routeController.abort(), 15000);
    const stopTimeout = window.setTimeout(() => stopController.abort(), 8000);

    fetch(`/api/bus-route?service=${encodeURIComponent(service)}`, { signal: routeController.signal }).then(async (response) => {
        const data = await response.json() as { routes?: RouteStop[]; error?: string };
        if (!response.ok) throw new Error(data.error);
        return data.routes || [];
      }).then((routeData) => {
        setRoutes(routeData);
        setDirection(routeData[0]?.Direction || 1);
        if (!routeData.length) setError(language === "zh" ? "找不到这条巴士路线" : "This bus route was not found");
      }).catch(() => setError(language === "zh" ? "暂时无法读取巴士路线，请稍后重试。" : "The bus route is temporarily unavailable. Please try again."))
        .finally(() => { window.clearTimeout(routeTimeout); setLoading(false); });

    fetch("/api/bus-stops", { signal: stopController.signal }).then(async (response) => {
        const data = await response.json() as { stops?: StopInfo[] };
        if (!response.ok) throw new Error();
        return data.stops || [];
      }).then((stopData) => {
      setStops(Object.fromEntries(stopData.map((stop) => [stop.code, stop])));
      }).catch(() => undefined).finally(() => window.clearTimeout(stopTimeout));

    return () => { window.clearTimeout(routeTimeout); window.clearTimeout(stopTimeout); routeController.abort(); stopController.abort(); };
  }, [service, language]);

  const directions = useMemo(() => [...new Set(routes.map((route) => route.Direction))], [routes]);
  const visibleStops = routes.filter((route) => route.Direction === direction);
  const first = stops[visibleStops[0]?.BusStopCode];
  const last = stops[visibleStops[visibleStops.length - 1]?.BusStopCode];
  const switchLanguage = (next: Language) => { setLanguage(next); localStorage.setItem("bus-status-language", next); };

  return <main className="min-h-screen bg-[#f2f6ed] font-body text-[#092623]">
    <Helmet><html lang={language === "zh" ? "zh-CN" : "en"}/><title>{language === "zh" ? `巴士 ${service} 完整路线｜忠邦华语演讲会` : `Bus ${service} Full Route | Chong Pang TMC`}</title><meta name="robots" content="noindex,follow"/></Helmet>
    <header className="bg-[#092f2b] text-white"><div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-red-600"><BusFront size={22}/></span><div><p className="font-black">{language === "zh" ? "忠邦华语演讲会温馨服务" : "Chong Pang TMC"}</p><p className="text-sm text-emerald-100">{language === "zh" ? "新加坡巴士完整路线" : "Singapore bus full route"}</p></div></div><div className="flex rounded-full bg-white/10 p-1 text-xs font-bold"><button onClick={() => switchLanguage("zh")} className={`rounded-full px-2.5 py-1 ${language === "zh" ? "bg-white text-[#092f2b]" : ""}`}>中文</button><button onClick={() => switchLanguage("en")} className={`rounded-full px-2.5 py-1 ${language === "en" ? "bg-white text-[#092f2b]" : ""}`}>EN</button></div></div></header>
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-5">
      <a href={`/bus_status${selectedStop ? `?stop=${selectedStop}` : ""}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800"><ArrowLeft size={16}/>{language === "zh" ? "返回巴士到站时间" : "Back to bus arrivals"}</a>
      <section className="mt-4 rounded-[28px] bg-[#092f2b] p-5 text-white shadow-xl sm:p-7"><p className="text-xs font-bold uppercase tracking-widest text-emerald-200">{language === "zh" ? "完整路线" : "Full route"}</p><div className="mt-2 flex items-center gap-3"><span className="grid h-16 min-w-16 place-items-center rounded-2xl bg-[#c9f45b] px-3 text-2xl font-black text-[#092f2b]">{service || "—"}</span><div><h1 className="text-xl font-black sm:text-2xl">{first?.name || first?.code || "—"} → {last?.name || last?.code || "—"}</h1><p className="mt-1 text-sm text-emerald-100">{visibleStops.length} {language === "zh" ? "个巴士站" : "stops"}</p></div></div></section>
      {directions.length > 1 && <div className="mt-4 grid grid-cols-2 rounded-2xl bg-white p-1.5 shadow-sm">{directions.map((item) => <button key={item} onClick={() => setDirection(item)} className={`rounded-xl px-3 py-2.5 text-sm font-bold ${direction === item ? "bg-[#c9f45b] text-[#092f2b]" : "text-slate-500"}`}>{language === "zh" ? `方向 ${item}` : `Direction ${item}`}</button>)}</div>}
      <section className="mt-4 overflow-hidden rounded-[28px] border border-emerald-950/10 bg-white p-5 shadow-sm sm:p-7">
        {loading && <p className="py-12 text-center text-sm text-slate-500">{language === "zh" ? "正在读取路线…" : "Loading route…"}</p>}
        {error && <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">{error}</p>}
        {!loading && !error && <ol>{visibleStops.map((route, index) => { const info = stops[route.BusStopCode]; const current = route.BusStopCode === selectedStop; return <li key={`${route.Direction}-${route.BusStopCode}-${route.StopSequence}`} className="relative flex gap-4 pb-6 last:pb-0"><div className="relative flex w-7 shrink-0 justify-center"><span className={`relative z-10 mt-1 grid h-6 w-6 place-items-center rounded-full border-[5px] ${current ? "border-red-600 bg-red-600 ring-4 ring-red-100" : "border-emerald-700 bg-white"}`}>{current && <MapPin size={11} className="text-white"/>}</span>{index < visibleStops.length - 1 && <span className="absolute bottom-[-4px] top-6 w-1 bg-emerald-700"/>}</div><div className={`min-w-0 flex-1 rounded-2xl px-3 py-2 ${current ? "bg-red-50" : ""}`}><div className="flex flex-wrap items-center gap-2"><strong className="text-sm">{route.BusStopCode} · {info?.name || (language === "zh" ? "巴士站" : "Bus stop")}</strong>{current && <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">{language === "zh" ? "当前车站" : "Current stop"}</span>}</div>{info?.road && <p className="mt-1 text-xs text-slate-500">{info.road}</p>}<p className="mt-1 text-[11px] text-slate-400">{language === "zh" ? "第" : "Stop"} {route.StopSequence}{language === "zh" ? "站" : ""}{route.Distance > 0 ? ` · ${route.Distance.toFixed(1)} km` : ""}</p></div></li>})}</ol>}
      </section>
      <p className="mt-5 text-center text-xs text-slate-500">{language === "zh" ? "路线及车站资料来自新加坡陆路交通管理局 DataMall。" : "Route and stop data from Singapore Land Transport Authority DataMall."}</p>
    </div>
  </main>;
};

export default BusRoute;
