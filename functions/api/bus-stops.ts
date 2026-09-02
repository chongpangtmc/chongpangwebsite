type Env = { LTA_ACCOUNT_KEY?: string };
type LtaBusStop = { BusStopCode: string; Description: string; RoadName?: string; Latitude: number; Longitude: number };

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), { ...init, headers: { "content-type": "application/json; charset=utf-8", ...init.headers } });

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.LTA_ACCOUNT_KEY) return json({ error: "巴士站资料尚未完成配置" }, { status: 503 });
  const cache = caches.default;
  const cacheKey = new Request(`${new URL(request.url).origin}/api/bus-stops-cache-v1`);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    const all: LtaBusStop[] = [];
    for (let skip = 0; skip <= 6000; skip += 500) {
      const response = await fetch(`https://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=${skip}`, {
        headers: { AccountKey: env.LTA_ACCOUNT_KEY, accept: "application/json" },
      });
      if (!response.ok) throw new Error(`LTA response ${response.status}`);
      const data = await response.json() as { value?: LtaBusStop[] };
      const stops = data.value || [];
      all.push(...stops);
      if (stops.length < 500) break;
    }
    const result = json({ stops: all.map((item) => ({ code: item.BusStopCode, name: item.Description, road: item.RoadName || "", lat: item.Latitude, lng: item.Longitude })) }, { headers: { "cache-control": "public, max-age=604800" } });
    await cache.put(cacheKey, result.clone());
    return result;
  } catch {
    return json({ error: "暂时无法读取附近巴士站" }, { status: 503 });
  }
};
