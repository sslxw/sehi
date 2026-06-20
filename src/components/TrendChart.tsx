"use client";

import { motion } from "framer-motion";
import { dailyMetrics } from "@/lib/whoop-data";
import { getScoreColor } from "@/lib/utils";

interface TrendChartProps {
  metric: "recovery" | "strain" | "sleep" | "hrv";
  days?: number;
}

const metricConfig = {
  recovery: { label: "Recovery", color: "#34D399" },
  strain: { label: "Strain", color: "#60A5FA" },
  sleep: { label: "Sleep", color: "#A78BFA" },
  hrv: { label: "HRV", color: "#22D3EE" },
};

export function TrendChart({ metric, days = 14 }: TrendChartProps) {
  const data = dailyMetrics.slice(-days);
  const config = metricConfig[metric];
  const values = data.map((d) => (metric === "hrv" ? d.hrv : d[metric]));
  const max = Math.max(...values) * 1.1;
  const min = Math.min(...values) * 0.9;
  const range = max - min || 1;

  const width = 320;
  const height = 120;
  const padding = 4;

  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (width - padding * 2);
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return { x, y, v };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const latest = values[values.length - 1];
  const previous = values[values.length - 2];
  const change = latest - previous;
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">{config.label}</h3>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-semibold" style={{ color: config.color }}>
              {Math.round(latest)}
              {metric !== "hrv" && <span className="text-sm opacity-60">%</span>}
              {metric === "hrv" && <span className="text-sm opacity-60">ms</span>}
            </span>
            <span
              className={`text-xs font-medium ${
                change > 0 ? "text-emerald-400" : change < 0 ? "text-red-400" : "text-zinc-500"
              }`}
            >
              {change > 0 ? "+" : ""}
              {Math.round(change)}
              {metric !== "hrv" ? "%" : "ms"}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{days}-day avg</p>
          <p className="text-sm font-medium text-zinc-400">
            {avg}
            {metric !== "hrv" ? "%" : "ms"}
          </p>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={config.color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={config.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={areaD}
          fill={`url(#grad-${metric})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        />
        <motion.path
          d={pathD}
          fill="none"
          stroke={config.color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        {points.length > 0 && (
          <motion.circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="4"
            fill={config.color}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 }}
            style={{ filter: `drop-shadow(0 0 6px ${config.color}60)` }}
          />
        )}
      </svg>
    </motion.div>
  );
}

export function WeeklySummary() {
  const last7 = dailyMetrics.slice(-7);
  const avgRecovery = Math.round(last7.reduce((s, d) => s + d.recovery, 0) / 7);
  const totalStrain = last7.reduce((s, d) => s + d.strain, 0).toFixed(1);
  const avgSleep = (last7.reduce((s, d) => s + d.sleepHours, 0) / 7).toFixed(1);

  const stats = [
    { label: "Avg Recovery", value: `${avgRecovery}%`, color: getScoreColor(avgRecovery, "recovery") },
    { label: "Weekly Strain", value: totalStrain, color: "#60A5FA" },
    { label: "Avg Sleep", value: `${avgSleep}h`, color: "#A78BFA" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass rounded-xl p-3 text-center"
        >
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{stat.label}</p>
          <p className="text-lg font-semibold mt-1" style={{ color: stat.color }}>
            {stat.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
