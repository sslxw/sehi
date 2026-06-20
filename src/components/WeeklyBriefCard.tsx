"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Target } from "lucide-react";
import type { WeeklyBrief } from "@/lib/weekly-brief";

export function WeeklyBriefCard({ brief }: { brief: WeeklyBrief }) {
  const strainPct = Math.min(100, (brief.strainActual / brief.strainTarget) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 border border-cyan-500/10"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
          <Target className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{brief.weekLabel}</p>
          <h3 className="text-sm font-semibold text-zinc-100">{brief.headline}</h3>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white/[0.03] rounded-xl p-3 text-center">
          <p className="text-[10px] text-zinc-500">Recovery</p>
          <p className="text-lg font-semibold text-emerald-400">{brief.recoveryAvg}%</p>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-3 text-center">
          <p className="text-[10px] text-zinc-500">Sleep</p>
          <p className="text-lg font-semibold text-violet-400">{brief.sleepAvg}h</p>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-3 text-center">
          <p className="text-[10px] text-zinc-500">Strain</p>
          <p className="text-lg font-semibold text-sky-400">{brief.strainActual}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
          <span>Weekly strain vs target ({brief.strainTarget})</span>
          <span>{Math.round(strainPct)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-sky-500 transition-all"
            style={{ width: `${strainPct}%` }}
          />
        </div>
      </div>

      {brief.wins.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Wins</p>
          <ul className="space-y-1.5">
            {brief.wins.map((w) => (
              <li key={w} className="flex items-start gap-2 text-xs text-zinc-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {brief.risks.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Watch</p>
          <ul className="space-y-1.5">
            {brief.risks.map((r) => (
              <li key={r} className="flex items-start gap-2 text-xs text-zinc-400">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-3 py-2.5">
        <p className="text-[10px] text-cyan-400 uppercase tracking-wider mb-0.5">This week&apos;s focus</p>
        <p className="text-sm text-cyan-100/90">{brief.focus}</p>
      </div>
    </motion.div>
  );
}
