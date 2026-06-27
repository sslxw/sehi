import type { ActionInsight } from "@/lib/whoop-data";
import type { TranslateParams } from "@/lib/i18n";

const insightKeyMap: Record<string, { title: string; desc: string; action: string }> = {
  "low-recovery": {
    title: "insights.lowRecoveryTitle",
    desc: "insights.lowRecoveryDesc",
    action: "insights.lowRecoveryAction",
  },
  "moderate-recovery": {
    title: "insights.moderateRecoveryTitle",
    desc: "insights.moderateRecoveryDesc",
    action: "insights.moderateRecoveryAction",
  },
  "high-recovery": {
    title: "insights.highRecoveryTitle",
    desc: "insights.highRecoveryDesc",
    action: "insights.highRecoveryAction",
  },
  "low-sleep": {
    title: "insights.lowSleepTitle",
    desc: "insights.lowSleepDesc",
    action: "insights.lowSleepAction",
  },
  "high-strain": {
    title: "insights.highStrainTitle",
    desc: "insights.highStrainDesc",
    action: "insights.highStrainAction",
  },
  "low-hrv": {
    title: "insights.lowHrvTitle",
    desc: "insights.lowHrvDesc",
    action: "insights.lowHrvAction",
  },
};

export function translateInsight(
  insight: ActionInsight,
  t: (key: string, params?: TranslateParams) => string,
  metrics?: { recovery?: number; hrv?: number; sleep?: number; sleepHours?: number; strain?: number }
): { title: string; description: string; action: string } {
  const keys = insightKeyMap[insight.id];
  if (!keys) {
    return { title: insight.title, description: insight.description, action: insight.action };
  }

  const params: TranslateParams = {
    recovery: metrics?.recovery ?? 0,
    hrv: metrics?.hrv ?? 0,
    sleep: metrics?.sleep ?? 0,
    hours: metrics?.sleepHours?.toFixed(1) ?? "0",
    strain: metrics?.strain?.toFixed(1) ?? "0",
  };

  return {
    title: t(keys.title, params),
    description: t(keys.desc, params),
    action: t(keys.action, params),
  };
}
