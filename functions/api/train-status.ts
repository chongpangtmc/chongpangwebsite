type Env = { LTA_ACCOUNT_KEY?: string };

type Segment = {
  Line?: string;
  Direction?: string;
  Stations?: string;
  FreePublicBus?: string;
  FreeMRTShuttle?: string;
  MRTShuttleDirection?: string;
};

type AlertResponse = {
  value?: {
    Status?: number;
    AffectedSegments?: Segment[];
    Message?: Array<{ Content?: string } | string>;
  };
};

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...init.headers },
  });

export const onRequestGet = async ({ env }: { env: Env }) => {
  if (!env.LTA_ACCOUNT_KEY) return json({ error: "实时地铁服务尚未完成配置" }, { status: 503 });

  try {
    const response = await fetch("https://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts", {
      headers: { AccountKey: env.LTA_ACCOUNT_KEY, accept: "application/json" },
    });
    if (!response.ok) throw new Error(`LTA response ${response.status}`);

    const data = (await response.json()) as AlertResponse;
    const value = data.value || {};
    const messages = (value.Message || [])
      .map((item) => typeof item === "string" ? item : item.Content || "")
      .filter(Boolean);

    return json({
      normal: value.Status === 1,
      status: value.Status || 0,
      affectedSegments: value.AffectedSegments || [],
      messages,
      updatedAt: new Date().toISOString(),
    }, { headers: { "cache-control": "no-store" } });
  } catch {
    return json({ error: "实时地铁资料暂时无法使用，请稍后重试" }, { status: 503 });
  }
};
