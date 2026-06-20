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

const today = new Date().toISOString().split("T")[0];

export const defaultTodayJournal: JournalEntry = {
  date: today,
  alcohol: false,
  lateMeal: false,
  highStress: false,
  caffeineLate: false,
  mobility: true,
  hydration: 6,
};

export const journalHistory: JournalEntry[] = [
  { date: today, alcohol: false, lateMeal: false, highStress: false, caffeineLate: true, mobility: false, hydration: 5 },
  {
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    alcohol: true,
    lateMeal: true,
    highStress: false,
    caffeineLate: false,
    mobility: false,
    hydration: 4,
  },
  {
    date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
    alcohol: false,
    lateMeal: false,
    highStress: true,
    caffeineLate: false,
    mobility: true,
    hydration: 8,
  },
  {
    date: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0],
    alcohol: false,
    lateMeal: false,
    highStress: false,
    caffeineLate: false,
    mobility: true,
    hydration: 9,
  },
  {
    date: new Date(Date.now() - 4 * 86400000).toISOString().split("T")[0],
    alcohol: false,
    lateMeal: true,
    highStress: false,
    caffeineLate: true,
    mobility: false,
    hydration: 6,
  },
];

export function getTodayJournal(): JournalEntry {
  return journalHistory.find((e) => e.date === today) ?? defaultTodayJournal;
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
