import type { CalendarEvent } from "./whoop-data";
import { calendarEvents as defaultCalendarEvents } from "./whoop-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function loadCalendarEventsAsync(
  userId?: string | null
): Promise<CalendarEvent[]> {
  if (userId && isSupabaseConfigured()) {
    const { fetchProfile } = await import("@/lib/supabase/db");
    const row = await fetchProfile(userId);
    if (row?.calendar_events?.length) return row.calendar_events;
  }
  return defaultCalendarEvents;
}

export async function saveCalendarEventsAsync(
  events: CalendarEvent[],
  userId?: string | null
): Promise<void> {
  if (!userId || !isSupabaseConfigured()) return;
  const { upsertProfile } = await import("@/lib/supabase/db");
  await upsertProfile(userId, { calendar_events: events });
}

export async function hasPersonalizedCalendarAsync(userId?: string | null): Promise<boolean> {
  if (!userId || !isSupabaseConfigured()) return false;
  const { fetchProfile } = await import("@/lib/supabase/db");
  const row = await fetchProfile(userId);
  return Boolean(row?.calendar_events?.length);
}

/** @deprecated use loadCalendarEventsAsync */
export function loadCalendarEvents(): CalendarEvent[] {
  return defaultCalendarEvents;
}

/** @deprecated use saveCalendarEventsAsync */
export function saveCalendarEvents(_events: CalendarEvent[]): void {}

/** @deprecated use hasPersonalizedCalendarAsync */
export function hasPersonalizedCalendar(): boolean {
  return false;
}
