"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import type { FoodEntry } from "@/lib/food";
import { mealTypeLabels } from "@/lib/food";
import { useLocale } from "@/components/providers/LocaleProvider";

interface FoodLogListProps {
  entries: FoodEntry[];
  onDelete: (id: string) => void;
}

export function FoodLogList({ entries, onDelete }: FoodLogListProps) {
  const { t } = useLocale();

  const mealLabel = (type: keyof typeof mealTypeLabels) => {
    const key = `meals.${type}` as const;
    return t(key);
  };

  if (entries.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-sm text-zinc-500">{t("food.emptyLog")}</p>
        <p className="text-xs text-zinc-600 mt-1">{t("food.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, i) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className="glass rounded-2xl p-4"
        >
          <div className="flex gap-3">
            {entry.imageUrl && (
              <img
                src={entry.imageUrl}
                alt={entry.name}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-100 truncate">{entry.name}</p>
                  <p className="text-xs text-zinc-500">
                    {mealLabel(entry.mealType)} · {entry.servingSize}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-600 hover:text-red-400 transition-colors shrink-0"
                  aria-label={t("common.delete")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <MacroPill label={`${Math.round(entry.macros.calories)} kcal`} color="#FBBF24" />
                <MacroPill label={`${Math.round(entry.macros.protein)}g P`} color="#34D399" />
                <MacroPill label={`${Math.round(entry.macros.carbs)}g C`} color="#60A5FA" />
                <MacroPill label={`${Math.round(entry.macros.fat)}g F`} color="#A78BFA" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function MacroPill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded-md"
      style={{ color, backgroundColor: `${color}15` }}
    >
      {label}
    </span>
  );
}
