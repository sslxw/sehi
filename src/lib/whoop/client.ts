import type { DailyMetrics } from "@/lib/whoop-data";
import { mockDailyMetrics } from "@/lib/whoop-data";
import {
  WHOOP_API_BASE,
  WHOOP_SCOPES,
  WHOOP_TOKEN_URL,
  getWhoopConfig,
} from "./config";
import {
  clearWhoopTokens,
  isWhoopConnected,
  loadWhoopTokens,
  saveWhoopTokens,
} from "./token-store";
import type {
  WhoopCycleRecord,
  WhoopPaginated,
  WhoopProfile,
  WhoopRecoveryRecord,
  WhoopSleepRecord,
  WhoopTokens,
} from "./types";

async function tokenRequest(body: Record<string, string>): Promise<WhoopTokens> {
  const config = getWhoopConfig();
  if (!config) throw new Error("WHOOP credentials not configured");

  const res = await fetch(WHOOP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WHOOP token error: ${err}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope?: string;
    token_type?: string;
  };

  const existing = await loadWhoopTokens();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? existing?.refresh_token ?? "",
    expires_at: Date.now() + data.expires_in * 1000 - 60_000,
    scope: data.scope,
    token_type: data.token_type,
  };
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<WhoopTokens> {
  const config = getWhoopConfig(redirectUri);
  if (!config) throw new Error("WHOOP credentials not configured");

  const tokens = await tokenRequest({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  await saveWhoopTokens(tokens);
  return tokens;
}

export async function refreshAccessToken(refreshToken: string): Promise<WhoopTokens> {
  const config = getWhoopConfig();
  if (!config) throw new Error("WHOOP credentials not configured");

  const tokens = await tokenRequest({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: WHOOP_SCOPES,
  });

  await saveWhoopTokens(tokens);
  return tokens;
}

export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await loadWhoopTokens();
  if (!isWhoopConnected(tokens)) return null;

  if (Date.now() < tokens.expires_at) {
    return tokens.access_token;
  }

  try {
    const refreshed = await refreshAccessToken(tokens.refresh_token);
    return refreshed.access_token;
  } catch {
    await clearWhoopTokens();
    return null;
  }
}

async function whoopFetch<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${WHOOP_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (res.status === 401) {
    throw new Error("WHOOP_UNAUTHORIZED");
  }

  if (!res.ok) {
    throw new Error(`WHOOP API ${path}: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

async function fetchAllPages<T>(
  basePath: string,
  accessToken: string,
  params: Record<string, string>
): Promise<T[]> {
  const items: T[] = [];
  let nextToken: string | undefined;

  do {
    const query = new URLSearchParams({ ...params, limit: "25" });
    if (nextToken) query.set("nextToken", nextToken);

    const data = await whoopFetch<WhoopPaginated<T>>(
      `${basePath}?${query.toString()}`,
      accessToken
    );

    items.push(...data.records);
    nextToken = data.next_token;
  } while (nextToken && items.length < 120);

  return items;
}

function sleepHoursFromRecord(sleep?: WhoopSleepRecord): number {
  const summary = sleep?.score?.stage_summary;
  if (!summary) return 0;

  const asleepMs =
    summary.total_in_bed_time_milli -
    summary.total_awake_time_milli -
    summary.total_no_data_time_milli;

  return Math.max(0, Math.round((asleepMs / 3_600_000) * 10) / 10);
}

function cycleDateKey(cycle?: WhoopCycleRecord): string {
  if (!cycle?.start) return new Date().toISOString().split("T")[0];
  return cycle.start.split("T")[0];
}

export function mergeWhoopMetrics(
  recoveries: WhoopRecoveryRecord[],
  cycles: WhoopCycleRecord[],
  sleeps: WhoopSleepRecord[]
): DailyMetrics[] {
  const cycleMap = new Map(cycles.map((c) => [c.id, c]));
  const sleepMap = new Map(sleeps.map((s) => [s.cycle_id, s]));

  const byDate = new Map<string, DailyMetrics>();

  for (const recovery of recoveries) {
    if (recovery.score_state !== "SCORED" || !recovery.score) continue;

    const cycle = cycleMap.get(recovery.cycle_id);
    const sleep = sleepMap.get(recovery.cycle_id);
    const date = cycleDateKey(cycle);

    const strain = cycle?.score?.strain ?? 0;
    const kilojoule = cycle?.score?.kilojoule ?? 0;

    byDate.set(date, {
      date,
      recovery: Math.round(recovery.score.recovery_score),
      strain: Math.round(strain * 10) / 10,
      sleep: Math.round(sleep?.score?.sleep_performance_percentage ?? 0),
      hrv: Math.round(recovery.score.hrv_rmssd_milli),
      rhr: Math.round(recovery.score.resting_heart_rate),
      sleepHours: sleepHoursFromRecord(sleep),
      calories: Math.round(kilojoule * 0.239006),
      steps: 0,
    });
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export async function fetchWhoopDailyMetrics(
  accessToken: string,
  days = 30
): Promise<DailyMetrics[]> {
  const start = new Date();
  start.setDate(start.getDate() - days);
  const startIso = start.toISOString();

  const params = { start: startIso };

  const [recoveries, cycles, sleeps] = await Promise.all([
    fetchAllPages<WhoopRecoveryRecord>("/v2/recovery", accessToken, params),
    fetchAllPages<WhoopCycleRecord>("/v2/cycle", accessToken, params),
    fetchAllPages<WhoopSleepRecord>("/v2/activity/sleep", accessToken, params),
  ]);

  const merged = mergeWhoopMetrics(recoveries, cycles, sleeps);
  return merged.length > 0 ? merged : mockDailyMetrics;
}

export async function fetchWhoopProfile(accessToken: string): Promise<WhoopProfile | null> {
  try {
    return await whoopFetch<WhoopProfile>("/v2/user/profile/basic", accessToken);
  } catch {
    return null;
  }
}

export async function revokeWhoopAccess(accessToken: string): Promise<void> {
  try {
    await fetch(`${WHOOP_API_BASE}/v2/user/access`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    // best effort
  }
  await clearWhoopTokens();
}

export async function getServerWhoopMetrics(): Promise<{
  connected: boolean;
  metrics: DailyMetrics[];
  profile: WhoopProfile | null;
}> {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return { connected: false, metrics: mockDailyMetrics, profile: null };
  }

  try {
    const [metrics, profile] = await Promise.all([
      fetchWhoopDailyMetrics(accessToken),
      fetchWhoopProfile(accessToken),
    ]);
    return { connected: true, metrics, profile };
  } catch (err) {
    if (err instanceof Error && err.message === "WHOOP_UNAUTHORIZED") {
      await clearWhoopTokens();
    }
    return { connected: false, metrics: mockDailyMetrics, profile: null };
  }
}
