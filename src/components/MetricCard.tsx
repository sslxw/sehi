"use client";

import { motion } from "framer-motion";
import { cn, getScoreColor, getScoreLabel } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  type: "recovery" | "strain" | "sleep";
  score?: number;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  delay?: number;
}

export function MetricCard({
  label,
  value,
  unit,
  type,
  score,
  trend,
  trendValue,
  delay = 0,
}: MetricCardProps) {
  const color = score !== undefined ? getScoreColor(score, type) : undefined;
  const statusLabel = score !== undefined ? getScoreLabel(score, type) : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass glass-hover rounded-2xl p-4 flex flex-col gap-2 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          {label}
        </span>
        {statusLabel && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              color: color,
              backgroundColor: `${color}15`,
            }}
          >
            {statusLabel}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        {unit && <span className="text-sm text-zinc-500">{unit}</span>}
      </div>
      {score !== undefined && (
        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ delay: delay + 0.3, duration: 0.8 }}
          />
        </div>
      )}
      {trend && trendValue && (
        <span
          className={cn(
            "text-xs",
            trend === "up" && "text-emerald-400",
            trend === "down" && "text-red-400",
            trend === "stable" && "text-zinc-500"
          )}
        >
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
        </span>
      )}
    </motion.div>
  );
}
