import type { DailyMetrics } from "./whoop-data";
import type { EnergyPoint, TrainingWindow } from "./energy";
import type { TranslateParams } from "./i18n";

type Translator = (key: string, params?: TranslateParams) => string;

const hourKeys: Record<number, string> = {
  6: "energy.h6",
  8: "energy.h8",
  10: "energy.h10",
  12: "energy.h12",
  14: "energy.h14",
  16: "energy.h16",
  18: "energy.h18",
  20: "energy.h20",
  22: "energy.h22",
};

export function translateHourLabel(hour: number, t: Translator): string {
  return t(hourKeys[hour] ?? `energy.h${hour}`);
}

export function translateEnergyTimeline(
  timeline: EnergyPoint[],
  t: Translator
): EnergyPoint[] {
  return timeline.map((point) => ({
    ...point,
    label: translateHourLabel(point.hour, t),
  }));
}

export function translateTrainingWindow(
  window: TrainingWindow,
  metrics: DailyMetrics,
  timeline: EnergyPoint[],
  t: Translator
): TrainingWindow {
  if (window.label === "Light session only") {
    return {
      ...window,
      label: t("energy.lightSession"),
      reason: t("energy.lightSessionReason"),
    };
  }

  const peak = timeline
    .filter((p) => p.zone === "peak" || p.energy >= 70)
    .reduce<EnergyPoint | undefined>(
      (best, p) => (!best || p.energy >= best.energy ? p : best),
      undefined
    );

  const peakLabel = peak ? translateHourLabel(peak.hour, t) : "";

  return {
    ...window,
    reason:
      metrics.recovery >= 67
        ? t("energy.peakEnergy", { time: peakLabel })
        : t("energy.moderateWindow"),
  };
}
