"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/LocaleProvider";

type LogoSize = "sm" | "md" | "lg";

const sizeMap: Record<LogoSize, { mark: number; word: string; tag: string }> = {
  sm: { mark: 28, word: "text-[15px]", tag: "text-[9px]" },
  md: { mark: 34, word: "text-lg", tag: "text-[10px]" },
  lg: { mark: 44, word: "text-2xl", tag: "text-xs" },
};

interface SehiLogoProps {
  size?: LogoSize;
  showWordmark?: boolean;
  tagline?: string;
  className?: string;
}

export function SehiLogoMark({ size = 34 }: { size?: number }) {
  const id = `sehi-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="6" y1="38" x2="38" y2="6" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2dd4bf" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="40" height="40" rx="13" fill="rgba(255,255,255,0.04)" />
      <path
        d="M12 28c4-10 8-14 10-14s6 4 10 14"
        stroke={`url(#${id}-g)`}
        strokeWidth="3.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22" cy="14" r="3" fill={`url(#${id}-g)`} />
    </svg>
  );
}

export function SehiLogo({ size = "md", showWordmark = false, tagline, className }: SehiLogoProps) {
  const { t } = useLocale();
  const { mark, word, tag } = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2 min-w-0", className)}>
      <SehiLogoMark size={mark} />
      {showWordmark && (
        <div className="min-w-0 leading-none">
          <p className={cn("font-semibold tracking-tight gradient-text", word)}>{t("brand.name")}</p>
          {tagline && (
            <p className={cn("text-zinc-500 uppercase tracking-[0.14em] mt-1 truncate font-medium", tag)}>
              {tagline}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
