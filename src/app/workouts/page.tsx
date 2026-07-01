"use client";

import { Header } from "@/components/Header";
import { WorkoutLogger } from "@/components/workouts/WorkoutLogger";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function WorkoutsPage() {
  const { t } = useLocale();

  return (
    <main className="pb-28 lg:pb-8">
      <Header title={t("workouts.title")} subtitle={t("workouts.subtitle")} />
      <div className="px-5 lg:px-8 max-w-2xl">
        <WorkoutLogger />
      </div>
    </main>
  );
}
