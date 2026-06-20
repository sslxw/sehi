import type { DailyMetrics } from "./whoop-data";
import type { JournalEntry } from "./journal";
import { calculateSehiScore } from "./sehi-score";
import { calculateSleepDebt } from "./energy";

export type WorkScheduleType = "full" | "standard" | "reduced" | "flexible" | "rest";
export type MeetingLoad = "full" | "light" | "minimal" | "none";
export type EmployeeStatus = "active" | "on_leave" | "at_risk";

export interface WorkCapacity {
  recommendedHours: number;
  baselineHours: number;
  scheduleType: WorkScheduleType;
  label: string;
  guidance: string;
  meetingLoad: MeetingLoad;
  deepWorkBlocks: number;
  flags: string[];
  sehiScore: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  team: string;
  email: string;
  avatarColor: string;
  baselineHours: number;
  status: EmployeeStatus;
  metrics: DailyMetrics;
  journal: JournalEntry;
  consecutiveLowRecovery: number;
  recentMetrics: DailyMetrics[];
}

function emptyJournal(date: string): JournalEntry {
  return {
    date,
    alcohol: false,
    lateMeal: false,
    highStress: false,
    caffeineLate: false,
    mobility: false,
    hydration: 6,
  };
}

function genMetrics(seed: number, recovery: number): DailyMetrics {
  const today = new Date().toISOString().split("T")[0];
  const sleep = Math.min(99, Math.max(40, recovery + (seed % 15) - 7));
  const strain = Math.max(2, Math.min(18, 20 - recovery / 8 + (seed % 5)));
  return {
    date: today,
    recovery,
    strain,
    sleep,
    hrv: Math.floor(40 + recovery * 0.45 + seed % 12),
    rhr: Math.floor(54 + (100 - recovery) * 0.12 + seed % 5),
    sleepHours: 5.5 + (sleep / 100) * 3,
    calories: 1800 + strain * 80,
    steps: 4000 + strain * 500,
  };
}

export const employees: Employee[] = [
  {
    id: "emp-1",
    name: "Maya Chen",
    role: "Senior Engineer",
    team: "Engineering",
    email: "maya@company.com",
    avatarColor: "#22D3EE",
    baselineHours: 8,
    status: "active",
    metrics: genMetrics(1, 78),
    journal: { ...emptyJournal(new Date().toISOString().split("T")[0]), mobility: true, hydration: 8 },
    consecutiveLowRecovery: 0,
    recentMetrics: [genMetrics(1, 72), genMetrics(2, 78), genMetrics(3, 81)],
  },
  {
    id: "emp-2",
    name: "James Okonkwo",
    role: "Product Manager",
    team: "Product",
    email: "james@company.com",
    avatarColor: "#A78BFA",
    baselineHours: 8,
    status: "active",
    metrics: genMetrics(2, 52),
    journal: { ...emptyJournal(new Date().toISOString().split("T")[0]), highStress: true, caffeineLate: true },
    consecutiveLowRecovery: 1,
    recentMetrics: [genMetrics(2, 48), genMetrics(3, 55), genMetrics(4, 52)],
  },
  {
    id: "emp-3",
    name: "Elena Vasquez",
    role: "Designer",
    team: "Design",
    email: "elena@company.com",
    avatarColor: "#34D399",
    baselineHours: 8,
    status: "active",
    metrics: genMetrics(3, 88),
    journal: { ...emptyJournal(new Date().toISOString().split("T")[0]), mobility: true, hydration: 9 },
    consecutiveLowRecovery: 0,
    recentMetrics: [genMetrics(3, 82), genMetrics(4, 85), genMetrics(5, 88)],
  },
  {
    id: "emp-4",
    name: "David Kim",
    role: "Sales Lead",
    team: "Sales",
    email: "david@company.com",
    avatarColor: "#FBBF24",
    baselineHours: 8,
    status: "at_risk",
    metrics: genMetrics(4, 28),
    journal: { ...emptyJournal(new Date().toISOString().split("T")[0]), alcohol: true, lateMeal: true, highStress: true },
    consecutiveLowRecovery: 4,
    recentMetrics: [genMetrics(4, 32), genMetrics(5, 28), genMetrics(6, 25)],
  },
  {
    id: "emp-5",
    name: "Aisha Patel",
    role: "Data Analyst",
    team: "Engineering",
    email: "aisha@company.com",
    avatarColor: "#60A5FA",
    baselineHours: 8,
    status: "active",
    metrics: genMetrics(5, 64),
    journal: { ...emptyJournal(new Date().toISOString().split("T")[0]), hydration: 7 },
    consecutiveLowRecovery: 0,
    recentMetrics: [genMetrics(5, 60), genMetrics(6, 67), genMetrics(7, 64)],
  },
  {
    id: "emp-6",
    name: "Marcus Thompson",
    role: "Customer Success",
    team: "Support",
    email: "marcus@company.com",
    avatarColor: "#FB923C",
    baselineHours: 8,
    status: "active",
    metrics: genMetrics(6, 41),
    journal: { ...emptyJournal(new Date().toISOString().split("T")[0]), highStress: true },
    consecutiveLowRecovery: 2,
    recentMetrics: [genMetrics(6, 38), genMetrics(7, 44), genMetrics(8, 41)],
  },
  {
    id: "emp-7",
    name: "Sophie Laurent",
    role: "HR Director",
    team: "People",
    email: "sophie@company.com",
    avatarColor: "#F472B6",
    baselineHours: 8,
    status: "on_leave",
    metrics: genMetrics(7, 70),
    journal: emptyJournal(new Date().toISOString().split("T")[0]),
    consecutiveLowRecovery: 0,
    recentMetrics: [genMetrics(7, 68), genMetrics(8, 70), genMetrics(9, 72)],
  },
  {
    id: "emp-8",
    name: "Ryan O'Brien",
    role: "DevOps Engineer",
    team: "Engineering",
    email: "ryan@company.com",
    avatarColor: "#2DD4BF",
    baselineHours: 8,
    status: "active",
    metrics: genMetrics(8, 71),
    journal: { ...emptyJournal(new Date().toISOString().split("T")[0]), mobility: true },
    consecutiveLowRecovery: 0,
    recentMetrics: [genMetrics(8, 69), genMetrics(9, 73), genMetrics(10, 71)],
  },
];

export function calculateWorkCapacity(employee: Employee): WorkCapacity {
  const { metrics, journal, baselineHours, consecutiveLowRecovery, recentMetrics } = employee;
  const sehi = calculateSehiScore(metrics, journal);
  const sleepDebt = calculateSleepDebt(recentMetrics);
  const flags: string[] = [];

  let recommendedHours = baselineHours;
  let scheduleType: WorkScheduleType = "standard";
  let meetingLoad: MeetingLoad = "full";
  let deepWorkBlocks = 2;
  let label = "Standard day";
  let guidance = "Full schedule appropriate. Protect focus blocks for deep work.";

  if (sehi.score >= 80) {
    recommendedHours = baselineHours;
    scheduleType = "full";
    label = "Full capacity";
    meetingLoad = "full";
    deepWorkBlocks = 3;
    guidance = "Peak readiness — ideal for launches, complex projects, and high-stakes meetings.";
  } else if (sehi.score >= 65) {
    recommendedHours = baselineHours;
    scheduleType = "standard";
    label = "Standard day";
    meetingLoad = "full";
    deepWorkBlocks = 2;
    guidance = "Normal workload. Block 2+ hours for focused work; avoid stacking back-to-back meetings.";
  } else if (sehi.score >= 50) {
    recommendedHours = Math.max(6, baselineHours - 1.5);
    scheduleType = "reduced";
    label = "Reduced load";
    meetingLoad = "light";
    deepWorkBlocks = 1;
    guidance = "Cap at 6–7 hours. Defer non-essential meetings. One deep-work block only.";
    flags.push("Reduced capacity recommended");
  } else if (sehi.score >= 35) {
    recommendedHours = Math.max(4, baselineHours - 3);
    scheduleType = "flexible";
    label = "Flexible / async";
    meetingLoad = "minimal";
    deepWorkBlocks = 0;
    guidance = "Async-first day. 4–5 hours max. No critical deadlines. Manager check-in suggested.";
    flags.push("Flexible schedule");
  } else {
    recommendedHours = 0;
    scheduleType = "rest";
    label = "Rest day";
    meetingLoad = "none";
    deepWorkBlocks = 0;
    guidance = "Recommend time off or medical rest. Reassign urgent work. No meetings required.";
    flags.push("Rest recommended");
  }

  if (sleepDebt.debtHours > 2) {
    recommendedHours = Math.max(0, recommendedHours - 1);
    flags.push(`Sleep debt: ${sleepDebt.debtHours.toFixed(1)}h`);
  }

  if (journal.highStress) {
    recommendedHours = Math.max(0, recommendedHours - 0.5);
    flags.push("High stress logged");
    if (meetingLoad === "full") meetingLoad = "light";
  }

  if (consecutiveLowRecovery >= 3) {
    recommendedHours = Math.max(0, recommendedHours - 2);
    scheduleType = scheduleType === "full" || scheduleType === "standard" ? "flexible" : scheduleType;
    flags.push(`${consecutiveLowRecovery} days low recovery — burnout risk`);
  }

  if (employee.status === "at_risk") {
    flags.push("Flagged at-risk by HR");
  }

  recommendedHours = Math.round(recommendedHours * 2) / 2;

  return {
    recommendedHours,
    baselineHours,
    scheduleType,
    label,
    guidance,
    meetingLoad,
    deepWorkBlocks,
    flags,
    sehiScore: sehi.score,
  };
}

export function getEmployeeCapacity(employee: Employee) {
  return { employee, capacity: calculateWorkCapacity(employee) };
}

export function getAllEmployeeCapacities() {
  return employees
    .filter((e) => e.status !== "on_leave")
    .map(getEmployeeCapacity);
}

export function getEmployeeById(id: string): Employee | undefined {
  return employees.find((e) => e.id === id);
}

export interface EnterpriseSummary {
  totalActive: number;
  onLeave: number;
  atRisk: number;
  avgSehiScore: number;
  avgRecommendedHours: number;
  totalCapacityHours: number;
  baselineCapacityHours: number;
  restRecommended: number;
  reducedLoad: number;
  teams: { name: string; count: number; avgSehi: number; avgHours: number }[];
}

export function getEnterpriseSummary(): EnterpriseSummary {
  const active = employees.filter((e) => e.status !== "on_leave");
  const capacities = active.map(getEmployeeCapacity);

  const avgSehiScore = Math.round(
    capacities.reduce((s, c) => s + c.capacity.sehiScore, 0) / capacities.length
  );
  const avgRecommendedHours =
    Math.round(
      (capacities.reduce((s, c) => s + c.capacity.recommendedHours, 0) / capacities.length) * 10
    ) / 10;
  const totalCapacityHours = capacities.reduce((s, c) => s + c.capacity.recommendedHours, 0);
  const baselineCapacityHours = active.reduce((s, e) => s + e.baselineHours, 0);

  const teamMap = new Map<string, { count: number; sehi: number; hours: number }>();
  capacities.forEach(({ employee, capacity }) => {
    const t = teamMap.get(employee.team) ?? { count: 0, sehi: 0, hours: 0 };
    t.count++;
    t.sehi += capacity.sehiScore;
    t.hours += capacity.recommendedHours;
    teamMap.set(employee.team, t);
  });

  const teams = Array.from(teamMap.entries()).map(([name, data]) => ({
    name,
    count: data.count,
    avgSehi: Math.round(data.sehi / data.count),
    avgHours: Math.round((data.hours / data.count) * 10) / 10,
  }));

  return {
    totalActive: active.length,
    onLeave: employees.filter((e) => e.status === "on_leave").length,
    atRisk: employees.filter((e) => e.status === "at_risk").length,
    avgSehiScore,
    avgRecommendedHours,
    totalCapacityHours: Math.round(totalCapacityHours * 10) / 10,
    baselineCapacityHours,
    restRecommended: capacities.filter((c) => c.capacity.scheduleType === "rest").length,
    reducedLoad: capacities.filter(
      (c) => c.capacity.scheduleType === "reduced" || c.capacity.scheduleType === "flexible"
    ).length,
    teams,
  };
}

export const scheduleTypeColors: Record<WorkScheduleType, string> = {
  full: "#34D399",
  standard: "#22D3EE",
  reduced: "#FBBF24",
  flexible: "#FB923C",
  rest: "#F87171",
};
