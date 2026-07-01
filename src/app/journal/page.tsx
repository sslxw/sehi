"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { JournalCheckIn } from "@/components/JournalCheckIn";
import { getTodayJournalAsync, createDefaultJournalEntry, type JournalEntry } from "@/lib/journal";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function JournalPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [entry, setEntry] = useState<JournalEntry>(createDefaultJournalEntry());

  useEffect(() => {
    getTodayJournalAsync(user?.userId).then(setEntry);
  }, [user?.userId]);

  return (
    <main className="pb-28 lg:pb-0">
      <Header title={t("journal.title")} subtitle={t("journal.subtitle")} />
      <div className="px-5 lg:px-8 max-w-2xl">
        <JournalCheckIn initialEntry={entry} />
      </div>
    </main>
  );
}
