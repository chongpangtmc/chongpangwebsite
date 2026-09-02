type Env = { LTA_ACCOUNT_KEY?: string };
type BusStop = { BusStopCode: string; Description: string; RoadName?: string };

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...init.headers },
  });

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const stop = new URL(request.url).searchParams.get("stop") || "";
  if (!/^\d{5}$/.test(stop)) return json({ error: "请输入正确的五位数巴士站编号" }, { status: 400 });
  if (!env.LTA_ACCOUNT_KEY) return json({ error: "巴士站资料尚未完成配置" }, { status: 503 });

  const cache = caches.default;
  const cacheKey = new Request(`${new URL(request.url).origin}/api/bus-stop-cache?stop=${stop}`);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    for (let skip = 0; skip <= 6000; skip += 500) {
      const response = await fetch(`https://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=${skip}`, {
        headers: { AccountKey: env.LTA_ACCOUNT_KEY, accept: "application/json" },
      });
      if (!response.ok) throw new Error(`LTA response ${response.status}`);
      const data = await response.json() as { value?: BusStop[] };
      const stops = data.value || [];
      const found = stops.find((item) => item.BusStopCode === stop);
      if (found) {
        const result = json(
          { name: found.Description, roadName: found.RoadName || "" },
          { headers: { "cache-control": "public, max-age=604800" } },
        );
        await cache.put(cacheKey, result.clone());
        return result;
      }
      if (stops.length < 500) break;
    }
    return json({ name: "", roadName: "" }, { status: 404 });
  } catch {
    return json({ error: "暂时无法读取巴士站名称" }, { status: 503 });
  }
};
