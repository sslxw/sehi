"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Coffee,
  Droplets,
  Minus,
  Plus,
  Sparkles,
  Utensils,
  Wine,
} from "lucide-react";
import type { JournalEntry } from "@/lib/journal";
import { journalFactors, getJournalCorrelations } from "@/lib/journal";
import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

const factorKeys: Record<string, { label: string; impact: string }> = {
  alcohol: { label: "journal.alcohol", impact: "journal.impactAlcohol" },
  lateMeal: { label: "journal.lateMeal", impact: "journal.impactLateMeal" },
  highStress: { label: "journal.highStress", impact: "journal.impactStress" },
  caffeineLate: { label: "journal.lateCaffeine", impact: "journal.impactCaffeine" },
  mobility: { label: "journal.mobility", impact: "journal.impactMobility" },
  hydration: { label: "journal.hydration", impact: "journal.impactHydration" },
};

const correlationKeys: Record<string, { factor: string; impact: string }> = {
  Alcohol: { factor: "journal.alcohol", impact: "journal.corrAlcohol" },
  "Late meals": { factor: "journal.lateMeal", impact: "journal.corrLateMeal" },
  Mobility: { factor: "journal.mobility", impact: "journal.corrMobility" },
  Hydration: { factor: "journal.hydration", impact: "journal.corrHydration" },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  wine: Wine,
  utensils: Utensils,
  brain: Brain,
  coffee: Coffee,
  stretch: Sparkles,
  droplets: Droplets,
};

interface JournalCheckInProps {
  initialEntry: JournalEntry;
}

export function JournalCheckIn({ initialEntry }: JournalCheckInProps) {
  const { t } = useLocale();
  const [entry, setEntry] = useState(initialEntry);
  const correlations = getJournalCorrelations();

  const toggle = (key: keyof JournalEntry) => {
    if (key === "date" || key === "hydration") return;
    setEntry((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const adjustHydration = (delta: number) => {
    setEntry((prev) => ({
      ...prev,
      hydration: Math.max(0, Math.min(15, prev.hydration + delta)),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-1">{t("journal.checkIn")}</h3>
        <p className="text-xs text-zinc-500 mb-4">{t("journal.checkInHint")}</p>
        <div className="space-y-2">
          {journalFactors.map((factor, i) => {
            const Icon = iconMap[factor.icon] || Sparkles;
            const key = factor.id as keyof JournalEntry;
            const isToggle = factor.type === "toggle";
            const active = isToggle ? Boolean(entry[key]) : false;
            const keys = factorKeys[factor.id];

            return (
              <motion.div
                key={factor.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-colors",
                  isToggle && active
                    ? "bg-cyan-500/10 border-cyan-500/20"
                    : "bg-white/[0.02] border-white/[0.04]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-zinc-400" />
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      {keys ? t(keys.label) : factor.label}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {keys ? t(keys.impact) : factor.impact}
                    </p>
                  </div>
                </div>
                {isToggle ? (
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    className={cn(
                      "w-10 h-6 rounded-full transition-colors relative",
                      active ? "bg-cyan-500/30" : "bg-white/10"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                        active ? "translate-x-5 rtl:-translate-x-5" : "translate-x-1 rtl:translate-x-1"
                      )}
                    />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustHydration(-1)}
                      className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">{entry.hydration}</span>
                    <button
                      type="button"
                      onClick={() => adjustHydration(1)}
                      className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">{t("journal.correlations")}</h3>
        <div className="space-y-2">
          {correlations.map((c, i) => {
            const ck = correlationKeys[c.factor];
            return (
              <motion.div
                key={c.factor}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="glass rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-zinc-200">
                    {ck ? t(ck.factor) : c.factor}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-md",
                      c.confidence === "high"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    )}
                  >
                    {c.confidence === "high"
                      ? t("journal.confidenceHigh")
                      : t("journal.confidenceMedium")}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">{ck ? t(ck.impact) : c.impact}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
