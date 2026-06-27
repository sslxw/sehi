"use client";

import { Header } from "@/components/Header";
import { useLocale } from "@/components/providers/LocaleProvider";

export function CoachHeader() {
  const { t } = useLocale();
  return (
    <Header title={t("coach.title")} subtitle={t("coach.subtitle")} compact />
  );
}
