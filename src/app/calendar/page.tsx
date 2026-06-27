"use client";

import { Header } from "@/components/Header";
import { CalendarView } from "@/components/CalendarView";
import { calendarEvents } from "@/lib/whoop-data";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function CalendarPage() {
  const { t } = useLocale();

  return (
    <main className="pb-28 lg:pb-0">
      <Header title={t("calendar.title")} subtitle={t("calendar.subtitle")} />
      <div className="px-5 lg:px-8 max-w-4xl">
        <CalendarView events={calendarEvents} />
      </div>
    </main>
  );
}
