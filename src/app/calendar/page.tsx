import { Header } from "@/components/Header";
import { CalendarView } from "@/components/CalendarView";
import { calendarEvents } from "@/lib/whoop-data";

export default function CalendarPage() {
  return (
    <main className="pb-28 lg:pb-0">
      <Header title="Calendar" subtitle="Plan around your recovery" />
      <div className="px-5 lg:px-8 max-w-4xl">
        <CalendarView events={calendarEvents} />
      </div>
    </main>
  );
}
