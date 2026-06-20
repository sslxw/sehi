import type { DailyMetrics } from "./whoop-data";
import type { JournalEntry } from "./journal";

export interface EnergyPoint {
  hour: number;
  label: string;
  energy: number;
  zone: "peak" | "steady" | "dip" | "wind-down";
}

export interface TrainingWindow {
  startHour: number;
  endHour: number;
  label: string;
  reason: string;
}

export function generateEnergyTimeline(
  metrics: DailyMetrics,
  journal?: JournalEntry | null
): EnergyPoint[] {
  const base = metrics.recovery;
  const caffeinePenalty = journal?.caffeineLate ? -8 : 0;
  const stressPenalty = journal?.highStress ? -10 : 0;
  const mobilityBonus = journal?.mobility ? 5 : 0;

  const hours = [
    { hour: 6, label: "6am" },
    { hour: 8, label: "8am" },
    { hour: 10, label: "10am" },
    { hour: 12, label: "12pm" },
    { hour: 14, label: "2pm" },
    { hour: 16, label: "4pm" },
    { hour: 18, label: "6pm" },
    { hour: 20, label: "8pm" },
    { hour: 22, label: "10pm" },
  ];

  return hours.map(({ hour, label }) => {
    let energy = base;

    if (hour >= 6 && hour <= 9) energy += 5;
    if (hour >= 10 && hour <= 12) energy += 15 + mobilityBonus;
    if (hour >= 13 && hour <= 15) energy -= 10 + stressPenalty;
    if (hour >= 16 && hour <= 18) energy += 8;
    if (hour >= 19) energy -= 20 + caffeinePenalty;
    if (hour >= 22) energy -= 25;

    energy = Math.max(15, Math.min(99, energy));

    let zone: EnergyPoint["zone"];
    if (energy >= 75) zone = "peak";
    else if (energy >= 55) zone = "steady";
    else if (energy >= 35) zone = "dip";
    else zone = "wind-down";

    return { hour, label, energy: Math.round(energy), zone };
  });
}

export function getTrainingWindow(
  metrics: DailyMetrics,
  timeline: EnergyPoint[]
): TrainingWindow {
  const peak = timeline.filter((p) => p.zone === "peak" || p.energy >= 70);

  if (peak.length === 0) {
    return {
      startHour: 10,
      endHour: 11,
      label: "Light session only",
      reason: "Low recovery — keep intensity minimal if you train",
    };
  }

  const best = peak.reduce((a, b) => (a.energy >= b.energy ? a : b));
  const start = Math.max(6, best.hour - 1);
  const end = Math.min(20, best.hour + 2);

  if (metrics.recovery >= 67) {
    return {
      startHour: start,
      endHour: end,
      label: `${start}:00 – ${end}:00`,
      reason: `Peak energy at ${best.label} — ideal for high-intensity work`,
    };
  }

  return {
    startHour: start,
    endHour: end,
    label: `${start}:00 – ${end}:00`,
    reason: `Best window for moderate training based on your energy curve`,
  };
}

export function calculateSleepDebt(metricsList: { sleepHours: number }[]): {
  debtHours: number;
  trend: "improving" | "worsening" | "stable";
  nightsShort: number;
} {
  const target = 8;
  let debt = 0;
  let nightsShort = 0;

  metricsList.forEach((m) => {
    const deficit = target - m.sleepHours;
    if (deficit > 0) {
      debt += deficit;
      nightsShort++;
    } else {
      debt = Math.max(0, debt + deficit * 0.5);
    }
  });

  const recent = metricsList.slice(-3);
  const older = metricsList.slice(-7, -3);
  const recentAvg =
    recent.reduce((s, m) => s + m.sleepHours, 0) / recent.length;
  const olderAvg =
    older.length > 0
      ? older.reduce((s, m) => s + m.sleepHours, 0) / older.length
      : recentAvg;

  const trend =
    recentAvg > olderAvg + 0.3
      ? "improving"
      : recentAvg < olderAvg - 0.3
        ? "worsening"
        : "stable";

  return {
    debtHours: Math.round(debt * 10) / 10,
    trend,
    nightsShort,
  };
}
