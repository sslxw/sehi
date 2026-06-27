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

export function loadFoodLog(): FoodEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FoodEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveFoodLog(entries: FoodEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function loadTargets(): MacroTargets {
  if (typeof window === "undefined") return DEFAULT_TARGETS;
  try {
    const raw = localStorage.getItem(TARGETS_KEY);
    return raw ? (JSON.parse(raw) as MacroTargets) : DEFAULT_TARGETS;
  } catch {
    return DEFAULT_TARGETS;
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
