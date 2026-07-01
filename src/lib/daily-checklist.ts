import { loadJson, saveJson, loadAllJson } from "@/lib/data/sync";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type ChecklistCategory = "habits" | "training" | "nutrition" | "recovery" | "tracking";

export interface ChecklistItem {
  id: string;
  labelKey: string;
  category: ChecklistCategory;
  completed: boolean;
  linkedHref?: string;
}

export interface DailyChecklist {
  date: string;
  items: ChecklistItem[];
}

export function getTodayDateKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function defaultChecklistItems(trainingDay = false): ChecklistItem[] {
  const items: ChecklistItem[] = [
    { id: "journal", labelKey: "checklist.journal", category: "habits", completed: false, linkedHref: "/journal" },
    { id: "hydration", labelKey: "checklist.hydration", category: "habits", completed: false, linkedHref: "/journal" },
    { id: "food", labelKey: "checklist.food", category: "nutrition", completed: false, linkedHref: "/food" },
    { id: "mobility", labelKey: "checklist.mobility", category: "recovery", completed: false },
    { id: "winddown", labelKey: "checklist.winddown", category: "recovery", completed: false },
  ];

  if (trainingDay) {
    items.unshift({
      id: "workout",
      labelKey: "checklist.workout",
      category: "training",
      completed: false,
      linkedHref: "/workouts",
    });
  }

  const day = new Date().getDay();
  if (day === 0 || day === 6) {
    items.push({
      id: "weekly-checkin",
      labelKey: "checklist.weeklyCheckin",
      category: "tracking",
      completed: false,
      linkedHref: "/check-in",
    });
  }

  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  if (now.getDate() >= lastDay - 2) {
    items.push({
      id: "monthly-review",
      labelKey: "checklist.monthlyReview",
      category: "tracking",
      completed: false,
      linkedHref: "/review",
    });
  }

  return items;
}

export function isTrainingDay(trainingDaysPerWeek = 3): boolean {
  const day = new Date().getDay();
  const patterns: Record<number, number[]> = {
    1: [3],
    2: [2, 5],
    3: [1, 3, 5],
    4: [1, 2, 4, 6],
    5: [1, 2, 3, 5, 6],
    6: [1, 2, 3, 4, 5, 6],
    7: [0, 1, 2, 3, 4, 5, 6],
  };
  const days = patterns[Math.min(7, Math.max(1, trainingDaysPerWeek))] ?? patterns[3];
  return days.includes(day);
}

function defaultChecklist(date: string, trainingDaysPerWeek: number): DailyChecklist {
  return {
    date,
    items: defaultChecklistItems(isTrainingDay(trainingDaysPerWeek)),
  };
}

export async function loadDailyChecklistAsync(
  userId: string | null | undefined,
  date = getTodayDateKey(),
  trainingDaysPerWeek = 3
): Promise<DailyChecklist> {
  if (userId && isSupabaseConfigured()) {
    const remote = await loadJson<DailyChecklist>(
      userId,
      "daily_checklists",
      defaultChecklist(date, trainingDaysPerWeek),
      date
    );
    if (remote?.items?.length) return remote;
  }
  return defaultChecklist(date, trainingDaysPerWeek);
}

export async function saveDailyChecklistAsync(
  checklist: DailyChecklist,
  userId?: string | null
): Promise<void> {
  await saveJson(userId ?? null, "daily_checklists", checklist, checklist.date);
}

export function toggleChecklistItem(
  checklist: DailyChecklist,
  itemId: string
): DailyChecklist {
  return {
    ...checklist,
    items: checklist.items.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ),
  };
}

export function checklistProgress(checklist: DailyChecklist): {
  completed: number;
  total: number;
  pct: number;
} {
  const total = checklist.items.length;
  const completed = checklist.items.filter((i) => i.completed).length;
  return { completed, total, pct: total ? Math.round((completed / total) * 100) : 0 };
}

export async function loadChecklistStreakAsync(
  userId: string | null | undefined,
  maxDays = 14
): Promise<number> {
  if (!userId || !isSupabaseConfigured()) return 0;

  const all = await loadAllJson<DailyChecklist>(userId, "daily_checklists");
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < maxDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const checklist = all[key];
    if (!checklist) break;
    const { pct } = checklistProgress(checklist);
    if (pct >= 80) streak++;
    else if (i === 0) continue;
    else break;
  }

  return streak;
}

export async function collectMonthChecklistDataAsync(
  userId: string | null | undefined,
  month: string
): Promise<{ date: string; pct: number }[]> {
  if (!userId || !isSupabaseConfigured()) return [];

  const all = await loadAllJson<DailyChecklist>(userId, "daily_checklists");
  const [year, m] = month.split("-").map(Number);
  const days: { date: string; pct: number }[] = [];

  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, m - 1, d);
    if (date.getMonth() !== m - 1) break;
    const key = date.toISOString().split("T")[0];
    const checklist = all[key];
    if (checklist) {
      days.push({ date: key, pct: checklistProgress(checklist).pct });
    }
  }

  return days;
}
