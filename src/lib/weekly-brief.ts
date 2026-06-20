import { dailyMetrics } from "./whoop-data";

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

export function getWeeklyBrief(): WeeklyBrief {
  const last7 = dailyMetrics.slice(-7);
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

  if (recoveryAvg >= 60) wins.push(`Recovery averaged ${recoveryAvg}% — solid recovery week`);
  else risks.push(`Recovery averaged ${recoveryAvg}% — below optimal`);

  if (sleepAvg >= 7.5) wins.push(`${sleepAvg}h average sleep — great consistency`);
  else risks.push(`Only ${sleepAvg}h sleep average — prioritize earlier bedtimes`);

  const highStrainDays = last7.filter((d) => d.strain > 14).length;
  if (highStrainDays >= 3) risks.push(`${highStrainDays} high-strain days — watch for burnout`);
  else if (highStrainDays >= 1) wins.push("Good strain distribution across the week");

  if (strainActual > strainTarget + 5) risks.push("Weekly strain above target — schedule a rest day");
  else if (strainActual >= strainTarget - 5) wins.push("Weekly strain on target");

  const bestDay = last7.reduce((a, b) => (a.recovery > b.recovery ? a : b));
  wins.push(`Best recovery: ${bestDay.recovery}% (${bestDay.date})`);

  let focus: string;
  if (recoveryAvg < 55) focus = "Recovery first — 2 rest days and 8h sleep minimum";
  else if (sleepAvg < 7) focus = "Sleep is your lever — wind-down routine and no screens after 9pm";
  else if (strainActual < strainTarget - 10) focus = "You have room to push — add one high-strain session";
  else focus = "Maintain balance — keep logging journal to refine your Sehi Score";

  const headline =
    recoveryAvg >= 65 && sleepAvg >= 7.5
      ? "Strong week — you're building momentum"
      : recoveryAvg >= 50
        ? "Steady week — small tweaks will compound"
        : "Recovery week needed — protect your baseline";

  return {
    weekLabel: "This week",
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
