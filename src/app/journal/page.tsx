"use client";

import { Header } from "@/components/Header";
import { JournalCheckIn } from "@/components/JournalCheckIn";
import { getTodayJournal } from "@/lib/journal";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function JournalPage() {
  const { t } = useLocale();
  const entry = getTodayJournal();

  return (
    <main className="pb-28 lg:pb-0">
      <Header title={t("journal.title")} subtitle={t("journal.subtitle")} />
      <div className="px-5 lg:px-8 max-w-2xl">
        <JournalCheckIn initialEntry={entry} />
      </div>
    </main>
  );
}
