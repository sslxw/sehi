import type { DailyMetrics } from "./whoop-data";
import type { JournalEntry } from "./journal";

export interface SehiScoreBreakdown {
  score: number;
  label: string;
  recovery: number;
  sleep: number;
  loadBalance: number;
  lifestyle: number;
  strainBudget: number;
  recommendation: string;
}

export function calculateSehiScore(
  metrics: DailyMetrics,
  journal?: JournalEntry | null
): SehiScoreBreakdown {
  const recoveryWeight = metrics.recovery * 0.4;
  const sleepWeight = metrics.sleep * 0.25;

  const weeklyStrainTarget = 50;
  const strainBalance = Math.max(
    0,
    100 - Math.abs(metrics.strain - weeklyStrainTarget / 7) * 8
  );
  const loadWeight = strainBalance * 0.2;

  let lifestyleScore = 75;
  if (journal) {
    if (journal.alcohol) lifestyleScore -= 20;
    if (journal.lateMeal) lifestyleScore -= 10;
    if (journal.highStress) lifestyleScore -= 15;
    if (journal.caffeineLate) lifestyleScore -= 8;
    if (journal.hydration >= 8) lifestyleScore += 5;
    if (journal.mobility) lifestyleScore += 10;
  }
  lifestyleScore = Math.max(0, Math.min(100, lifestyleScore));
  const lifestyleWeight = lifestyleScore * 0.15;

  const score = Math.round(recoveryWeight + sleepWeight + loadWeight + lifestyleWeight);

  const strainBudget = Math.max(
    2,
    Math.round((metrics.recovery / 100) * 18 - metrics.strain * 0.3)
  );

  let label: string;
  let recommendation: string;

  if (score >= 80) {
    label = "Peak Ready";
    recommendation = "Push hard today. High-intensity training and deep work are optimal.";
  } else if (score >= 65) {
    label = "Strong";
    recommendation = "Good day for moderate-to-high effort. Stay within your strain budget.";
  } else if (score >= 50) {
    label = "Balanced";
    recommendation = "Train smart — zone 2 and mobility. Protect sleep tonight.";
  } else if (score >= 35) {
    label = "Cautious";
    recommendation = "Light movement only. Focus on recovery habits and early wind-down.";
  } else {
    label = "Restore";
    recommendation = "Full rest day. Sleep, hydrate, and skip intense training.";
  }

  return {
    score,
    label,
    recovery: Math.round(recoveryWeight / 0.4),
    sleep: Math.round(sleepWeight / 0.25),
    loadBalance: Math.round(strainBalance),
    lifestyle: lifestyleScore,
    strainBudget,
    recommendation,
  };
}

export function getSehiScoreColor(score: number): string {
  if (score >= 80) return "#34D399";
  if (score >= 65) return "#22D3EE";
  if (score >= 50) return "#FBBF24";
  if (score >= 35) return "#FB923C";
  return "#F87171";
}
