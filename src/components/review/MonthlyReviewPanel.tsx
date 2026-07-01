"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { formatBloodTestForCoach, getLatestBloodTestAsync } from "@/lib/blood-test";
import { collectMonthChecklistDataAsync } from "@/lib/daily-checklist";
import { sumMacros, loadFoodLogAsync } from "@/lib/food";
import {
  formatChecklistForReview,
  formatWorkoutsForReview,
  getCurrentMonthKey,
  getCurrentMonthReview,
  loadMonthlyReviewsAsync,
  saveMonthlyReviewsAsync,
  type MonthlyReviewEntry,
} from "@/lib/monthly-review";
import type { MonthlyReviewDashboard, MonthlyReviewRawStats } from "@/lib/monthly-review-types";
import { loadWorkoutSessionsAsync, sessionSetCount, type WorkoutSession } from "@/lib/workouts";
import { loadWeeklyCheckInsAsync, type WeeklyCheckIn } from "@/lib/weekly-checkin";
import { type FoodEntry } from "@/lib/food";
import { formatProfileForCoach, fetchUserProfile } from "@/lib/user-profile";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useWhoop } from "@/components/providers/WhoopProvider";
import { MonthlyReviewDashboardView } from "./MonthlyReviewDashboard";

function buildRawStats(
  month: string,
  checklistDays: { date: string; pct: number }[],
  workouts: WorkoutSession[],
  checkIns: WeeklyCheckIn[],
  foodLog: FoodEntry[],
  whoopConnected: boolean
): MonthlyReviewRawStats {
  const monthCheckIns = checkIns.filter((c) => c.weekStart.startsWith(month));
  const withWeight = monthCheckIns.filter((c) => c.weightKg != null);
  const withWaist = monthCheckIns.filter((c) => c.waistCm != null);

  let weightDelta: number | undefined;
  if (withWeight.length >= 2) {
    const sorted = [...withWeight].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
    weightDelta = sorted[sorted.length - 1].weightKg! - sorted[0].weightKg!;
  }

  let waistDelta: number | undefined;
  if (withWaist.length >= 2) {
    const sorted = [...withWaist].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
    waistDelta = sorted[sorted.length - 1].waistCm! - sorted[0].waistCm!;
  }

  const checklistAvg =
    checklistDays.length > 0
      ? Math.round(checklistDays.reduce((a, d) => a + d.pct, 0) / checklistDays.length)
      : 0;

  return {
    month,
    checklistAvg,
    checklistDays: checklistDays.length,
    workoutSessions: workouts.length,
    workoutSets: workouts.reduce((a, s) => a + sessionSetCount(s), 0),
    mealsLogged: foodLog.length,
    checkInCount: monthCheckIns.length,
    weightDelta,
    waistDelta,
    whoopConnected,
  };
}

export function MonthlyReviewPanel() {
  const { t, locale } = useLocale();
  const { user } = useAuth();
  const { connected } = useWhoop();
  const [reviews, setReviews] = useState<MonthlyReviewEntry[]>([]);
  const [dashboard, setDashboard] = useState<MonthlyReviewDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const month = getCurrentMonthKey();

  useEffect(() => {
    loadMonthlyReviewsAsync(user?.userId).then((loaded) => {
      setReviews(loaded);
      const current = getCurrentMonthReview(loaded);
      if (current?.dashboard) setDashboard(current.dashboard);
    });
  }, [user?.userId]);

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const profile = user ? await fetchUserProfile(user.userId) : null;
      const workouts = (await loadWorkoutSessionsAsync(user?.userId)).filter((s) =>
        s.date.startsWith(month)
      );
      const checkIns = await loadWeeklyCheckInsAsync(user?.userId);
      const foodLog = (await loadFoodLogAsync(user?.userId)).filter((e) =>
        e.loggedAt.startsWith(month)
      );
      const checklistDays = await collectMonthChecklistDataAsync(user?.userId, month);
      const stats = buildRawStats(month, checklistDays, workouts, checkIns, foodLog, connected);

      const foodTotals = sumMacros(foodLog);
      const foodSummary =
        foodLog.length > 0
          ? `${foodLog.length} meals logged. Total: ${foodTotals.calories} kcal, ${foodTotals.protein}g protein`
          : "No meals logged this month.";

      const latestBlood = await getLatestBloodTestAsync(user?.userId);

      const res = await fetch("/api/monthly-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          stats,
          context: {
            month,
            profileSummary: formatProfileForCoach(profile),
            checklistSummary: formatChecklistForReview(checklistDays),
            workoutSummary: formatWorkoutsForReview(
              workouts.map((s) => ({
                date: s.date,
                name: s.name,
                exerciseCount: s.exercises.length,
                setCount: sessionSetCount(s),
              }))
            ),
            weeklyCheckInSummary: checkIns
              .filter((c) => c.weekStart.startsWith(month))
              .map((c) => `- ${c.weekStart}: ${c.weightKg ?? "?"}kg, waist ${c.waistCm ?? "?"}cm`)
              .join("\n"),
            foodSummary,
            bloodTestSummary: formatBloodTestForCoach(latestBlood),
          },
        }),
      });

      const data = await res.json();
      if (!data.dashboard) throw new Error("no dashboard");

      const entry: MonthlyReviewEntry = {
        id: crypto.randomUUID(),
        month,
        dashboard: data.dashboard,
        generatedAt: new Date().toISOString(),
      };

      const withoutCurrent = reviews.filter((r) => r.month !== month);
      const next = [entry, ...withoutCurrent];
      setReviews(next);
      saveMonthlyReviewsAsync(next, user?.userId);
      setDashboard(data.dashboard);
    } catch {
      // silent — user can retry
    } finally {
      setLoading(false);
    }
  }, [connected, locale, month, reviews, user]);

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5 border border-violet-500/10"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-zinc-100">{t("review.title")}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{t("review.subtitle", { month })}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500/80 to-fuchsia-500/80 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("review.generating")}
            </>
          ) : dashboard ? (
            t("review.regenerate")
          ) : (
            t("review.generate")
          )}
        </button>
      </motion.div>

      {dashboard && <MonthlyReviewDashboardView dashboard={dashboard} />}

      {reviews.filter((r) => r.month !== month).length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            {t("review.pastReviews")}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {reviews
              .filter((r) => r.month !== month && r.dashboard)
              .slice(0, 4)
              .map((review) => (
                <button
                  key={review.id}
                  type="button"
                  onClick={() => setDashboard(review.dashboard)}
                  className="glass rounded-xl px-3 py-3 text-start hover:bg-white/[0.04] transition-colors border border-white/[0.04]"
                >
                  <p className="text-sm font-semibold text-zinc-300">{review.month}</p>
                  <p
                    className="text-lg font-bold mt-0.5"
                    style={{ color: gradeColor(review.dashboard.overallScore) }}
                  >
                    {review.dashboard.overallScore}
                  </p>
                  <p className="text-[10px] text-zinc-600 truncate">{review.dashboard.grade}</p>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function gradeColor(score: number): string {
  if (score >= 85) return "#34D399";
  if (score >= 70) return "#22D3EE";
  if (score >= 55) return "#A78BFA";
  if (score >= 40) return "#FBBF24";
  return "#F87171";
}
