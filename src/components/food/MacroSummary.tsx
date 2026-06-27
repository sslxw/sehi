"use client";

import { motion } from "framer-motion";
import type { Macros, MacroTargets } from "@/lib/food";
import { macroPct } from "@/lib/food";
import { useLocale } from "@/components/providers/LocaleProvider";

interface MacroSummaryProps {
  totals: Macros;
  targets: MacroTargets;
}

const itemKeys = [
  { key: "calories" as const, labelKey: "metrics.calories", unit: "kcal", color: "#FBBF24" },
  { key: "protein" as const, labelKey: "metrics.protein", unit: "g", color: "#34D399" },
  { key: "carbs" as const, labelKey: "metrics.carbs", unit: "g", color: "#60A5FA" },
  { key: "fat" as const, labelKey: "metrics.fat", unit: "g", color: "#A78BFA" },
];

export function MacroSummary({ totals, targets }: MacroSummaryProps) {
  const { t } = useLocale();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {itemKeys.map((item, i) => {
        const current = totals[item.key];
        const target = targets[item.key];
        const pct = macroPct(current, target);

        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-4"
          >
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{t(item.labelKey)}</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-semibold" style={{ color: item.color }}>
                {Math.round(current)}
              </span>
              <span className="text-xs text-zinc-500">
                / {target}
                {item.unit === "kcal" ? "" : item.unit}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 mt-3 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: item.color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <p className="text-[10px] text-zinc-600 mt-1">{pct}% {t("common.ofGoal")}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
