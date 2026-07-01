import type { MedicationEntry } from "./user-profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function loadMedicationsAsync(userId?: string | null): Promise<MedicationEntry[]> {
  if (userId && isSupabaseConfigured()) {
    const { fetchProfile } = await import("@/lib/supabase/db");
    const row = await fetchProfile(userId);
    return row?.medications ?? [];
  }
  return [];
}

export async function saveMedicationsAsync(
  medications: MedicationEntry[],
  userId?: string | null
): Promise<void> {
  if (!userId || !isSupabaseConfigured()) return;
  const { upsertProfile } = await import("@/lib/supabase/db");
  await upsertProfile(userId, { medications });
}

export async function hasMedicationsAsync(userId?: string | null): Promise<boolean> {
  const meds = await loadMedicationsAsync(userId);
  return meds.length > 0;
}

/** @deprecated use loadMedicationsAsync */
export function loadMedications(): MedicationEntry[] {
  return [];
}

/** @deprecated use saveMedicationsAsync */
export function saveMedications(_medications: MedicationEntry[]): void {}

/** @deprecated use hasMedicationsAsync */
export function hasMedications(): boolean {
  return false;
}
