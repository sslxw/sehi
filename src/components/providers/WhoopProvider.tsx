"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { DailyMetrics } from "@/lib/whoop-data";
import {
  mockDailyMetrics,
  pickTodayMetrics,
  pickYesterdayMetrics,
} from "@/lib/whoop-data";
import type { WhoopProfile } from "@/lib/whoop/types";

interface WhoopContextValue {
  connected: boolean;
  configured: boolean;
  loading: boolean;
  source: "whoop" | "mock";
  profile: WhoopProfile | null;
  dailyMetrics: DailyMetrics[];
  today: DailyMetrics;
  yesterday: DailyMetrics;
  refresh: () => Promise<void>;
  connect: () => void;
  disconnect: () => Promise<void>;
}

const WhoopContext = createContext<WhoopContextValue | null>(null);

export function WhoopProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<WhoopProfile | null>(null);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics[]>(mockDailyMetrics);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [statusRes, metricsRes] = await Promise.all([
        fetch("/api/whoop/status"),
        fetch("/api/whoop/metrics"),
      ]);

      if (statusRes.ok) {
        const status = (await statusRes.json()) as { configured: boolean; connected: boolean };
        setConfigured(status.configured);
        setConnected(status.connected);
      }

      if (metricsRes.ok) {
        const data = (await metricsRes.json()) as {
          connected: boolean;
          metrics: DailyMetrics[];
          profile: WhoopProfile | null;
        };
        setConnected(data.connected);
        setDailyMetrics(data.metrics.length > 0 ? data.metrics : mockDailyMetrics);
        setProfile(data.profile);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("whoop") === "connected" || params.get("whoop") === "error") {
      refresh();
      params.delete("whoop");
      params.delete("reason");
      const next = params.toString();
      window.history.replaceState({}, "", next ? `?${next}` : window.location.pathname);
    }
  }, [refresh]);

  const connect = useCallback(() => {
    window.location.href = "/api/whoop/auth";
  }, []);

  const disconnect = useCallback(async () => {
    await fetch("/api/whoop/disconnect", { method: "POST" });
    setConnected(false);
    setProfile(null);
    setDailyMetrics(mockDailyMetrics);
  }, []);

  const today = useMemo(() => pickTodayMetrics(dailyMetrics), [dailyMetrics]);
  const yesterday = useMemo(() => pickYesterdayMetrics(dailyMetrics), [dailyMetrics]);

  const value = useMemo(
    () => ({
      connected,
      configured,
      loading,
      source: connected ? ("whoop" as const) : ("mock" as const),
      profile,
      dailyMetrics,
      today,
      yesterday,
      refresh,
      connect,
      disconnect,
    }),
    [connected, configured, loading, profile, dailyMetrics, today, yesterday, refresh, connect, disconnect]
  );

  return <WhoopContext.Provider value={value}>{children}</WhoopContext.Provider>;
}

export function useWhoop() {
  const ctx = useContext(WhoopContext);
  if (!ctx) throw new Error("useWhoop must be used within WhoopProvider");
  return ctx;
}
