"use client";

import { Header } from "@/components/Header";
import { MonthlyReviewPanel } from "@/components/review/MonthlyReviewPanel";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function ReviewPage() {
  const { t } = useLocale();

  return (
    <main className="pb-28 lg:pb-8">
      <Header title={t("review.title")} subtitle={t("review.subtitle", { month: new Date().toISOString().slice(0, 7) })} />
      <div className="px-5 lg:px-8 max-w-4xl">
        <MonthlyReviewPanel />
      </div>
    </main>
  );
}
