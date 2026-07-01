import { loadJson, saveJson } from "@/lib/data/sync";

export interface JournalFactor {
  id: string;
  label: string;
  icon: string;
  type: "toggle" | "counter";
  impact: string;
}

export interface JournalEntry {
  date: string;
  alcohol: boolean;
  lateMeal: boolean;
  highStress: boolean;
  caffeineLate: boolean;
  mobility: boolean;
  hydration: number;
}

export const journalFactors: JournalFactor[] = [
  { id: "alcohol", label: "Alcohol", icon: "wine", type: "toggle", impact: "HRV −18% avg next day" },
  { id: "lateMeal", label: "Late meal", icon: "utensils", type: "toggle", impact: "Sleep quality −12%" },
  { id: "highStress", label: "High stress", icon: "brain", type: "toggle", impact: "Recovery −15% avg" },
  { id: "caffeineLate", label: "Late caffeine", icon: "coffee", type: "toggle", impact: "Deep sleep −20 min" },
  { id: "mobility", label: "Mobility work", icon: "stretch", type: "toggle", impact: "HRV +8% avg" },
  { id: "hydration", label: "Water (glasses)", icon: "droplets", type: "counter", impact: "8+ optimal" },
];

export function getTodayDateKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function createDefaultJournalEntry(date = getTodayDateKey()): JournalEntry {
  return {
    date,
    alcohol: false,
    lateMeal: false,
    highStress: false,
    caffeineLate: false,
    mobility: true,
    hydration: 6,
  };
}

/** Default entry when journal hasn't loaded yet (no mock history) */
export const defaultTodayJournal = createDefaultJournalEntry();

export async function loadJournalHistoryAsync(
  userId?: string | null
): Promise<JournalEntry[]> {
  return loadJson<JournalEntry[]>(userId ?? null, "journal", []);
}

export async function saveJournalHistoryAsync(
  history: JournalEntry[],
  userId?: string | null
): Promise<void> {
  await saveJson(userId ?? null, "journal", history);
}

export async function getTodayJournalAsync(userId?: string | null): Promise<JournalEntry> {
  const today = getTodayDateKey();
  const history = await loadJournalHistoryAsync(userId);
  return history.find((e) => e.date === today) ?? createDefaultJournalEntry(today);
}

export async function upsertJournalEntry(
  entry: JournalEntry,
  userId?: string | null
): Promise<JournalEntry[]> {
  const history = await loadJournalHistoryAsync(userId);
  const idx = history.findIndex((e) => e.date === entry.date);
  const next =
    idx >= 0 ? history.map((e, i) => (i === idx ? entry : e)) : [entry, ...history];
  await saveJournalHistoryAsync(next, userId);
  return next;
}

/** @deprecated use getTodayJournalAsync — returns empty defaults, not mock data */
export function getTodayJournal(): JournalEntry {
  return defaultTodayJournal;
}

export interface CorrelationInsight {
  factor: string;
  impact: string;
  confidence: "high" | "medium";
}

export function getJournalCorrelations(): CorrelationInsight[] {
  return [
    { factor: "Alcohol", impact: "Your HRV drops 18% on days after drinking", confidence: "high" },
    { factor: "Late meals", impact: "Sleep score drops 12% when you eat after 9pm", confidence: "high" },
    { factor: "Mobility", impact: "HRV improves 8% on days with mobility work", confidence: "medium" },
    { factor: "Hydration", impact: "Recovery +6% when you hit 8+ glasses", confidence: "medium" },
  ];
}
