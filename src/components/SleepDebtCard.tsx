"use client";

import { motion } from "framer-motion";
import { Moon, TrendingDown, TrendingUp, Minus } from "lucide-react";

interface SleepDebtCardProps {
  debtHours: number;
  trend: "improving" | "worsening" | "stable";
  nightsShort: number;
}

export function SleepDebtCard({ debtHours, trend, nightsShort }: SleepDebtCardProps) {
  const TrendIcon =
    trend === "improving" ? TrendingUp : trend === "worsening" ? TrendingDown : Minus;
  const trendColor =
    trend === "improving" ? "#34D399" : trend === "worsening" ? "#F87171" : "#A1A1AA";

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
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Sleep debt</p>
            <p className="text-2xl font-semibold text-violet-300">
              {debtHours.toFixed(1)}
              <span className="text-sm font-normal text-zinc-500 ml-1">hrs</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1" style={{ color: trendColor }}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-xs font-medium capitalize">{trend}</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">{nightsShort} short nights (7d)</p>
        </div>
      </div>
      <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
        {debtHours > 3
          ? "Prioritize 8+ hours for 3 nights to clear debt. Skip late caffeine."
          : debtHours > 1
            ? "Mild debt — aim for consistent 8h sleep this week."
            : "Sleep bank is healthy. Maintain your routine."}
      </p>
    </motion.div>
  );
}

interface StrainBudgetCardProps {
  budget: number;
  currentStrain: number;
}

export function StrainBudgetCard({ budget, currentStrain }: StrainBudgetCardProps) {
  const remaining = Math.max(0, budget - currentStrain);
  const usedPct = Math.min(100, (currentStrain / budget) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Strain budget</p>
          <p className="text-lg font-semibold mt-0.5">
            <span className="text-sky-400">{remaining.toFixed(1)}</span>
            <span className="text-zinc-500 text-sm font-normal"> left today</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-500">Budget</p>
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
      <p className="text-xs text-zinc-500 mt-2">
        {remaining > 8
          ? "Room for a hard session — stay within budget for optimal recovery."
          : remaining > 4
            ? "Moderate training recommended — zone 2 or strength with control."
            : "Budget nearly used — light activity only."}
      </p>
    </motion.div>
  );
}
