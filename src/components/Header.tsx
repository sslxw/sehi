"use client";

import { format } from "date-fns";
import { arSA, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/LocaleProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getGreetingKey } from "@/lib/i18n";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export function Header({ title, subtitle, compact }: HeaderProps) {
  const { t, locale } = useLocale();
  const today = new Date();
  const dateLocale = locale === "ar-SA" ? arSA : enUS;
  const displayTitle = title ?? t(getGreetingKey());

  return (
    <header
      className={cn(
        "shrink-0 px-5 lg:px-8",
        compact ? "pt-12 pb-2 lg:pt-8 lg:pb-4" : "pt-12 pb-4 lg:pt-8 lg:pb-6"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
            {format(today, "EEEE, MMM d", { locale: dateLocale })}
          </p>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight mt-0.5">{displayTitle}</h1>
          {subtitle && (
            <p
              className={cn(
                "text-zinc-400 mt-1",
                compact ? "text-xs line-clamp-2 lg:line-clamp-none lg:text-sm" : "text-sm"
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="lg:hidden">
            <LanguageSwitcher />
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-white/10 flex items-center justify-center lg:hidden">
            <span className="text-sm font-semibold text-emerald-300">S</span>
          </div>
        </div>
      </div>
    </header>
  );
}
