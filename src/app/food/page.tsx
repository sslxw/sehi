"use client";

import { Header } from "@/components/Header";
import { MacroSummary } from "@/components/food/MacroSummary";
import { FoodScanner } from "@/components/food/FoodScanner";
import { FoodLogList } from "@/components/food/FoodLogList";
import type { FoodEntry } from "@/lib/food";
import {
  loadFoodLog,
  saveFoodLog,
  loadTargets,
  getTodayEntries,
  sumMacros,
} from "@/lib/food";
import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function FoodPage() {
  const { t } = useLocale();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [targets] = useState(loadTargets);

  useEffect(() => {
    setEntries(loadFoodLog());
  }, []);

  const todayEntries = getTodayEntries(entries);
  const totals = sumMacros(todayEntries);

  const persist = useCallback((next: FoodEntry[]) => {
    setEntries(next);
    saveFoodLog(next);
  }, []);

  const handleSave = (entry: Omit<FoodEntry, "id" | "loggedAt">) => {
    persist([
      { ...entry, id: crypto.randomUUID(), loggedAt: new Date().toISOString() },
      ...entries,
    ]);
  };

  const handleDelete = (id: string) => {
    persist(entries.filter((e) => e.id !== id));
  };

  return (
    <main className="pb-28 lg:pb-8 overflow-y-auto">
      <Header title={t("food.title")} subtitle={t("food.subtitle")} />
      <div className="px-5 lg:px-8 space-y-6 max-w-3xl lg:max-w-none">
        <MacroSummary totals={totals} targets={targets} />
        <FoodScanner onSave={handleSave} />
        <div>
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">
            {t("food.todaysLog")} ({todayEntries.length})
          </h2>
          <FoodLogList entries={todayEntries} onDelete={handleDelete} />
        </div>
      </div>
    </main>
  );
}
