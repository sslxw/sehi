export type ReviewTrend = "up" | "down" | "neutral";

export interface ReviewScoreCard {
  id: string;
  label: string;
  value: string;
  unit?: string;
  score: number;
  trend?: ReviewTrend;
  trendLabel?: string;
}

export interface ReviewInsight {
  title: string;
  detail: string;
  severity: "positive" | "neutral" | "warning";
}

export interface ReviewRecommendation {
  title: string;
  action: string;
  priority: "high" | "medium" | "low";
}

export interface MonthlyReviewDashboard {
  month: string;
  overallScore: number;
  grade: string;
  headline: string;
  scorecards: ReviewScoreCard[];
  wins: ReviewInsight[];
  watch: ReviewInsight[];
  trends: ReviewInsight[];
  recommendations: ReviewRecommendation[];
  dataGaps?: string[];
}

export interface MonthlyReviewRawStats {
  month: string;
  checklistAvg: number;
  checklistDays: number;
  workoutSessions: number;
  workoutSets: number;
  mealsLogged: number;
  checkInCount: number;
  avgRecovery?: number;
  avgSleep?: number;
  totalStrain?: number;
  weightDelta?: number;
  waistDelta?: number;
  whoopConnected?: boolean;
}

export function parseDashboardJson(raw: string): MonthlyReviewDashboard | null {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as MonthlyReviewDashboard;
    if (!parsed.month || typeof parsed.overallScore !== "number") return null;
    return normalizeDashboard(parsed);
  } catch {
    return null;
  }
}

export function normalizeDashboard(d: MonthlyReviewDashboard): MonthlyReviewDashboard {
  return {
    month: d.month,
    overallScore: clamp(Math.round(d.overallScore), 0, 100),
    grade: d.grade || scoreToGrade(d.overallScore),
    headline: d.headline || "",
    scorecards: (d.scorecards ?? []).slice(0, 6),
    wins: (d.wins ?? []).slice(0, 5),
    watch: (d.watch ?? []).slice(0, 5),
    trends: (d.trends ?? []).slice(0, 4),
    recommendations: (d.recommendations ?? []).slice(0, 5),
    dataGaps: d.dataGaps?.slice(0, 4),
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function scoreToGrade(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Building";
  if (score >= 40) return "Needs focus";
  return "Reset";
}

export function gradeColor(score: number): string {
  if (score >= 85) return "#34D399";
  if (score >= 70) return "#22D3EE";
  if (score >= 55) return "#A78BFA";
  if (score >= 40) return "#FBBF24";
  return "#F87171";
}
