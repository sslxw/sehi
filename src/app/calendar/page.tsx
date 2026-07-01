"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { CalendarView } from "@/components/CalendarView";
import { loadCalendarEventsAsync } from "@/lib/calendar-store";
import type { CalendarEvent } from "@/lib/whoop-data";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function CalendarPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    loadCalendarEventsAsync(user?.userId).then(setEvents);
  }, [user?.userId]);

  return (
    <main className="pb-28 lg:pb-0">
      <Header title={t("calendar.title")} subtitle={t("calendar.subtitle")} />
      <div className="px-5 lg:px-8 max-w-4xl">
        <CalendarView events={events} />
      </div>
    </main>
  );
}
