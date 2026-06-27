"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  const options: { value: Locale; label: string }[] = [
    { value: "en", label: t("lang.en") },
    { value: "ar-SA", label: t("lang.ar") },
  ];

  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]",
        className
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setLocale(opt.value)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            locale === opt.value
              ? "bg-white/10 text-white"
              : "text-zinc-500 hover:text-zinc-300"
          )}
          aria-pressed={locale === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
