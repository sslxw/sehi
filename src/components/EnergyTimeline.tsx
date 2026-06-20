"use client";

import { motion } from "framer-motion";
import type { EnergyPoint, TrainingWindow } from "@/lib/energy";

const zoneColors = {
  peak: "#34D399",
  steady: "#22D3EE",
  dip: "#FBBF24",
  "wind-down": "#A78BFA",
};

interface EnergyTimelineProps {
  timeline: EnergyPoint[];
  trainingWindow: TrainingWindow;
}

export function EnergyTimeline({ timeline, trainingWindow }: EnergyTimelineProps) {
  const maxEnergy = 100;
  const height = 100;

  const points = timeline.map((p, i) => {
    const x = (i / (timeline.length - 1)) * 100;
    const y = height - (p.energy / maxEnergy) * height;
    return { x, y, ...p };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const currentHour = new Date().getHours();
  const currentPoint = timeline.find((p) => p.hour <= currentHour && currentHour < p.hour + 2);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Energy Timeline</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Predicted energy through the day</p>
        </div>
        {currentPoint && (
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 uppercase">Now</p>
            <p className="text-sm font-semibold" style={{ color: zoneColors[currentPoint.zone] }}>
              {currentPoint.energy}%
            </p>
          </div>
        )}
      </div>

      <svg viewBox={`0 0 100 ${height}`} className="w-full h-24" preserveAspectRatio="none">
        <defs>
          <linearGradient id="energy-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${pathD} L 100 ${height} L 0 ${height} Z`}
          fill="url(#energy-grad)"
        />
        <motion.path
          d={pathD}
          fill="none"
          stroke="#22D3EE"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2 }}
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2"
            fill={zoneColors[p.zone]}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <div className="flex justify-between mt-2 px-1">
        {timeline.map((p) => (
          <span key={p.hour} className="text-[9px] text-zinc-600">{p.label}</span>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">⏱</span>
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Best training window</p>
          <p className="text-sm font-semibold text-emerald-300">{trainingWindow.label}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{trainingWindow.reason}</p>
        </div>
      </div>
    </div>
  );
}
