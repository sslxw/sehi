import type { MonthlyReviewDashboard } from "./monthly-review-types";
import { loadJson, saveJson } from "@/lib/data/sync";

export interface MonthlyReviewEntry {
  id: string;
  month: string;
  dashboard: MonthlyReviewDashboard;
  generatedAt: string;
  /** @deprecated legacy text-only reviews */
  content?: string;
}

const STORAGE_KEY = "sehi-monthly-reviews";

export function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function loadMonthlyReviewsAsync(
  userId?: string | null
): Promise<MonthlyReviewEntry[]> {
  const entries = await loadJson<MonthlyReviewEntry[]>(userId ?? null, "monthly_reviews", []);
  return entries.filter((e) => e.dashboard != null);
}

export async function saveMonthlyReviewsAsync(
  entries: MonthlyReviewEntry[],
  userId?: string | null
): Promise<void> {
  await saveJson(userId ?? null, "monthly_reviews", entries);
}

export function getCurrentMonthReview(entries: MonthlyReviewEntry[]): MonthlyReviewEntry | null {
  const month = getCurrentMonthKey();
  return entries.find((e) => e.month === month) ?? null;
}

export interface MonthlyReviewContext {
  month: string;
  profileSummary?: string | null;
  whoopSummary?: string | null;
  checklistSummary?: string | null;
  workoutSummary?: string | null;
  weeklyCheckInSummary?: string | null;
  foodSummary?: string | null;
  bloodTestSummary?: string | null;
}

export function formatWorkoutsForReview(
  sessions: { date: string; name?: string; exerciseCount: number; setCount: number }[]
): string {
  if (!sessions.length) return "No workouts logged this month.";
  return sessions
    .slice(0, 20)
    .map((s) => `- ${s.date}: ${s.name ?? "Workout"} — ${s.exerciseCount} exercises, ${s.setCount} sets completed`)
    .join("\n");
}

export function formatChecklistForReview(
  days: { date: string; pct: number }[]
): string {
  if (!days.length) return "No checklist data this month.";
  const avg = Math.round(days.reduce((a, d) => a + d.pct, 0) / days.length);
  return `Average daily checklist completion: ${avg}%\n${days
    .slice(-14)
    .map((d) => `- ${d.date}: ${d.pct}%`)
    .join("\n")}`;
}
