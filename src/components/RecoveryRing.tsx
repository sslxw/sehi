"use client";

import { motion } from "framer-motion";
import { cn, getScoreColor } from "@/lib/utils";

interface RecoveryRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  type?: "recovery" | "strain" | "sleep";
}

export function RecoveryRing({
  score,
  size = 200,
  strokeWidth = 12,
  label = "Recovery",
  sublabel,
  type = "recovery",
}: RecoveryRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = getScoreColor(score, type);
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 12px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-5xl font-semibold tracking-tight"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {Math.round(score)}
          <span className="text-2xl font-normal opacity-60">%</span>
        </motion.span>
        <span className="text-sm text-zinc-400 mt-1">{label}</span>
        {sublabel && (
          <span className="text-xs text-zinc-500 mt-0.5">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
