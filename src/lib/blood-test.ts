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

import { loadJson, saveJson } from "@/lib/data/sync";

const STORAGE_KEY = "sehi-blood-tests";

export async function loadBloodTestsAsync(userId?: string | null): Promise<BloodTestEntry[]> {
  return loadJson<BloodTestEntry[]>(userId ?? null, "blood_tests", []);
}

export async function saveBloodTestsAsync(
  entries: BloodTestEntry[],
  userId?: string | null
): Promise<void> {
  await saveJson(userId ?? null, "blood_tests", entries);
}

export async function getLatestBloodTestAsync(
  userId?: string | null
): Promise<BloodTestEntry | null> {
  const entries = await loadBloodTestsAsync(userId);
  if (entries.length === 0) return null;
  return entries.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  )[0];
}

/** @deprecated use getLatestBloodTestAsync */
export function getLatestBloodTest(): BloodTestEntry | null {
  return null;
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
