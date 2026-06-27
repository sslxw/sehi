"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

export function BackToEnterpriseLink() {
  const { t } = useLocale();

  return (
    <Link
      href="/enterprise"
      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 mb-6 transition-colors"
    >
      <ArrowLeft className="w-3.5 h-3.5 rtl-flip" />
      {t("common.backToEnterprise")}
    </Link>
  );
}
