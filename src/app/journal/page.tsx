import { Header } from "@/components/Header";
import { JournalCheckIn } from "@/components/JournalCheckIn";
import { getTodayJournal } from "@/lib/journal";

export default function JournalPage() {
  const entry = getTodayJournal();

  return (
    <main className="pb-28 lg:pb-0">
      <Header
        title="Journal"
        subtitle="Connect habits to your metrics — Sehi learns what moves your score"
      />
      <div className="px-5 lg:px-8 max-w-2xl">
        <JournalCheckIn initialEntry={entry} />
      </div>
    </main>
  );
}
