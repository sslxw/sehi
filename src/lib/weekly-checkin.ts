export interface WeeklyCheckIn {
  id: string;
  weekStart: string;
  weightKg?: number;
  waistCm?: number;
  chestCm?: number;
  hipsCm?: number;
  bodyFatPct?: number;
  energyScore?: number;
  stressScore?: number;
  sleepQuality?: number;
  notes?: string;
  loggedAt: string;
}

import { loadJson, saveJson } from "@/lib/data/sync";

const STORAGE_KEY = "sehi-weekly-checkins";

export function getWeekStart(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

export async function loadWeeklyCheckInsAsync(userId?: string | null): Promise<WeeklyCheckIn[]> {
  return loadJson<WeeklyCheckIn[]>(userId ?? null, "weekly_checkins", []);
}

export async function saveWeeklyCheckInsAsync(
  entries: WeeklyCheckIn[],
  userId?: string | null
): Promise<void> {
  await saveJson(userId ?? null, "weekly_checkins", entries);
}

export function getCurrentWeekCheckIn(entries: WeeklyCheckIn[]): WeeklyCheckIn | null {
  const weekStart = getWeekStart();
  return entries.find((e) => e.weekStart === weekStart) ?? null;
}

export function upsertWeeklyCheckIn(
  entries: WeeklyCheckIn[],
  data: Omit<WeeklyCheckIn, "id" | "loggedAt"> & { id?: string }
): WeeklyCheckIn[] {
  const existing = entries.find((e) => e.weekStart === data.weekStart);
  const entry: WeeklyCheckIn = {
    id: existing?.id ?? data.id ?? crypto.randomUUID(),
    weekStart: data.weekStart,
    weightKg: data.weightKg,
    waistCm: data.waistCm,
    chestCm: data.chestCm,
    hipsCm: data.hipsCm,
    bodyFatPct: data.bodyFatPct,
    energyScore: data.energyScore,
    stressScore: data.stressScore,
    sleepQuality: data.sleepQuality,
    notes: data.notes,
    loggedAt: new Date().toISOString(),
  };

  if (existing) {
    return entries.map((e) => (e.id === existing.id ? entry : e));
  }
  return [entry, ...entries];
}

export function weightTrend(entries: WeeklyCheckIn[]): { week: string; weight: number }[] {
  return entries
    .filter((e) => e.weightKg != null)
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
    .slice(-8)
    .map((e) => ({ week: e.weekStart, weight: e.weightKg! }));
}

export function waistTrend(entries: WeeklyCheckIn[]): { week: string; waist: number }[] {
  return entries
    .filter((e) => e.waistCm != null)
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
    .slice(-8)
    .map((e) => ({ week: e.weekStart, waist: e.waistCm! }));
}

export function formatCheckInForReview(entries: WeeklyCheckIn[]): string {
  if (!entries.length) return "No weekly check-ins logged.";
  return entries
    .slice(0, 8)
    .map((e) => {
      const parts = [
        e.weightKg != null ? `weight ${e.weightKg}kg` : null,
        e.waistCm != null ? `waist ${e.waistCm}cm` : null,
        e.energyScore != null ? `energy ${e.energyScore}/10` : null,
        e.stressScore != null ? `stress ${e.stressScore}/10` : null,
        e.notes ? `notes: ${e.notes}` : null,
      ].filter(Boolean);
      return `- Week of ${e.weekStart}: ${parts.join(", ") || "logged"}`;
    })
    .join("\n");
}
