"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { SehiScoreRing, SehiScoreBreakdown } from "@/components/SehiScoreRing";
import { MetricCard } from "@/components/MetricCard";
import { ActionCard } from "@/components/ActionCard";
import { EnergyTimeline } from "@/components/EnergyTimeline";
import { SleepDebtCard, StrainBudgetCard } from "@/components/SleepDebtCard";
import {
  dailyMetrics,
  getTodayMetrics,
  getYesterdayMetrics,
  generateInsights,
} from "@/lib/whoop-data";
import { getTodayJournal } from "@/lib/journal";
import { calculateSehiScore } from "@/lib/sehi-score";
import {
  generateEnergyTimeline,
  getTrainingWindow,
  calculateSleepDebt,
} from "@/lib/energy";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const today = getTodayMetrics();
  const yesterday = getYesterdayMetrics();
  const journal = getTodayJournal();
  const sehi = calculateSehiScore(today, journal);
  const timeline = generateEnergyTimeline(today, journal);
  const trainingWindow = getTrainingWindow(today, timeline);
  const sleepDebt = calculateSleepDebt(dailyMetrics.slice(-7));
  const insights = generateInsights(today);

  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  return (
    <main className="pb-28 lg:pb-0">
      <Header title={greeting} subtitle={sehi.recommendation} />

      <div className="px-5 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
          <div className="lg:col-span-4 space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center py-2 lg:py-0"
            >
              <SehiScoreRing breakdown={sehi} size={220} />
            </motion.div>

            <SehiScoreBreakdown breakdown={sehi} />
            <StrainBudgetCard budget={sehi.strainBudget} currentStrain={today.strain} />
            <SleepDebtCard
              debtHours={sleepDebt.debtHours}
              trend={sleepDebt.trend}
              nightsShort={sleepDebt.nightsShort}
            />
          </div>

          <div className="lg:col-span-8 space-y-6 mt-6 lg:mt-0">
            <EnergyTimeline timeline={timeline} trainingWindow={trainingWindow} />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard
                label="Recovery"
                value={today.recovery}
                unit="%"
                type="recovery"
                score={today.recovery}
                trend={today.recovery > yesterday.recovery ? "up" : "down"}
                trendValue={`${today.recovery - yesterday.recovery > 0 ? "+" : ""}${today.recovery - yesterday.recovery}%`}
                delay={0.1}
              />
              <MetricCard
                label="Strain"
                value={today.strain.toFixed(1)}
                type="strain"
                score={Math.min(100, today.strain * 5)}
                trend={today.strain > yesterday.strain ? "up" : "down"}
                trendValue={`${Math.abs(today.strain - yesterday.strain).toFixed(1)} vs yesterday`}
                delay={0.15}
              />
              <MetricCard
                label="Sleep"
                value={today.sleep}
                unit="%"
                type="sleep"
                score={today.sleep}
                trend={today.sleepHours > 7 ? "up" : "down"}
                trendValue={`${today.sleepHours.toFixed(1)}h`}
                delay={0.2}
              />
              <MetricCard
                label="HRV"
                value={today.hrv}
                unit="ms"
                type="recovery"
                trend={today.hrv > yesterday.hrv ? "up" : "down"}
                trendValue={`${today.hrv > yesterday.hrv ? "+" : ""}${today.hrv - yesterday.hrv}ms`}
                delay={0.25}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-zinc-300">Action Items</h2>
                <div className="flex items-center gap-3">
                  <Link
                    href="/journal"
                    className="text-xs text-violet-400 flex items-center gap-1 hover:text-violet-300"
                  >
                    Log journal <ArrowRight className="w-3 h-3" />
                  </Link>
                  <Link
                    href="/coach"
                    className="text-xs text-cyan-400 flex items-center gap-1 hover:text-cyan-300"
                  >
                    Ask Coach <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
              <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
                {insights.slice(0, 3).map((insight, i) => (
                  <ActionCard key={insight.id} insight={insight} index={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
