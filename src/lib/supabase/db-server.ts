import { createClient } from "./server";
import type { ProfileRow, UserDataKind } from "./db";

export type { ProfileRow, UserDataKind };

export async function fetchProfileServer(userId: string): Promise<ProfileRow | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as ProfileRow;
}

export async function loadUserDataServer<T>(
  userId: string,
  kind: UserDataKind,
  dataKey = "default"
): Promise<T | null> {
  const supabase = await createClient();
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

export async function saveUserDataServer<T>(
  userId: string,
  kind: UserDataKind,
  payload: T,
  dataKey = "default"
): Promise<void> {
  const supabase = await createClient();
  if (!supabase) return;

  const { error } = await supabase.from("user_data").upsert({
    user_id: userId,
    kind,
    data_key: dataKey,
    payload,
  });
  if (error) console.error("saveUserDataServer:", error.message);
}

export async function getAuthUserIdServer(): Promise<string | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
