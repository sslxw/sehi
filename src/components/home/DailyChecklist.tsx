"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ChevronRight, Flame } from "lucide-react";
import {
  checklistProgress,
  loadChecklistStreakAsync,
  loadDailyChecklistAsync,
  saveDailyChecklistAsync,
  toggleChecklistItem,
  type DailyChecklist,
} from "@/lib/daily-checklist";
import { fetchUserProfile } from "@/lib/user-profile";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  habits: "border-emerald-500/20 bg-emerald-500/5",
  training: "border-orange-500/20 bg-orange-500/5",
  nutrition: "border-amber-500/20 bg-amber-500/5",
  recovery: "border-violet-500/20 bg-violet-500/5",
  tracking: "border-cyan-500/20 bg-cyan-500/5",
};

export function DailyChecklist() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [checklist, setChecklist] = useState<DailyChecklist | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const trainingDays = 3;
    if (user) {
      fetchUserProfile(user.userId).then((profile) => {
        const days = profile?.trainingDaysPerWeek ?? 3;
        loadDailyChecklistAsync(user.userId, undefined, days).then(setChecklist);
      });
    } else {
      loadDailyChecklistAsync(null, undefined, trainingDays).then(setChecklist);
    }
    loadChecklistStreakAsync(user?.userId).then(setStreak);
  }, [user]);

  const toggle = useCallback(
    (itemId: string) => {
      if (!checklist) return;
      const next = toggleChecklistItem(checklist, itemId);
      setChecklist(next);
      saveDailyChecklistAsync(next, user?.userId);
      loadChecklistStreakAsync(user?.userId).then(setStreak);
    },
    [checklist, user?.userId]
  );

  if (!checklist) return null;

  const { completed, total, pct } = checklistProgress(checklist);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 border border-white/[0.06]"
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">{t("checklist.title")}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t("checklist.progress", { completed, total })}
          </p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
            <Flame className="w-3.5 h-3.5" />
            {t("checklist.streak", { count: streak })}
          </div>
        )}
      </div>

      <div className="h-1.5 bg-white/[0.06] rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <ul className="space-y-2">
        {checklist.items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-start transition-colors",
                categoryColors[item.category],
                item.completed && "opacity-60"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                  item.completed
                    ? "bg-emerald-500/30 border-emerald-500/50"
                    : "border-white/20 bg-white/[0.03]"
                )}
              >
                {item.completed && <Check className="w-3 h-3 text-emerald-400" />}
              </div>
              <span
                className={cn(
                  "flex-1 text-sm",
                  item.completed ? "text-zinc-500 line-through" : "text-zinc-200"
                )}
              >
                {t(item.labelKey)}
              </span>
              {item.linkedHref && !item.completed && (
                <Link
                  href={item.linkedHref}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 text-zinc-600 hover:text-cyan-400 shrink-0"
                >
                  <ChevronRight className="w-4 h-4 rtl-flip" />
                </Link>
              )}
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
