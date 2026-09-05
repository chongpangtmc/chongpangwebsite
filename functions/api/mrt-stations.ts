type Env = { ONEMAP_EMAIL?: string; ONEMAP_PASSWORD?: string };
type SearchResult = { ADDRESS?: string; BUILDING?: string; LATITUDE?: string; LONGITUDE?: string };
let tokenCache = { value: "", expiresAt: 0 };
const json = (body: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(body), { ...init, headers: { "content-type": "application/json; charset=utf-8", ...init.headers } });

const getToken = async (env: Env) => {
  if (tokenCache.value && Date.now() < tokenCache.expiresAt - 300_000) return tokenCache.value;
  const response = await fetch("https://www.onemap.gov.sg/api/auth/post/getToken", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: env.ONEMAP_EMAIL, password: env.ONEMAP_PASSWORD }) });
  const data = await response.json() as { access_token?: string; expiry_timestamp?: string };
  if (!response.ok || !data.access_token) throw new Error();
  tokenCache = { value: data.access_token, expiresAt: Number(data.expiry_timestamp || 0) * 1000 || Date.now() + 71 * 60 * 60 * 1000 };
  return tokenCache.value;
};

const codesFrom = (text: string) => Array.from(new Set((text.match(/\b(?:NS\d+|EW\d+|CG\d+|NE\d+|CC\d+|CE\d+|DT\d+|TE\d+|BP\d+|SE\d+|SW\d+|STC|PE\d+|PW\d+|PTC)\b/gi) || []).map((code) => code.toUpperCase())));

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.ONEMAP_EMAIL || !env.ONEMAP_PASSWORD) return json({ error: "地铁站搜索尚未完成配置" }, { status: 503 });
  const query = (new URL(request.url).searchParams.get("q") || "").trim();
  const cache = caches.default;
  const cacheKey = new Request(`${new URL(request.url).origin}/api/mrt-stations-cache-v3?q=${encodeURIComponent(query.toLowerCase())}`);
  const cached = await cache.match(cacheKey); if (cached) return cached;
  try {
    const token = await getToken(env);
    const terms = query ? [`${query} MRT`, `${query} LRT`] : ["MRT STATION", "LRT STATION"];
    const raw: SearchResult[] = [];
    for (const term of terms) {
      let totalPages = 1;
      for (let page = 1; page <= Math.min(totalPages, query ? 1 : 20); page++) {
        const url = new URL("https://www.onemap.gov.sg/api/common/elastic/search");
        url.searchParams.set("searchVal", term); url.searchParams.set("returnGeom", "Y"); url.searchParams.set("getAddrDetails", "Y"); url.searchParams.set("pageNum", String(page));
        const response = await fetch(url.toString(), { headers: { Authorization: token, accept: "application/json" } });
        if (!response.ok) throw new Error();
        const data = await response.json() as { results?: SearchResult[]; totalNumPages?: number };
        raw.push(...(data.results || [])); totalPages = Number(data.totalNumPages || 1);
      }
    }
    const seen = new Set<string>();
    const stations = raw.map((item) => {
      const label = `${item.BUILDING || ""} ${item.ADDRESS || ""}`.replace(/\s+/g, " ").trim();
      return { name: item.BUILDING && item.BUILDING !== "NIL" ? item.BUILDING : item.ADDRESS || "MRT/LRT Station", address: item.ADDRESS || "", codes: codesFrom(label), lat: Number(item.LATITUDE), lng: Number(item.LONGITUDE) };
    }).filter((item) => item.codes.length > 0 && /MRT|LRT/i.test(`${item.name} ${item.address}`) && Number.isFinite(item.lat) && Number.isFinite(item.lng)).filter((item) => { const key = item.codes.slice().sort().join("|"); if (seen.has(key)) return false; seen.add(key); return true; });
    const result = json({ stations: query ? stations.slice(0, 10) : stations }, { headers: { "cache-control": "public, max-age=604800" } });
    await cache.put(cacheKey, result.clone()); return result;
  } catch { tokenCache = { value: "", expiresAt: 0 }; return json({ error: "暂时无法读取地铁站资料" }, { status: 503 }); }
};
