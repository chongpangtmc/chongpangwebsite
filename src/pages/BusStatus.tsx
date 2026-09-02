import { FormEvent, useCallback, useEffect, useState } from "react";
import { AlertTriangle, BusFront, Clock3, LocateFixed, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Arrival = {
  service: string;
  minutes: number[];
  load: string;
  type: string;
  wheelchair: boolean;
};

const BusStatus = () => {
  const [stop, setStop] = useState("59009");
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("正在读取陆交局实时数据");
  const [updated, setUpdated] = useState("--");

  const loadArrivals = useCallback(async (busStop: string) => {
    if (!/^\d{5}$/.test(busStop)) {
      setNotice("请输入正确的五位数巴士站编号");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/bus-arrival?stop=${busStop}`, { cache: "no-store" });
      const data = (await response.json()) as { arrivals?: Arrival[]; error?: string };
      if (!response.ok) throw new Error(data.error || "暂时无法读取巴士到站数据");
      setArrivals(data.arrivals || []);
      setNotice("Live data from LTA DataMall");
      setUpdated(new Date().toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" }));
      window.history.replaceState({}, "", `/bus_status?stop=${busStop}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "暂时无法读取巴士到站数据");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fromQr = new URLSearchParams(window.location.search).get("stop");
    const initialStop = fromQr && /^\d{5}$/.test(fromQr) ? fromQr : "59009";
    setStop(initialStop);
    void loadArrivals(initialStop);
  }, [loadArrivals]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void loadArrivals(stop);
  };

  return (
    <main className="min-h-screen bg-[#f2f6ed] text-[#092623] font-body">
      <header className="border-b border-emerald-950/10 bg-[#092f2b] text-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#c9f45b] text-[#092f2b]">
              <BusFront size={22} strokeWidth={2.4} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-200">Chong Pang TMC</p>
              <p className="font-semibold tracking-tight">Bus Arrival</p>
            </div>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-emerald-100">Live</span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pb-12 pt-5 sm:px-5">
        <section className="rounded-[28px] bg-[#092f2b] p-5 text-white shadow-[0_20px_50px_rgba(9,38,35,.16)] sm:p-7">
          <p className="text-sm font-medium text-emerald-200">Where is my bus?</p>
          <h1 className="mt-1 font-body text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Arrivals at your stop</h1>
          <form onSubmit={submit} className="mt-6 flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
              <Input
                aria-label="Bus stop code"
                inputMode="numeric"
                maxLength={5}
                value={stop}
                onChange={(event) => setStop(event.target.value.replace(/\D/g, ""))}
                className="h-12 rounded-2xl border-0 bg-white pl-11 text-base font-semibold text-slate-950 shadow-none"
                placeholder="Enter 5-digit stop code"
              />
            </div>
            <Button className="h-12 rounded-2xl bg-[#c9f45b] px-5 font-bold text-[#092f2b] hover:bg-lime-300">Go</Button>
          </form>
          <button
            type="button"
            onClick={() => setNotice("附近车站定位功能将在下一阶段启用")}
            className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-100"
          >
            <LocateFixed size={17} /> Use my location
          </button>
        </section>

        <section className="mt-7">
          <div className="mb-4 flex items-end justify-between gap-4 px-1">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-emerald-700">Live arrivals</p>
              <h2 className="mt-1 font-body text-xl font-bold tracking-tight">Bus stop {stop || "--"}</h2>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => void loadArrivals(stop)}
              className="flex items-center gap-1.5 rounded-full border border-emerald-950/10 bg-white px-3 py-2 text-xs font-semibold text-emerald-950 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={loading ? "animate-spin" : ""} size={14} /> Refresh
            </button>
          </div>

          <div className={`mb-3 flex items-start gap-2 rounded-2xl px-3.5 py-3 text-xs font-medium ${notice.startsWith("Live") ? "border border-emerald-200 bg-emerald-50 text-emerald-900" : "border border-amber-200 bg-amber-50 text-amber-900"}`}>
            <AlertTriangle className="mt-0.5 shrink-0" size={15} />
            <span>{notice}</span>
          </div>

          <div className="space-y-3">
            {!loading && arrivals.length === 0 && (
              <div className="rounded-[24px] border border-emerald-950/10 bg-white p-8 text-center text-sm text-slate-500">
                这个车站目前没有可用的巴士到站资料
              </div>
            )}
            {arrivals.map((bus) => (
              <article key={bus.service} className="rounded-[24px] border border-emerald-950/10 bg-white p-4 shadow-[0_8px_30px_rgba(9,38,35,.06)] sm:p-5">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#c9f45b] text-xl font-black text-[#092f2b]">{bus.service}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2"><span className="text-xs font-semibold text-slate-500">Next bus</span><span className="text-xs text-slate-400">{bus.type}</span></div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-black tracking-[-0.05em] text-[#092f2b]">{bus.minutes[0] === 0 ? "Arr" : bus.minutes[0]}</span>
                      {bus.minutes[0] !== 0 && <span className="font-semibold text-slate-500">min</span>}
                      <span className="ml-auto text-sm font-bold text-emerald-700">{bus.minutes.slice(1).join(" · ")} min</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="font-semibold text-emerald-700">● {bus.load}</span>
                  <span className="text-slate-400">{bus.wheelchair ? "Wheelchair accessible" : ""}</span>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-500"><Clock3 size={14} /> Updated {updated} · Times are estimates</p>
        </section>
      </div>
    </main>
  );
};

export default BusStatus;
