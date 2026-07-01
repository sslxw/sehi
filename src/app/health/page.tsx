"use client";

import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { MedicationsComingSoon } from "@/components/health/MedicationsComingSoon";
import { BloodTestUploader } from "@/components/health/BloodTestUploader";
import { BloodTestList } from "@/components/health/BloodTestList";
import type { BloodTestEntry } from "@/lib/blood-test";
import { loadBloodTestsAsync, saveBloodTestsAsync } from "@/lib/blood-test";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useAuth } from "@/components/providers/AuthProvider";

export default function HealthPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [entries, setEntries] = useState<BloodTestEntry[]>([]);

  useEffect(() => {
    loadBloodTestsAsync(user?.userId).then(setEntries);
  }, [user?.userId]);

  const persist = useCallback(
    (next: BloodTestEntry[]) => {
      setEntries(next);
      saveBloodTestsAsync(next, user?.userId);
    },
    [user?.userId]
  );

  const handleSave = (entry: Omit<BloodTestEntry, "id" | "uploadedAt">) => {
    persist([
      {
        ...entry,
        id: crypto.randomUUID(),
        uploadedAt: new Date().toISOString(),
      },
      ...entries,
    ]);
  };

  const handleDelete = (id: string) => {
    persist(entries.filter((e) => e.id !== id));
  };

  return (
    <main className="pb-28 lg:pb-8 overflow-y-auto">
      <Header title={t("health.title")} subtitle={t("health.subtitle")} />
      <div className="px-5 lg:px-8 space-y-6 max-w-3xl lg:max-w-none">
        <MedicationsComingSoon />
        <BloodTestUploader onSave={handleSave} />
        <div>
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">
            {t("health.savedReports")} ({entries.length})
          </h2>
          <BloodTestList entries={entries} onDelete={handleDelete} />
        </div>
      </div>
    </main>
  );
}
