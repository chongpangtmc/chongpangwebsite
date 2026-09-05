type Env = { LTA_ACCOUNT_KEY?: string };
const json = (body: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(body), { ...init, headers: { "content-type": "application/json; charset=utf-8", ...init.headers } });
const lineFor = (code: string) => ({ NS:"NSL", EW:"EWL", CG:"CGL", NE:"NEL", CC:"CCL", CE:"CEL", DT:"DTL", TE:"TEL", BP:"BPL", SE:"SLRT", SW:"SLRT", STC:"SLRT", PE:"PLRT", PW:"PLRT", PTC:"PLRT" } as Record<string,string>)[code.match(/^[A-Z]+/)?.[0] || ""];
export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.LTA_ACCOUNT_KEY) return json({ error: "实时拥挤度尚未完成配置" }, { status: 503 });
  const codes = (new URL(request.url).searchParams.get("codes") || "").toUpperCase().split(",").filter((code) => /^(NS|EW|CG|NE|CC|CE|DT|TE|BP|SE|SW|STC|PE|PW|PTC)\d*$/.test(code));
  if (!codes.length) return json({ levels: [] });
  try {
    const levels = [] as Array<{ code: string; level: string; startTime?: string; endTime?: string }>;
    for (const line of Array.from(new Set(codes.map(lineFor).filter(Boolean)))) {
      const response = await fetch(`https://datamall2.mytransport.sg/ltaodataservice/PCDRealTime?TrainLine=${line}`, { headers: { AccountKey: env.LTA_ACCOUNT_KEY, accept: "application/json" } });
      if (!response.ok) continue;
      const data = await response.json() as { value?: Array<{ Station: string; CrowdLevel: string; StartTime?: string; EndTime?: string }> };
      for (const item of data.value || []) if (codes.includes(item.Station)) levels.push({ code: item.Station, level: item.CrowdLevel, startTime: item.StartTime, endTime: item.EndTime });
    }
    return json({ levels }, { headers: { "cache-control": "public, max-age=300" } });
  } catch { return json({ error: "暂时无法读取车站拥挤度" }, { status: 503 }); }
};
