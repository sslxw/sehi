import type { UserProfile } from "@/lib/user-profile";
import type { MacroTargets } from "@/lib/food";
import type { CalendarEvent } from "@/lib/whoop-data";
import type { MedicationEntry } from "@/lib/user-profile";
import type { Locale } from "@/lib/i18n/types";
import { createClientIfConfigured } from "./client";

export interface ProfileRow {
  id: string;
  email: string | null;
  display_name: string;
  onboarding_complete: boolean;
  profile: UserProfile | null;
  macro_targets: MacroTargets | null;
  medications: MedicationEntry[] | null;
  calendar_events: CalendarEvent[] | null;
  locale: Locale | null;
}

export type UserDataKind =
  | "food_log"
  | "workouts"
  | "weekly_checkins"
  | "blood_tests"
  | "monthly_reviews"
  | "daily_checklists"
  | "journal"
  | "whoop_tokens";

async function getBrowserClient() {
  return createClientIfConfigured();
}

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = await getBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as ProfileRow;
}

export async function upsertProfile(
  userId: string,
  patch: Partial<Omit<ProfileRow, "id">>
): Promise<void> {
  const supabase = await getBrowserClient();
  if (!supabase) return;

  const { error } = await supabase.from("profiles").upsert({ id: userId, ...patch });
  if (error) console.error("upsertProfile:", error.message);
}

export async function completeOnboarding(
  userId: string,
  profile: UserProfile,
  macroTargets: MacroTargets,
  medications: MedicationEntry[],
  calendarEvents: CalendarEvent[]
): Promise<void> {
  await upsertProfile(userId, {
    display_name: profile.displayName,
    onboarding_complete: true,
    profile,
    macro_targets: macroTargets,
    medications,
    calendar_events: calendarEvents,
  });
}

export async function loadUserData<T>(
  userId: string,
  kind: UserDataKind,
  dataKey = "default"
): Promise<T | null> {
  const supabase = await getBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("user_data")
    .select("payload")
    .eq("user_id", userId)
    .eq("kind", kind)
    .eq("data_key", dataKey)
    .maybeSingle();

  if (error || !data) return null;
  return data.payload as T;
}

export async function saveUserData<T>(
  userId: string,
  kind: UserDataKind,
  payload: T,
  dataKey = "default"
): Promise<void> {
  const supabase = await getBrowserClient();
  if (!supabase) return;

  const { error } = await supabase.from("user_data").upsert({
    user_id: userId,
    kind,
    data_key: dataKey,
    payload,
  });
  if (error) console.error("saveUserData:", error.message);
}

export async function loadAllUserDataByKind<T>(
  userId: string,
  kind: UserDataKind
): Promise<{ key: string; payload: T }[]> {
  const supabase = await getBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("user_data")
    .select("data_key, payload")
    .eq("user_id", userId)
    .eq("kind", kind);

  if (error || !data) return [];
  return data.map((row) => ({ key: row.data_key, payload: row.payload as T }));
}

export async function deleteUserData(
  userId: string,
  kind: UserDataKind,
  dataKey: string
): Promise<void> {
  const supabase = await getBrowserClient();
  if (!supabase) return;

  await supabase
    .from("user_data")
    .delete()
    .eq("user_id", userId)
    .eq("kind", kind)
    .eq("data_key", dataKey);
}
