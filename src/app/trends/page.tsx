"use client";

import { Header } from "@/components/Header";
import { TrendChart, WeeklySummary } from "@/components/TrendChart";
import { WeeklyBriefCard } from "@/components/WeeklyBriefCard";
import { getWeeklyBrief } from "@/lib/weekly-brief";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useWhoop } from "@/components/providers/WhoopProvider";

export default function TrendsPage() {
  const { t } = useLocale();
  const { dailyMetrics } = useWhoop();
  const brief = getWeeklyBrief(t, dailyMetrics);

  return (
    <main className="pb-28 lg:pb-0">
      <Header title={t("trends.title")} subtitle={t("trends.subtitle")} />
      <div className="px-5 lg:px-8 space-y-6">
        <WeeklyBriefCard brief={brief} />
        <WeeklySummary />
        <div className="lg:grid lg:grid-cols-2 lg:gap-4 space-y-4 lg:space-y-0">
          <TrendChart metric="recovery" />
          <TrendChart metric="strain" />
          <TrendChart metric="sleep" />
          <TrendChart metric="hrv" />
        </div>
      </div>
    </main>
  );
}
