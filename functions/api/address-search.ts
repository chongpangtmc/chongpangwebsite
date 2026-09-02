type Env = { ONEMAP_EMAIL?: string; ONEMAP_PASSWORD?: string };
type TokenResponse = { access_token?: string; expiry_timestamp?: string };
type SearchResult = { ADDRESS: string; POSTAL?: string; BUILDING?: string; LATITUDE: string; LONGITUDE: string };

let tokenCache = { value: "", expiresAt: 0 };

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), { ...init, headers: { "content-type": "application/json; charset=utf-8", ...init.headers } });

const getToken = async (env: Env) => {
  if (tokenCache.value && Date.now() < tokenCache.expiresAt - 300_000) return tokenCache.value;
  const response = await fetch("https://www.onemap.gov.sg/api/auth/post/getToken", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: env.ONEMAP_EMAIL, password: env.ONEMAP_PASSWORD }),
  });
  if (!response.ok) throw new Error("OneMap authentication failed");
  const data = await response.json() as TokenResponse;
  if (!data.access_token) throw new Error("OneMap token unavailable");
  tokenCache = { value: data.access_token, expiresAt: Number(data.expiry_timestamp || 0) * 1000 || Date.now() + 71 * 60 * 60 * 1000 };
  return tokenCache.value;
};

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const query = (new URL(request.url).searchParams.get("q") || "").trim();
  if (query.length < 3 || query.length > 100) return json({ error: "请输入至少三个字符的邮编或地址" }, { status: 400 });
  if (!env.ONEMAP_EMAIL || !env.ONEMAP_PASSWORD) return json({ error: "地址搜索尚未完成配置" }, { status: 503 });

  const cache = caches.default;
  const cacheKey = new Request(`${new URL(request.url).origin}/api/address-search-cache?q=${encodeURIComponent(query.toLowerCase())}`);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    const token = await getToken(env);
    const url = new URL("https://www.onemap.gov.sg/api/common/elastic/search");
    url.searchParams.set("searchVal", query);
    url.searchParams.set("returnGeom", "Y");
    url.searchParams.set("getAddrDetails", "Y");
    url.searchParams.set("pageNum", "1");
    const response = await fetch(url.toString(), { headers: { Authorization: token, accept: "application/json" } });
    if (!response.ok) throw new Error(`OneMap response ${response.status}`);
    const data = await response.json() as { results?: SearchResult[] };
    const results = (data.results || []).slice(0, 5).map((item) => ({
      address: item.ADDRESS,
      postal: item.POSTAL || "",
      building: item.BUILDING === "NIL" ? "" : (item.BUILDING || ""),
      lat: Number(item.LATITUDE),
      lng: Number(item.LONGITUDE),
    })).filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));
    const result = json({ results }, { headers: { "cache-control": "public, max-age=86400" } });
    await cache.put(cacheKey, result.clone());
    return result;
  } catch {
    tokenCache = { value: "", expiresAt: 0 };
    return json({ error: "地址搜索暂时无法使用，请稍后重试" }, { status: 503 });
  }
};
