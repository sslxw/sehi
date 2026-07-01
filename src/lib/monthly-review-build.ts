import type {
  MonthlyReviewDashboard,
  MonthlyReviewRawStats,
  ReviewInsight,
  ReviewRecommendation,
  ReviewScoreCard,
} from "./monthly-review-types";
import { normalizeDashboard, scoreToGrade } from "./monthly-review-types";

export function buildLocalDashboard(
  stats: MonthlyReviewRawStats,
  locale: "en" | "ar-SA" = "en"
): MonthlyReviewDashboard {
  const scorecards = buildScorecards(stats, locale);
  const scores = scorecards.map((c) => c.score);
  const overallScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 50;

  return normalizeDashboard({
    month: stats.month,
    overallScore,
    grade: scoreToGrade(overallScore),
    headline: buildHeadline(stats, overallScore, locale),
    scorecards,
    wins: buildLocalWins(stats, locale),
    watch: buildLocalWatch(stats, locale),
    trends: buildLocalTrends(stats, locale),
    recommendations: buildDefaultRecommendations(stats, locale),
    dataGaps: buildDataGaps(stats, locale).length
      ? buildDataGaps(stats, locale)
      : undefined,
  });
}

function buildScorecards(stats: MonthlyReviewRawStats, locale: "en" | "ar-SA"): ReviewScoreCard[] {
  const cards: ReviewScoreCard[] = [];

  cards.push({
    id: "habits",
    label: locale === "ar-SA" ? "العادات اليومية" : "Daily habits",
    value: String(stats.checklistAvg),
    unit: "%",
    score: stats.checklistAvg,
    trend: stats.checklistAvg >= 70 ? "up" : stats.checklistAvg >= 40 ? "neutral" : "down",
    trendLabel:
      stats.checklistDays > 0
        ? `${stats.checklistDays} ${locale === "ar-SA" ? "أيام" : "days"}`
        : undefined,
  });

  if (stats.avgRecovery != null) {
    cards.push({
      id: "recovery",
      label: locale === "ar-SA" ? "التعافي" : "Recovery",
      value: String(stats.avgRecovery),
      unit: "%",
      score: stats.avgRecovery,
      trend: stats.avgRecovery >= 67 ? "up" : stats.avgRecovery >= 50 ? "neutral" : "down",
    });
  }

  if (stats.avgSleep != null) {
    cards.push({
      id: "sleep",
      label: locale === "ar-SA" ? "النوم" : "Sleep",
      value: String(stats.avgSleep),
      unit: "%",
      score: stats.avgSleep,
      trend: stats.avgSleep >= 80 ? "up" : "neutral",
    });
  }

  const trainingScore = Math.min(100, stats.workoutSessions * 15);
  cards.push({
    id: "training",
    label: locale === "ar-SA" ? "التمرين" : "Training",
    value: String(stats.workoutSessions),
    unit: locale === "ar-SA" ? "جلسات" : "sessions",
    score: trainingScore,
    trend: stats.workoutSessions >= 8 ? "up" : stats.workoutSessions >= 4 ? "neutral" : "down",
    trendLabel: `${stats.workoutSets} ${locale === "ar-SA" ? "مجموعات" : "sets"}`,
  });

  if (stats.weightDelta != null) {
    cards.push({
      id: "weight",
      label: locale === "ar-SA" ? "الوزن" : "Weight",
      value: `${stats.weightDelta > 0 ? "+" : ""}${stats.weightDelta.toFixed(1)}`,
      unit: "kg",
      score: Math.max(40, 100 - Math.abs(stats.weightDelta) * 20),
      trend: stats.weightDelta < 0 ? "down" : stats.weightDelta > 0 ? "up" : "neutral",
      trendLabel: locale === "ar-SA" ? "هذا الشهر" : "this month",
    });
  }

  if (stats.waistDelta != null) {
    cards.push({
      id: "waist",
      label: locale === "ar-SA" ? "الخصر" : "Waist",
      value: `${stats.waistDelta > 0 ? "+" : ""}${stats.waistDelta.toFixed(1)}`,
      unit: "cm",
      score: Math.max(40, 100 - Math.abs(stats.waistDelta) * 15),
      trend: stats.waistDelta <= 0 ? "up" : "down",
    });
  }

  return cards.slice(0, 6);
}

function buildHeadline(stats: MonthlyReviewRawStats, score: number, locale: "en" | "ar-SA"): string {
  if (locale === "ar-SA") {
    if (score >= 70) return "شهر قوي — استمر على نفس الوتيرة";
    if (stats.checklistDays === 0 && stats.workoutSessions === 0)
      return "البيانات محدودة — ابدأ بتسجيل عاداتك وتمارينك";
    return "في مجال للتحسين — ركّز على العادات والقياسات";
  }
  if (score >= 70) return "Strong month — keep building momentum";
  if (stats.checklistDays === 0 && stats.workoutSessions === 0)
    return "Limited data — start logging habits and workouts";
  return "Room to grow — focus on consistency and measurements";
}

function buildLocalWins(stats: MonthlyReviewRawStats, locale: "en" | "ar-SA"): ReviewInsight[] {
  const wins: ReviewInsight[] = [];
  if (stats.checklistAvg >= 70) {
    wins.push({
      title: locale === "ar-SA" ? "التزام بالعادات" : "Habit consistency",
      detail:
        locale === "ar-SA"
          ? `أنجزت ${stats.checklistAvg}% من قائمة يومك في المتوسط`
          : `Averaged ${stats.checklistAvg}% daily checklist completion`,
      severity: "positive",
    });
  }
  if (stats.workoutSessions >= 4) {
    wins.push({
      title: locale === "ar-SA" ? "انتظام التمرين" : "Training consistency",
      detail:
        locale === "ar-SA"
          ? `${stats.workoutSessions} جلسات و ${stats.workoutSets} مجموعة`
          : `${stats.workoutSessions} sessions and ${stats.workoutSets} sets logged`,
      severity: "positive",
    });
  }
  if (stats.avgRecovery != null && stats.avgRecovery >= 67) {
    wins.push({
      title: locale === "ar-SA" ? "تعافي جيد" : "Solid recovery",
      detail:
        locale === "ar-SA"
          ? `متوسط التعافي ${stats.avgRecovery}%`
          : `Average recovery ${stats.avgRecovery}%`,
      severity: "positive",
    });
  }
  if (stats.checkInCount >= 2) {
    wins.push({
      title: locale === "ar-SA" ? "متابعة أسبوعية" : "Weekly tracking",
      detail:
        locale === "ar-SA"
          ? `${stats.checkInCount} متابعات أسبوعية مسجلة`
          : `${stats.checkInCount} weekly check-ins logged`,
      severity: "positive",
    });
  }
  return wins;
}

function buildLocalWatch(stats: MonthlyReviewRawStats, locale: "en" | "ar-SA"): ReviewInsight[] {
  const watch: ReviewInsight[] = [];
  if (stats.checklistAvg < 50 && stats.checklistDays > 0) {
    watch.push({
      title: locale === "ar-SA" ? "قائمة اليوم" : "Daily checklist",
      detail:
        locale === "ar-SA"
          ? `إكمال ${stats.checklistAvg}% فقط — حاول 3 عناصر يومياً`
          : `Only ${stats.checklistAvg}% completion — aim for 3 items daily`,
      severity: "warning",
    });
  }
  if (stats.avgSleep != null && stats.avgSleep < 75) {
    watch.push({
      title: locale === "ar-SA" ? "جودة النوم" : "Sleep quality",
      detail:
        locale === "ar-SA"
          ? `متوسط النوم ${stats.avgSleep}% — راجع روتين قبل النوم`
          : `Average sleep ${stats.avgSleep}% — protect wind-down routine`,
      severity: "warning",
    });
  }
  if (stats.workoutSessions < 4) {
    watch.push({
      title: locale === "ar-SA" ? "حجم التمرين" : "Training volume",
      detail:
        locale === "ar-SA"
          ? `${stats.workoutSessions} جلسات فقط — زِد التكرار`
          : `Only ${stats.workoutSessions} sessions — increase frequency`,
      severity: "neutral",
    });
  }
  return watch;
}

function buildLocalTrends(stats: MonthlyReviewRawStats, locale: "en" | "ar-SA"): ReviewInsight[] {
  const trends: ReviewInsight[] = [];
  if (stats.weightDelta != null) {
    trends.push({
      title: locale === "ar-SA" ? "اتجاه الوزن" : "Weight trend",
      detail: `${stats.weightDelta > 0 ? "+" : ""}${stats.weightDelta.toFixed(1)} kg ${locale === "ar-SA" ? "هذا الشهر" : "this month"}`,
      severity: Math.abs(stats.weightDelta) <= 1 ? "positive" : "neutral",
    });
  }
  if (stats.waistDelta != null) {
    trends.push({
      title: locale === "ar-SA" ? "اتجاه الخصر" : "Waist trend",
      detail: `${stats.waistDelta > 0 ? "+" : ""}${stats.waistDelta.toFixed(1)} cm`,
      severity: stats.waistDelta <= 0 ? "positive" : "neutral",
    });
  }
  if (stats.totalStrain != null) {
    trends.push({
      title: locale === "ar-SA" ? "إجمالي المجهود" : "Total strain",
      detail: `${stats.totalStrain.toFixed(1)} ${locale === "ar-SA" ? "نقطة" : "points"}`,
      severity: "neutral",
    });
  }
  return trends;
}

function buildDataGaps(stats: MonthlyReviewRawStats, locale: "en" | "ar-SA"): string[] {
  const gaps: string[] = [];
  if (!stats.whoopConnected) {
    gaps.push(locale === "ar-SA" ? "اربط WHOOP لبيانات التعافي" : "Connect WHOOP for recovery data");
  }
  if (stats.checkInCount === 0) {
    gaps.push(locale === "ar-SA" ? "سجّل متابعة أسبوعية" : "Log weekly check-ins");
  }
  if (stats.workoutSessions === 0) {
    gaps.push(locale === "ar-SA" ? "سجّل تمارينك" : "Log workouts");
  }
  if (stats.checklistDays === 0) {
    gaps.push(locale === "ar-SA" ? "استخدم قائمة اليوم" : "Use daily checklist");
  }
  return gaps;
}

function buildDefaultRecommendations(
  stats: MonthlyReviewRawStats,
  locale: "en" | "ar-SA"
): ReviewRecommendation[] {
  const recs: ReviewRecommendation[] = [];
  if (stats.checklistAvg < 70) {
    recs.push({
      title: locale === "ar-SA" ? "عادات يومية" : "Daily habits",
      action:
        locale === "ar-SA"
          ? "أكمل 3 عناصر من قائمة اليوم كل يوم"
          : "Complete 3 checklist items every day",
      priority: "high",
    });
  }
  if (stats.workoutSessions < 8) {
    recs.push({
      title: locale === "ar-SA" ? "التمرين" : "Training",
      action:
        locale === "ar-SA"
          ? "استهدف 3 جلسات أسبوعياً على الأقل"
          : "Target at least 3 sessions per week",
      priority: "high",
    });
  }
  if (stats.checkInCount < 4) {
    recs.push({
      title: locale === "ar-SA" ? "القياسات" : "Measurements",
      action:
        locale === "ar-SA"
          ? "سجّل الوزن والخصر كل أسبوع"
          : "Log weight and waist every week",
      priority: "medium",
    });
  }
  recs.push({
    title: locale === "ar-SA" ? "النوم" : "Sleep",
    action:
      locale === "ar-SA"
        ? "ثبّت روتين قبل النوم 30 دقيقة"
        : "Lock in a 30-min wind-down routine",
    priority: "medium",
  });
  return recs.slice(0, 5);
}

export function mergeDashboardWithLocal(
  ai: MonthlyReviewDashboard,
  local: MonthlyReviewDashboard
): MonthlyReviewDashboard {
  return normalizeDashboard({
    ...ai,
    scorecards: local.scorecards.length ? local.scorecards : ai.scorecards,
    overallScore: ai.overallScore || local.overallScore,
    grade: ai.grade || local.grade,
    dataGaps: [...new Set([...(ai.dataGaps ?? []), ...(local.dataGaps ?? [])])].slice(0, 4),
  });
}
