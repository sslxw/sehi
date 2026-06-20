"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export function Header({ title, subtitle, compact }: HeaderProps) {
  const today = new Date();

  return (
    <header
      className={cn(
        "shrink-0 px-5 lg:px-8",
        compact ? "pt-12 pb-2 lg:pt-8 lg:pb-4" : "pt-12 pb-4 lg:pt-8 lg:pb-6"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
            {format(today, "EEEE, MMM d")}
          </p>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight mt-0.5">
            {title || "Good morning"}
          </h1>
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
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-white/10 flex items-center justify-center lg:hidden shrink-0">
          <span className="text-sm font-semibold text-emerald-300">S</span>
        </div>
      </div>
    </header>
  );
}
