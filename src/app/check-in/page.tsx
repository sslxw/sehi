"use client";

import { Header } from "@/components/Header";
import { WeeklyCheckInForm } from "@/components/checkin/WeeklyCheckInForm";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function CheckInPage() {
  const { t } = useLocale();

  return (
    <main className="pb-28 lg:pb-8">
      <Header title={t("checkin.title")} subtitle={t("checkin.subtitle")} />
      <div className="px-5 lg:px-8 max-w-2xl">
        <WeeklyCheckInForm />
      </div>
    </main>
  );
}
