"use client";

import { motion } from "framer-motion";
import type { WorkCapacity } from "@/lib/enterprise";
import { scheduleTypeColors } from "@/lib/enterprise";
import { cn } from "@/lib/utils";

export function WorkCapacityBadge({
  capacity,
  size = "md",
}: {
  capacity: WorkCapacity;
  size?: "sm" | "md";
}) {
  const color = scheduleTypeColors[capacity.scheduleType];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-full border",
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"
      )}
      style={{
        color,
        backgroundColor: `${color}12`,
        borderColor: `${color}30`,
      }}
    >
      {capacity.recommendedHours}h · {capacity.label}
    </span>
  );
}

export function WorkHoursBar({
  recommended,
  baseline,
  color,
}: {
  recommended: number;
  baseline: number;
  color: string;
}) {
  const pct = baseline > 0 ? Math.min(100, (recommended / baseline) * 100) : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
      <span className="text-xs text-zinc-400 tabular-nums">
        {recommended}/{baseline}h
      </span>
    </div>
  );
}
