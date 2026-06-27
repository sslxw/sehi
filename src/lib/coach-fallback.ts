import type { DailyMetrics } from "./whoop-data";
import { mockDailyMetrics } from "./whoop-data";
import { getTodayJournal } from "./journal";
import { calculateSehiScore } from "./sehi-score";
import { generateEnergyTimeline, getTrainingWindow, calculateSleepDebt } from "./energy";
import { translateTrainingWindow } from "./energy-i18n";
import type { TranslateParams } from "./i18n";
import { getSehiLabelKey, getSehiRecommendKey } from "./i18n";

type Translator = (key: string, params?: TranslateParams) => string;

function sleepTrendKey(trend: string): string {
  if (trend === "improving") return "sleepDebt.improving";
  if (trend === "worsening") return "sleepDebt.worsening";
  return "sleepDebt.stable";
}

export function getLocalizedCoachResponse(
  message: string,
  metrics: DailyMetrics,
  t: Translator,
  history: DailyMetrics[] = mockDailyMetrics
): string {
  const lower = message.toLowerCase();
  const journal = getTodayJournal();
  const sehi = calculateSehiScore(metrics, journal);
  const timeline = generateEnergyTimeline(metrics, journal);
  const rawWindow = getTrainingWindow(metrics, timeline);
  const window = translateTrainingWindow(rawWindow, metrics, timeline, t);
  const sleepDebt = calculateSleepDebt(history.slice(-7));

  if (lower.includes("sehi") || lower.includes("صحي") || lower.includes("سهي") || lower.includes("سِهي")) {
    return t("coachFallback.sehi", {
      score: sehi.score,
      label: t(getSehiLabelKey(sehi.score)),
      recovery: sehi.recovery,
      sleep: sehi.sleep,
      loadBalance: sehi.loadBalance,
      lifestyle: sehi.lifestyle,
      budget: sehi.strainBudget.toFixed(1),
      recommendation: t(getSehiRecommendKey(sehi.score)),
    });
  }

  if (lower.includes("sleep debt") || lower.includes("debt") || lower.includes("دين")) {
    return t("coachFallback.sleepDebt", {
      debt: sleepDebt.debtHours.toFixed(1),
      trend: t(sleepTrendKey(sleepDebt.trend)),
      nights: sleepDebt.nightsShort,
      advice:
        sleepDebt.debtHours > 3
          ? t("coachFallback.sleepDebtHigh")
          : t("coachFallback.sleepDebtOk"),
    });
  }

  if (
    (lower.includes("train") || lower.includes("تمرين")) &&
    (lower.includes("time") ||
      lower.includes("window") ||
      lower.includes("when") ||
      lower.includes("متى") ||
      lower.includes("وقت"))
  ) {
    return t("coachFallback.trainingWindow", {
      window: window.label,
      reason: window.reason,
      budget: sehi.strainBudget.toFixed(1),
    });
  }

  if (
    lower.includes("recovery") ||
    lower.includes("ready") ||
    lower.includes("تعافي") ||
    lower.includes("جاهز")
  ) {
    if (metrics.recovery >= 67) {
      return t("coachFallback.recoveryHigh", {
        recovery: metrics.recovery,
        hrv: metrics.hrv,
        rhr: metrics.rhr,
      });
    }
    if (metrics.recovery >= 34) {
      return t("coachFallback.recoveryModerate", { recovery: metrics.recovery });
    }
    return t("coachFallback.recoveryLow", {
      recovery: metrics.recovery,
      hrv: metrics.hrv,
    });
  }

  if (lower.includes("sleep") || lower.includes("نوم")) {
    return t("coachFallback.sleep", {
      hours: metrics.sleepHours.toFixed(1),
      sleep: metrics.sleep,
      quality:
        metrics.sleepHours < 7
          ? t("coachFallback.sleepBelowOptimal")
          : t("coachFallback.sleepSolid"),
    });
  }

  if (
    lower.includes("workout") ||
    lower.includes("train") ||
    lower.includes("exercise") ||
    lower.includes("تمرين") ||
    lower.includes("رياضة")
  ) {
    if (metrics.recovery >= 67) {
      return t("coachFallback.workoutHigh", { recovery: metrics.recovery });
    }
    return t("coachFallback.workoutLow", { recovery: metrics.recovery });
  }

  if (lower.includes("strain") || lower.includes("مجهود")) {
    return t("coachFallback.strain", {
      strain: metrics.strain.toFixed(1),
      load:
        metrics.strain > 14
          ? t("coachFallback.strainHigh")
          : t("coachFallback.strainBalanced"),
    });
  }

  if (
    lower.includes("hrv") ||
    lower.includes("heart rate variability") ||
    lower.includes("تقلب")
  ) {
    return t("coachFallback.hrv", {
      hrv: metrics.hrv,
      rhr: metrics.rhr,
      trend:
        metrics.hrv >= 60
          ? t("coachFallback.hrvAbove")
          : t("coachFallback.hrvBelow"),
    });
  }

  if (
    lower.includes("plan") ||
    lower.includes("week") ||
    lower.includes("schedule") ||
    lower.includes("خطة") ||
    lower.includes("أسبوع") ||
    lower.includes("جدول")
  ) {
    return t("coachFallback.plan", {
      today:
        metrics.recovery >= 67
          ? t("coachFallback.planTodayHigh")
          : t("coachFallback.planTodayLow"),
    });
  }

  return t("coachFallback.default", {
    score: sehi.score,
    recovery: metrics.recovery,
    strain: metrics.strain.toFixed(1),
    budget: sehi.strainBudget.toFixed(1),
  });
}
