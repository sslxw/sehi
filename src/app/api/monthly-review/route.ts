import { NextResponse } from "next/server";
import { buildLocalDashboard, mergeDashboardWithLocal } from "@/lib/monthly-review-build";
import { buildMonthlyReviewSystemPrompt } from "@/lib/monthly-review-context";
import { parseDashboardJson, type MonthlyReviewRawStats } from "@/lib/monthly-review-types";
import { getServerWhoopMetrics } from "@/lib/whoop/client";
import type { Locale } from "@/lib/i18n/types";
import type { MonthlyReviewContext } from "@/lib/monthly-review";

function enrichStatsFromWhoop(
  stats: MonthlyReviewRawStats,
  connected: boolean,
  metrics: { recovery: number; sleep: number; strain: number }[],
  usingMock: boolean
): MonthlyReviewRawStats {
  if (!metrics.length) return { ...stats, whoopConnected: connected && !usingMock };

  const recent = metrics.slice(-30);
  return {
    ...stats,
    whoopConnected: connected && !usingMock,
    avgRecovery: Math.round(recent.reduce((a, m) => a + m.recovery, 0) / recent.length),
    avgSleep: Math.round(recent.reduce((a, m) => a + m.sleep, 0) / recent.length),
    totalStrain: Math.round(recent.reduce((a, m) => a + m.strain, 0) * 10) / 10,
  };
}

export async function POST(req: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  try {
    const { locale, context, stats } = (await req.json()) as {
      locale?: Locale;
      context?: Partial<MonthlyReviewContext>;
      stats?: MonthlyReviewRawStats;
    };

    const loc = locale ?? "en";
    const whoop = await getServerWhoopMetrics();
    const month = context?.month ?? stats?.month ?? new Date().toISOString().slice(0, 7);

    const enrichedStats = stats
      ? enrichStatsFromWhoop(stats, whoop.connected, whoop.metrics, whoop.usingMock)
      : ({
          month,
          checklistAvg: 0,
          checklistDays: 0,
          workoutSessions: 0,
          workoutSets: 0,
          mealsLogged: 0,
          checkInCount: 0,
          whoopConnected: whoop.connected && !whoop.usingMock,
        } satisfies MonthlyReviewRawStats);

    const localDashboard = buildLocalDashboard(enrichedStats, loc);

    const fullContext: MonthlyReviewContext = {
      month,
      profileSummary: context?.profileSummary ?? null,
      whoopSummary: context?.whoopSummary ?? null,
      checklistSummary: context?.checklistSummary ?? null,
      workoutSummary: context?.workoutSummary ?? null,
      weeklyCheckInSummary: context?.weeklyCheckInSummary ?? null,
      foodSummary: context?.foodSummary ?? null,
      bloodTestSummary: context?.bloodTestSummary ?? null,
    };

    if (!apiKey) {
      return NextResponse.json({ dashboard: localDashboard, offline: true });
    }

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: buildMonthlyReviewSystemPrompt(loc, fullContext, enrichedStats),
          },
          {
            role: "user",
            content: loc === "ar-SA" ? "حلّل الشهر وأرجع JSON." : "Analyze my month and return JSON.",
          },
        ],
        temperature: 0.5,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ dashboard: localDashboard, offline: true });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) {
      return NextResponse.json({ dashboard: localDashboard, offline: true });
    }

    const aiDashboard = parseDashboardJson(raw);
    const dashboard = aiDashboard
      ? mergeDashboardWithLocal({ ...aiDashboard, month }, localDashboard)
      : localDashboard;

    return NextResponse.json({ dashboard });
  } catch (error) {
    console.error("Monthly review error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
