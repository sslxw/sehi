import { loadJson, saveJson } from "@/lib/data/sync";

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  servingSize: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  macros: Macros;
  imageUrl?: string;
  source: "scan" | "manual";
  confidence?: "high" | "medium" | "low";
  loggedAt: string;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const DEFAULT_TARGETS: MacroTargets = {
  calories: 2200,
  protein: 150,
  carbs: 220,
  fat: 70,
};

export interface FoodAnalysisResult {
  name: string;
  servingSize: string;
  macros: Macros;
  confidence: "high" | "medium" | "low";
  notes?: string;
}

const STORAGE_KEY = "sehi-food-log";
const TARGETS_KEY = "sehi-macro-targets";

export function getTodayDateKey(): string {
  return new Date().toISOString().split("T")[0];
}

export async function loadFoodLogAsync(userId?: string | null): Promise<FoodEntry[]> {
  return loadJson<FoodEntry[]>(userId ?? null, "food_log", []);
}

export async function saveFoodLogAsync(
  entries: FoodEntry[],
  userId?: string | null
): Promise<void> {
  await saveJson(userId ?? null, "food_log", entries);
}

export async function loadTargetsAsync(userId?: string | null): Promise<MacroTargets> {
  if (userId) {
    const { fetchProfile } = await import("@/lib/supabase/db");
    const row = await fetchProfile(userId);
    if (row?.macro_targets) return row.macro_targets;
  }
  return loadTargets();
}

export function loadTargets(): MacroTargets {
  return DEFAULT_TARGETS;
}

export async function saveMacroTargetsAsync(
  targets: MacroTargets,
  userId?: string | null
): Promise<void> {
  if (userId) {
    const { upsertProfile } = await import("@/lib/supabase/db");
    await upsertProfile(userId, { macro_targets: targets });
  }
}

export function getTodayEntries(entries: FoodEntry[]): FoodEntry[] {
  const today = getTodayDateKey();
  return entries.filter((e) => e.loggedAt.startsWith(today));
}

export function sumMacros(entries: FoodEntry[]): Macros {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.macros.calories,
      protein: acc.protein + e.macros.protein,
      carbs: acc.carbs + e.macros.carbs,
      fat: acc.fat + e.macros.fat,
      fiber: (acc.fiber ?? 0) + (e.macros.fiber ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

export function inferMealType(): FoodEntry["mealType"] {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 20) return "dinner";
  return "snack";
}

export const mealTypeLabels: Record<FoodEntry["mealType"], string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export function macroPct(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}
