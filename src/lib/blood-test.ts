export type MarkerStatus = "normal" | "low" | "high" | "unknown";

export interface BloodMarker {
  name: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  status: MarkerStatus;
  category: string;
}

export interface BloodTestAnalysis {
  labName: string;
  testDate: string | null;
  summary: string;
  markers: BloodMarker[];
  flags: string[];
  confidence: "high" | "medium" | "low";
  notes?: string;
}

export interface BloodTestEntry {
  id: string;
  analysis: BloodTestAnalysis;
  imageUrl?: string;
  uploadedAt: string;
}

const STORAGE_KEY = "sehi-blood-tests";

export function loadBloodTests(): BloodTestEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BloodTestEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveBloodTests(entries: BloodTestEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getLatestBloodTest(): BloodTestEntry | null {
  const entries = loadBloodTests();
  if (entries.length === 0) return null;
  return entries.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  )[0];
}

export function formatBloodTestForCoach(entry: BloodTestEntry | null): string | null {
  if (!entry) return null;

  const { analysis } = entry;
  const markerLines = analysis.markers
    .slice(0, 20)
    .map(
      (m) =>
        `- ${m.name}: ${m.value} ${m.unit} (ref ${m.referenceRange}, ${m.status})`
    )
    .join("\n");

  const flags =
    analysis.flags.length > 0 ? `\nFlags: ${analysis.flags.join("; ")}` : "";

  return `Latest blood panel${analysis.labName ? ` (${analysis.labName})` : ""}${
    analysis.testDate ? ` — ${analysis.testDate}` : ""
  }:
${analysis.summary}
${markerLines}${flags}`;
}

export const statusColors: Record<MarkerStatus, string> = {
  normal: "#34D399",
  low: "#60A5FA",
  high: "#F87171",
  unknown: "#71717A",
};
