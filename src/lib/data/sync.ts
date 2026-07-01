import {
  loadUserData,
  saveUserData,
  loadAllUserDataByKind,
  type UserDataKind,
} from "@/lib/supabase/db";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Load from Supabase — requires userId when Supabase is configured */
export async function loadJson<T>(
  userId: string | null | undefined,
  kind: UserDataKind,
  fallback: T,
  dataKey = "default"
): Promise<T> {
  if (!isSupabaseConfigured()) return fallback;
  if (!userId) return fallback;

  const remote = await loadUserData<T>(userId, kind, dataKey);
  return remote ?? fallback;
}

/** Save to Supabase — requires userId when Supabase is configured */
export async function saveJson<T>(
  userId: string | null | undefined,
  kind: UserDataKind,
  data: T,
  dataKey = "default"
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  if (!userId) return;

  await saveUserData(userId, kind, data, dataKey);
}

/** Load all keyed rows for a kind (e.g. daily checklists by date) */
export async function loadAllJson<T>(
  userId: string | null | undefined,
  kind: UserDataKind
): Promise<Record<string, T>> {
  const result: Record<string, T> = {};
  if (!isSupabaseConfigured() || !userId) return result;

  const rows = await loadAllUserDataByKind<T>(userId, kind);
  for (const row of rows) {
    result[row.key] = row.payload;
  }
  return result;
}

/** One-time migration from legacy localStorage → Supabase */
export async function migrateLocalToSupabase(userId: string): Promise<void> {
  if (!isSupabaseConfigured() || typeof window === "undefined") return;

  const MIGRATED_KEY = `sehi-migrated-${userId}`;
  if (localStorage.getItem(MIGRATED_KEY)) return;

  const blobKinds: { kind: UserDataKind; localKey: string }[] = [
    { kind: "food_log", localKey: "sehi-food-log" },
    { kind: "workouts", localKey: "sehi-workout-sessions" },
    { kind: "weekly_checkins", localKey: "sehi-weekly-checkins" },
    { kind: "blood_tests", localKey: "sehi-blood-tests" },
    { kind: "monthly_reviews", localKey: "sehi-monthly-reviews" },
    { kind: "journal", localKey: "sehi-journal-history" },
  ];

  for (const { kind, localKey } of blobKinds) {
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) await saveUserData(userId, kind, JSON.parse(raw));
    } catch {
      // skip
    }
  }

  // Daily checklists (prefixed keys)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith("sehi-daily-checklist-")) continue;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const dateKey = key.replace("sehi-daily-checklist-", "");
        await saveUserData(userId, "daily_checklists", JSON.parse(raw), dateKey);
      }
    } catch {
      // skip
    }
  }

  try {
    const profileRaw = localStorage.getItem(`sehi-user-profile-${userId}`);
    const calendarRaw = localStorage.getItem("sehi-calendar-events");
    const medsRaw = localStorage.getItem("sehi-medications");
    const localeRaw = localStorage.getItem("sehi-locale");
    const { upsertProfile } = await import("@/lib/supabase/db");

    const patch: Record<string, unknown> = {};
    if (profileRaw) {
      const profile = JSON.parse(profileRaw);
      patch.profile = profile;
      patch.onboarding_complete = profile.onboardingComplete ?? false;
      patch.display_name = profile.displayName;
      patch.macro_targets = profile.macroTargets;
      patch.medications = profile.medications;
    }
    if (calendarRaw) patch.calendar_events = JSON.parse(calendarRaw);
    if (medsRaw) patch.medications = JSON.parse(medsRaw);
    if (localeRaw) patch.locale = localeRaw;

    if (Object.keys(patch).length > 0) {
      await upsertProfile(userId, patch);
    }
  } catch {
    // skip
  }

  localStorage.setItem(MIGRATED_KEY, "1");
}
