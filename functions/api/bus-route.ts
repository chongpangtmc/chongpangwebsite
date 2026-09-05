type Env = { LTA_ACCOUNT_KEY?: string };
type RouteStop = {
  ServiceNo: string;
  Operator: string;
  Direction: number;
  StopSequence: number;
  BusStopCode: string;
  Distance: number;
};

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), { ...init, headers: { "content-type": "application/json; charset=utf-8", ...init.headers } });

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const service = (new URL(request.url).searchParams.get("service") || "").trim().toUpperCase();
  if (!/^[A-Z0-9]{1,6}$/.test(service)) return json({ error: "请输入正确的巴士号码" }, { status: 400 });
  if (!env.LTA_ACCOUNT_KEY) return json({ error: "巴士路线资料尚未完成配置" }, { status: 503 });

  const cache = caches.default;
  const cacheKey = new Request(`${new URL(request.url).origin}/api/bus-route-cache-v1?service=${encodeURIComponent(service)}`);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const requestPage = async (url: string) => {
    const response = await fetch(url, { headers: { AccountKey: env.LTA_ACCOUNT_KEY!, accept: "application/json" } });
    if (!response.ok) throw new Error(`LTA response ${response.status}`);
    return ((await response.json()) as { value?: RouteStop[] }).value || [];
  };

  try {
    const endpoint = "https://datamall2.mytransport.sg/ltaodataservice/BusRoutes";
    let routes: RouteStop[] = [];
    const pageSize = 500;
    const batchSize = 5;

    // DataMall's BusRoutes dataset supports $skip pagination but not reliable $filter queries.
    // Read small batches concurrently and stop as soon as the requested, contiguous service is found.
    for (let batchStart = 0; batchStart <= 50000; batchStart += pageSize * batchSize) {
      const pages = await Promise.all(Array.from({ length: batchSize }, (_, index) =>
        requestPage(`${endpoint}?$skip=${batchStart + index * pageSize}`)
      ));
      const matches = pages.flatMap((page) => page.filter((item) => item.ServiceNo.toUpperCase() === service));
      if (matches.length) {
        routes.push(...matches);
        const lastMatchingPage = pages.findLastIndex((page) => page.some((item) => item.ServiceNo.toUpperCase() === service));
        if (lastMatchingPage === pages.length - 1) {
          const nextPage = await requestPage(`${endpoint}?$skip=${batchStart + batchSize * pageSize}`);
          routes.push(...nextPage.filter((item) => item.ServiceNo.toUpperCase() === service));
        }
        break;
      }
      if (pages.some((page) => page.length < pageSize)) break;
    }

    routes.sort((a, b) => a.Direction - b.Direction || a.StopSequence - b.StopSequence);
    const result = json({ service, routes }, { headers: { "cache-control": "public, max-age=604800" } });
    await cache.put(cacheKey, result.clone());
    return result;
  } catch {
    return json({ error: "暂时无法读取巴士路线" }, { status: 503 });
  }
};
