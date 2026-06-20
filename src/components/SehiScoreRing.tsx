"use client";

import { motion } from "framer-motion";
import { getSehiScoreColor } from "@/lib/sehi-score";
import type { SehiScoreBreakdown } from "@/lib/sehi-score";

interface SehiScoreRingProps {
  breakdown: SehiScoreBreakdown;
  size?: number;
}

export function SehiScoreRing({ breakdown, size = 220 }: SehiScoreRingProps) {
  const { score, label } = breakdown;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = getSehiScoreColor(score);
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
          style={{ filter: `drop-shadow(0 0 16px ${color}50)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
          Sehi Score
        </span>
        <motion.span
          className="text-5xl font-semibold tracking-tight"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {score}
        </motion.span>
        <span className="text-sm font-medium mt-1" style={{ color }}>
          {label}
        </span>
      </div>
    </div>
  );
}

export function SehiScoreBreakdown({ breakdown }: { breakdown: SehiScoreBreakdown }) {
  const items = [
    { label: "Recovery", value: breakdown.recovery, color: "#34D399" },
    { label: "Sleep", value: breakdown.sleep, color: "#A78BFA" },
    { label: "Load balance", value: breakdown.loadBalance, color: "#60A5FA" },
    { label: "Lifestyle", value: breakdown.lifestyle, color: "#22D3EE" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + i * 0.05 }}
          className="glass rounded-xl p-3"
        >
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{item.label}</p>
          <p className="text-lg font-semibold mt-0.5" style={{ color: item.color }}>
            {item.value}%
          </p>
          <div className="h-1 rounded-full bg-white/5 mt-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${item.value}%`, backgroundColor: item.color }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
