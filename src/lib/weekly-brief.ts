import type { DailyMetrics } from "./whoop-data";
import { mockDailyMetrics } from "./whoop-data";
import type { TranslateParams } from "./i18n";

export interface WeeklyBrief {
  weekLabel: string;
  headline: string;
  wins: string[];
  risks: string[];
  focus: string;
  strainTarget: number;
  strainActual: number;
  recoveryAvg: number;
  sleepAvg: number;
}

type Translator = (key: string, params?: TranslateParams) => string;

export function getWeeklyBrief(
  t: Translator,
  metricsHistory: DailyMetrics[] = mockDailyMetrics
): WeeklyBrief {
  const last7 = metricsHistory.slice(-7);
  const recoveryAvg = Math.round(
    last7.reduce((s, d) => s + d.recovery, 0) / 7
  );
  const sleepAvg =
    Math.round((last7.reduce((s, d) => s + d.sleepHours, 0) / 7) * 10) / 10;
  const strainActual =
    Math.round(last7.reduce((s, d) => s + d.strain, 0) * 10) / 10;
  const strainTarget = 50;

  const wins: string[] = [];
  const risks: string[] = [];

  if (recoveryAvg >= 60) {
    wins.push(t("weeklyBrief.recoveryWin", { avg: recoveryAvg }));
  } else {
    risks.push(t("weeklyBrief.recoveryRisk", { avg: recoveryAvg }));
  }

  if (sleepAvg >= 7.5) {
    wins.push(t("weeklyBrief.sleepWin", { avg: sleepAvg }));
  } else {
    risks.push(t("weeklyBrief.sleepRisk", { avg: sleepAvg }));
  }

  const highStrainDays = last7.filter((d) => d.strain > 14).length;
  if (highStrainDays >= 3) {
    risks.push(t("weeklyBrief.highStrainRisk", { days: highStrainDays }));
  } else if (highStrainDays >= 1) {
    wins.push(t("weeklyBrief.strainDistributionWin"));
  }

  if (strainActual > strainTarget + 5) {
    risks.push(t("weeklyBrief.strainAboveTarget"));
  } else if (strainActual >= strainTarget - 5) {
    wins.push(t("weeklyBrief.strainOnTarget"));
  }

  const bestDay = last7.reduce((a, b) => (a.recovery > b.recovery ? a : b));
  wins.push(
    t("weeklyBrief.bestRecovery", { pct: bestDay.recovery, date: bestDay.date })
  );

  let focus: string;
  if (recoveryAvg < 55) focus = t("weeklyBrief.focusRecovery");
  else if (sleepAvg < 7) focus = t("weeklyBrief.focusSleep");
  else if (strainActual < strainTarget - 10) focus = t("weeklyBrief.focusPush");
  else focus = t("weeklyBrief.focusBalance");

  const headline =
    recoveryAvg >= 65 && sleepAvg >= 7.5
      ? t("weeklyBrief.headlineStrong")
      : recoveryAvg >= 50
        ? t("weeklyBrief.headlineSteady")
        : t("weeklyBrief.headlineRecovery");

  return {
    weekLabel: t("trends.thisWeek"),
    headline,
    wins,
    risks,
    focus,
    strainTarget,
    strainActual,
    recoveryAvg,
    sleepAvg,
  };
}
