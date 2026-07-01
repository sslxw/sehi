"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SehiLogo } from "@/components/SehiLogo";
import { useLocale } from "@/components/providers/LocaleProvider";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();

  return (
    <div className="min-h-dvh ambient-bg flex flex-col items-center justify-center px-5 py-10">
      <div className="absolute top-5 end-5">
        <LanguageSwitcher />
      </div>
      <Link href="/" className="mb-8">
        <SehiLogo size="lg" showWordmark tagline={t("brand.tagline")} />
      </Link>
      {children}
    </div>
  );
}
