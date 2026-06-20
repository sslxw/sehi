import { getTodayJournal } from "./journal";
import { calculateSehiScore } from "./sehi-score";
import { generateEnergyTimeline, getTrainingWindow, calculateSleepDebt } from "./energy";

export interface DailyMetrics {
  date: string;
  recovery: number;
  strain: number;
  sleep: number;
  hrv: number;
  rhr: number;
  sleepHours: number;
  calories: number;
  steps: number;
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: "workout" | "rest" | "sleep" | "recovery" | "goal";
  time?: string;
  duration?: string;
  intensity?: "low" | "medium" | "high";
  completed?: boolean;
  actionable?: string;
}

export interface ActionInsight {
  id: string;
  priority: "high" | "medium" | "low";
  category: "recovery" | "training" | "sleep" | "nutrition";
  title: string;
  description: string;
  action: string;
  icon: string;
}

function generateMetrics(): DailyMetrics[] {
  const metrics: DailyMetrics[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const baseRecovery = isWeekend ? 72 : 58;
    const recovery = Math.min(99, Math.max(15, baseRecovery + Math.floor(Math.random() * 30) - 15));
    const strain = isWeekend
      ? Math.floor(Math.random() * 8) + 2
      : Math.floor(Math.random() * 12) + 6;
    const sleep = Math.min(99, Math.max(40, recovery + Math.floor(Math.random() * 20) - 10));

    metrics.push({
      date: date.toISOString().split("T")[0],
      recovery,
      strain,
      sleep,
      hrv: Math.floor(45 + recovery * 0.4 + Math.random() * 15),
      rhr: Math.floor(52 + (100 - recovery) * 0.15 + Math.random() * 6),
      sleepHours: 5.5 + (sleep / 100) * 3 + Math.random() * 0.5,
      calories: Math.floor(1800 + strain * 80 + Math.random() * 400),
      steps: Math.floor(4000 + strain * 600 + Math.random() * 3000),
    });
  }
  return metrics;
}

export const dailyMetrics = generateMetrics();

export function getTodayMetrics(): DailyMetrics {
  return dailyMetrics[dailyMetrics.length - 1];
}

export function getYesterdayMetrics(): DailyMetrics {
  return dailyMetrics[dailyMetrics.length - 2];
}

export const calendarEvents: CalendarEvent[] = [
  {
    id: "1",
    date: new Date().toISOString().split("T")[0],
    title: "Zone 2 Cardio",
    type: "workout",
    time: "07:00",
    duration: "45 min",
    intensity: "medium",
    completed: false,
    actionable: "Keep HR below 145 bpm based on your recovery",
  },
  {
    id: "2",
    date: new Date().toISOString().split("T")[0],
    title: "Wind-down Routine",
    type: "sleep",
    time: "21:30",
    duration: "30 min",
    actionable: "Dim lights, no screens — target 8h sleep tonight",
  },
  {
    id: "3",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    title: "Active Recovery",
    type: "recovery",
    time: "10:00",
    duration: "30 min",
    intensity: "low",
    actionable: "Light yoga or walk — HRV trending up, good day for movement",
  },
  {
    id: "4",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    title: "Upper Body Strength",
    type: "workout",
    time: "17:00",
    duration: "60 min",
    intensity: "high",
    actionable: "Push hard — projected recovery 78% tomorrow",
  },
  {
    id: "5",
    date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    title: "Rest Day",
    type: "rest",
    actionable: "Full rest — strain was high Mon-Tue, prioritize sleep",
  },
  {
    id: "6",
    date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    title: "HIIT Session",
    type: "workout",
    time: "06:30",
    duration: "35 min",
    intensity: "high",
    actionable: "Only if recovery > 65% — check morning score",
  },
  {
    id: "7",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    title: "Evening Run",
    type: "workout",
    time: "18:00",
    duration: "50 min",
    intensity: "medium",
    completed: true,
  },
  {
    id: "8",
    date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
    title: "Mobility Work",
    type: "recovery",
    time: "08:00",
    duration: "25 min",
    intensity: "low",
    completed: true,
  },
];

export function generateInsights(metrics: DailyMetrics): ActionInsight[] {
  const insights: ActionInsight[] = [];

  if (metrics.recovery < 34) {
    insights.push({
      id: "low-recovery",
      priority: "high",
      category: "recovery",
      title: "Recovery is critically low",
      description: `At ${metrics.recovery}%, your body needs rest. HRV is ${metrics.hrv}ms — below your baseline.`,
      action: "Skip intense training today. Focus on sleep, hydration, and light movement only.",
      icon: "heart-pulse",
    });
  } else if (metrics.recovery < 67) {
    insights.push({
      id: "moderate-recovery",
      priority: "medium",
      category: "training",
      title: "Train smart, not hard",
      description: `Recovery at ${metrics.recovery}% — you can train but cap strain below 12.`,
      action: "Stick to moderate intensity. Zone 2 cardio or technique work is ideal.",
      icon: "activity",
    });
  } else {
    insights.push({
      id: "high-recovery",
      priority: "low",
      category: "training",
      title: "You're primed to perform",
      description: `Recovery at ${metrics.recovery}% with HRV at ${metrics.hrv}ms. Green light for hard training.`,
      action: "Go for a high-strain day. Your body can handle intensity up to 18+.",
      icon: "zap",
    });
  }

  if (metrics.sleepHours < 7) {
    insights.push({
      id: "low-sleep",
      priority: "high",
      category: "sleep",
      title: "Sleep debt accumulating",
      description: `Only ${metrics.sleepHours.toFixed(1)}h last night. Sleep score: ${metrics.sleep}%.`,
      action: "Aim for 8+ hours tonight. Start wind-down 90 min before bed.",
      icon: "moon",
    });
  }

  if (metrics.strain > 14) {
    insights.push({
      id: "high-strain",
      priority: "medium",
      category: "recovery",
      title: "High strain yesterday",
      description: `Strain hit ${metrics.strain.toFixed(1)} — your body is still processing.`,
      action: "Schedule active recovery. Foam roll, walk, or easy swim today.",
      icon: "flame",
    });
  }

  if (metrics.hrv < 50) {
    insights.push({
      id: "low-hrv",
      priority: "medium",
      category: "nutrition",
      title: "HRV below baseline",
      description: "Could indicate stress, poor nutrition, or insufficient recovery.",
      action: "Increase electrolytes, reduce caffeine after 2pm, prioritize protein.",
      icon: "droplets",
    });
  }

  return insights.sort((a, b) => {
    const priority = { high: 0, medium: 1, low: 2 };
    return priority[a.priority] - priority[b.priority];
  });
}

export function getCoachResponse(message: string, metrics: DailyMetrics): string {
  const lower = message.toLowerCase();
  const journal = getTodayJournal();
  const sehi = calculateSehiScore(metrics, journal);
  const timeline = generateEnergyTimeline(metrics, journal);
  const window = getTrainingWindow(metrics, timeline);
  const sleepDebt = calculateSleepDebt(dailyMetrics.slice(-7));

  if (lower.includes("sehi")) {
    return `Your **Sehi Score is ${sehi.score}** (${sehi.label}) — this blends recovery, sleep, load balance, and lifestyle from your journal.\n\n• Recovery: ${sehi.recovery}%\n• Sleep: ${sehi.sleep}%\n• Load balance: ${sehi.loadBalance}%\n• Lifestyle: ${sehi.lifestyle}%\n\n**Strain budget today:** ${sehi.strainBudget.toFixed(1)}\n\n${sehi.recommendation}`;
  }

  if (lower.includes("sleep debt") || lower.includes("debt")) {
    return `Your **sleep debt is ${sleepDebt.debtHours.toFixed(1)} hours** (${sleepDebt.trend} trend, ${sleepDebt.nightsShort} short nights this week).\n\n${sleepDebt.debtHours > 3 ? "Clear debt with 3 nights of 8+ hours. No late caffeine." : "Keep consistent bedtimes — you're managing well."}`;
  }

  if (lower.includes("train") && (lower.includes("time") || lower.includes("window") || lower.includes("when"))) {
    return `Your **best training window today is ${window.label}**.\n\n${window.reason}\n\nCheck your Energy Timeline on Today for the full curve. Stay within your strain budget of **${sehi.strainBudget.toFixed(1)}**.`;
  }

  if (lower.includes("recovery") || lower.includes("ready")) {
    if (metrics.recovery >= 67) {
      return `Your recovery is at **${metrics.recovery}%** — you're in great shape today. HRV is ${metrics.hrv}ms and resting HR is ${metrics.rhr} bpm. I'd recommend a high-strain workout: strength training or intervals. Target strain 15-18.`;
    }
    if (metrics.recovery >= 34) {
      return `Recovery is **${metrics.recovery}%** — moderate zone. You can train but keep it controlled. Stick to zone 2 cardio or moderate lifting. Cap strain at 12 and prioritize sleep tonight to bounce back.`;
    }
    return `Recovery is only **${metrics.recovery}%** — your body is asking for rest. HRV at ${metrics.hrv}ms is suppressed. Skip intense training. Light walk, stretching, and 8+ hours of sleep will help you recover faster.`;
  }

  if (lower.includes("sleep")) {
    return `Last night you got **${metrics.sleepHours.toFixed(1)} hours** with a sleep performance of ${metrics.sleep}%. ${metrics.sleepHours < 7 ? "That's below optimal — sleep debt affects tomorrow's recovery." : "Solid sleep foundation."} Tonight, aim to be in bed by 10:30pm for 8 hours. Avoid screens 1 hour before bed.`;
  }

  if (lower.includes("workout") || lower.includes("train") || lower.includes("exercise")) {
    if (metrics.recovery >= 67) {
      return `Green light for training! Based on your ${metrics.recovery}% recovery, try:\n\n• **Upper body strength** — 60 min, strain ~14\n• **HIIT intervals** — 30 min, strain ~16\n• **Long run** — 45 min zone 2\n\nYour HRV supports higher intensity today.`;
    }
    return `With ${metrics.recovery}% recovery, I'd suggest:\n\n• **Zone 2 cardio** — 40 min, easy pace\n• **Mobility + core** — 30 min\n• **Technique work** — light weights, focus on form\n\nSave the heavy sessions for when recovery is above 67%.`;
  }

  if (lower.includes("strain")) {
    return `Your strain yesterday was **${metrics.strain.toFixed(1)}**. ${metrics.strain > 14 ? "That's a big day — expect recovery to dip tomorrow. Plan a lighter day." : "Well-balanced training load."} Optimal weekly strain is 45-55 for most athletes. You're on track.`;
  }

  if (lower.includes("hrv") || lower.includes("heart rate variability")) {
    return `Your HRV today is **${metrics.hrv}ms** (resting HR: ${metrics.rhr} bpm). ${metrics.hrv >= 60 ? "Above your 30-day average — great autonomic balance." : "Below baseline — could indicate accumulated fatigue or stress."} Track the trend over 7 days rather than daily fluctuations.`;
  }

  if (lower.includes("plan") || lower.includes("week") || lower.includes("schedule")) {
    return `Here's your optimized week based on current data:\n\n**Today** — ${metrics.recovery >= 67 ? "High intensity training" : "Active recovery or moderate cardio"}\n**Tomorrow** — Strength session if recovery holds\n**Mid-week** — Zone 2 base building\n**Weekend** — Long activity + full rest day\n\nCheck recovery each morning before committing to intensity.`;
  }

  return `Your **Sehi Score is ${sehi.score}** with **${metrics.recovery}% recovery** and **${metrics.strain.toFixed(1)} strain**. Strain budget: **${sehi.strainBudget.toFixed(1)}** left today. Ask about Sehi Score, training window, sleep debt, journal, or your weekly plan.`;
}
