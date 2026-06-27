"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Droplets,
  Flame,
  HeartPulse,
  Moon,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ActionInsight, DailyMetrics } from "@/lib/whoop-data";
import { translateInsight } from "@/lib/i18n/insights";
import { useLocale } from "@/components/providers/LocaleProvider";

const iconMap: Record<string, LucideIcon> = {
  "heart-pulse": HeartPulse,
  activity: Activity,
  zap: Zap,
  moon: Moon,
  flame: Flame,
  droplets: Droplets,
};

const priorityStyles = {
  high: { border: "border-red-500/20", bg: "bg-red-500/5", dot: "bg-red-400" },
  medium: { border: "border-amber-500/20", bg: "bg-amber-500/5", dot: "bg-amber-400" },
  low: { border: "border-emerald-500/20", bg: "bg-emerald-500/5", dot: "bg-emerald-400" },
};

interface ActionCardProps {
  insight: ActionInsight;
  index: number;
  metrics?: DailyMetrics;
}

export function ActionCard({ insight, index, metrics }: ActionCardProps) {
  const { t } = useLocale();
  const Icon = iconMap[insight.icon] || Activity;
  const style = priorityStyles[insight.priority];
  const translated = translateInsight(insight, t, metrics);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.4 }}
      className={`glass rounded-2xl p-4 border ${style.border} ${style.bg}`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          <Icon className="w-5 h-5 text-zinc-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            <h3 className="text-sm font-semibold text-zinc-100">{translated.title}</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed mb-2">{translated.description}</p>
          <div className="flex items-start gap-2 bg-white/[0.03] rounded-xl px-3 py-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-cyan-300/90 leading-relaxed font-medium">{translated.action}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
