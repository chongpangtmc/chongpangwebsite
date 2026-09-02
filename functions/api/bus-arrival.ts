type Env = {
  LTA_ACCOUNT_KEY?: string;
};

type Bus = {
  EstimatedArrival?: string;
  Load?: string;
  Type?: string;
  Feature?: string;
};

type Service = {
  ServiceNo: string;
  NextBus?: Bus;
  NextBus2?: Bus;
  NextBus3?: Bus;
};

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...init.headers },
  });

const minutes = (value?: string) => {
  if (!value) return null;
  return Math.max(0, Math.floor((new Date(value).getTime() - Date.now()) / 60000));
};

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const stop = new URL(request.url).searchParams.get("stop") || "";
  if (!/^\d{5}$/.test(stop)) return json({ error: "请输入正确的五位数巴士站编号" }, { status: 400 });
  if (!env.LTA_ACCOUNT_KEY) return json({ error: "实时巴士服务尚未完成配置" }, { status: 503 });

  try {
    const response = await fetch(`https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${stop}`, {
      headers: { AccountKey: env.LTA_ACCOUNT_KEY, accept: "application/json" },
    });
    if (!response.ok) throw new Error(`LTA response ${response.status}`);

    const data = (await response.json()) as { Services?: Service[] };
    const arrivals = (data.Services || [])
      .map((service) => {
        const buses = [service.NextBus, service.NextBus2, service.NextBus3].filter(Boolean) as Bus[];
        return {
          service: service.ServiceNo,
          minutes: buses.map((bus) => minutes(bus.EstimatedArrival)).filter((value): value is number => value !== null),
          load: ({ SEA: "Seats available", SDA: "Standing available", LSD: "Limited standing" } as Record<string, string>)[buses[0]?.Load || ""] || "Load unavailable",
          type: ({ DD: "Double deck", SD: "Single deck", BD: "Bendy bus" } as Record<string, string>)[buses[0]?.Type || ""] || "Bus",
          wheelchair: buses[0]?.Feature === "WAB",
        };
      })
      .filter((service) => service.minutes.length > 0);

    return json({ arrivals }, { headers: { "cache-control": "no-store" } });
  } catch {
    return json({ error: "实时巴士数据暂时无法使用，请稍后重试" }, { status: 503 });
  }
};
