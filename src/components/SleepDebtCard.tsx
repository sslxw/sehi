"use client";

import { motion } from "framer-motion";
import { Moon, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

interface SleepDebtCardProps {
  debtHours: number;
  trend: "improving" | "worsening" | "stable";
  nightsShort: number;
}

export function SleepDebtCard({ debtHours, trend, nightsShort }: SleepDebtCardProps) {
  const { t } = useLocale();
  const TrendIcon =
    trend === "improving" ? TrendingUp : trend === "worsening" ? TrendingDown : Minus;
  const trendColor =
    trend === "improving" ? "#34D399" : trend === "worsening" ? "#F87171" : "#A1A1AA";

  const hint =
    debtHours > 3
      ? t("sleepDebt.highDebt")
      : debtHours > 1
        ? t("sleepDebt.mildDebt")
        : t("sleepDebt.healthy");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Moon className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">{t("metrics.sleepDebt")}</p>
            <p className="text-2xl font-semibold text-violet-300">
              {debtHours.toFixed(1)}
              <span className="text-sm font-normal text-zinc-500 ms-1">hrs</span>
            </p>
          </div>
        </div>
        <div className="text-end">
          <div className="flex items-center gap-1 justify-end" style={{ color: trendColor }}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-xs font-medium">{t(`sleepDebt.${trend}`)}</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">
            {t("sleepDebt.shortNights", { count: nightsShort })}
          </p>
        </div>
      </div>
      <p className="text-xs text-zinc-500 mt-3 leading-relaxed">{hint}</p>
    </motion.div>
  );
}

interface StrainBudgetCardProps {
  budget: number;
  currentStrain: number;
}

export function StrainBudgetCard({ budget, currentStrain }: StrainBudgetCardProps) {
  const { t } = useLocale();
  const remaining = Math.max(0, budget - currentStrain);
  const usedPct = Math.min(100, (currentStrain / budget) * 100);

  const hint =
    remaining > 8
      ? t("strainBudget.roomHard")
      : remaining > 4
        ? t("strainBudget.moderate")
        : t("strainBudget.nearlyUsed");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">{t("metrics.strainBudget")}</p>
          <p className="text-lg font-semibold mt-0.5">
            <span className="text-sky-400">{remaining.toFixed(1)}</span>
            <span className="text-zinc-500 text-sm font-normal"> {t("metrics.leftToday")}</span>
          </p>
        </div>
        <div className="text-end">
          <p className="text-[10px] text-zinc-500">{t("metrics.budget")}</p>
          <p className="text-sm font-medium text-zinc-300">{budget.toFixed(1)}</p>
        </div>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-sky-500"
          initial={{ width: 0 }}
          animate={{ width: `${usedPct}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
      <p className="text-xs text-zinc-500 mt-2">{hint}</p>
    </motion.div>
  );
}
