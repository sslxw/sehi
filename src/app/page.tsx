"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { SehiScoreRing, SehiScoreBreakdown } from "@/components/SehiScoreRing";
import { MetricCard } from "@/components/MetricCard";
import { ActionCard } from "@/components/ActionCard";
import { EnergyTimeline } from "@/components/EnergyTimeline";
import { SleepDebtCard, StrainBudgetCard } from "@/components/SleepDebtCard";
import {
  mockDailyMetrics,
  pickTodayMetrics,
  pickYesterdayMetrics,
  generateInsights,
} from "@/lib/whoop-data";
import { getTodayJournalAsync, createDefaultJournalEntry, type JournalEntry } from "@/lib/journal";
import { calculateSehiScore } from "@/lib/sehi-score";
import {
  generateEnergyTimeline,
  getTrainingWindow,
  calculateSleepDebt,
} from "@/lib/energy";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useWhoop } from "@/components/providers/WhoopProvider";
import { DailyChecklist } from "@/components/home/DailyChecklist";
import { getGreetingKey, getScoreLabelKey, getSehiRecommendKey } from "@/lib/i18n";
import { useAuth } from "@/components/providers/AuthProvider";

export default function HomePage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const { today, yesterday, dailyMetrics, connected, configured, connect } = useWhoop();
  const [journal, setJournal] = useState<JournalEntry>(createDefaultJournalEntry());

  useEffect(() => {
    getTodayJournalAsync(user?.userId).then(setJournal);
  }, [user?.userId]);
  const sehi = calculateSehiScore(today, journal);
  const timeline = generateEnergyTimeline(today, journal);
  const trainingWindow = getTrainingWindow(today, timeline);
  const sleepDebt = calculateSleepDebt(dailyMetrics.slice(-7));
  const insights = generateInsights(today);

  const recoveryStatus = t(getScoreLabelKey(today.recovery, "recovery")).toLowerCase();
  const greeting = t(getGreetingKey());
  const recommendation = t(getSehiRecommendKey(sehi.score));

  return (
    <main className="pb-28 lg:pb-8">
      <Header
        title={greeting}
        subtitle={t("home.recoverySubtitle", { status: recoveryStatus })}
      />

      <div className="px-5 lg:px-8">
        {configured && !connected && (
          <button
            type="button"
            onClick={connect}
            className="w-full mb-4 glass rounded-xl px-4 py-3 text-start border border-cyan-500/20 hover:border-cyan-500/40 transition-colors lg:hidden"
          >
            <p className="text-xs font-medium text-cyan-300">{t("whoop.connect")}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{t("whoop.demoData")}</p>
          </button>
        )}
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
            <DailyChecklist />
            <EnergyTimeline timeline={timeline} trainingWindow={trainingWindow} />
            <p className="text-xs text-zinc-500 -mt-4 px-1">{recommendation}</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard
                label={t("metrics.recovery")}
                value={today.recovery}
                unit="%"
                type="recovery"
                score={today.recovery}
                trend={today.recovery > yesterday.recovery ? "up" : "down"}
                trendValue={`${today.recovery - yesterday.recovery > 0 ? "+" : ""}${today.recovery - yesterday.recovery}%`}
                delay={0.1}
              />
              <MetricCard
                label={t("metrics.strain")}
                value={today.strain.toFixed(1)}
                type="strain"
                score={Math.min(100, today.strain * 5)}
                trend={today.strain > yesterday.strain ? "up" : "down"}
                trendValue={`${Math.abs(today.strain - yesterday.strain).toFixed(1)} ${t("common.vsYesterday")}`}
                delay={0.15}
              />
              <MetricCard
                label={t("metrics.sleep")}
                value={today.sleep}
                unit="%"
                type="sleep"
                score={today.sleep}
                trend={today.sleepHours > 7 ? "up" : "down"}
                trendValue={`${today.sleepHours.toFixed(1)}h`}
                delay={0.2}
              />
              <MetricCard
                label={t("metrics.hrv")}
                value={today.hrv}
                unit="ms"
                type="recovery"
                trend={today.hrv > yesterday.hrv ? "up" : "down"}
                trendValue={`${today.hrv > yesterday.hrv ? "+" : ""}${today.hrv - yesterday.hrv}ms`}
                delay={0.25}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 gap-2">
                <h2 className="text-sm font-semibold text-zinc-300">{t("home.actionItems")}</h2>
                <div className="flex items-center gap-3">
                  <Link
                    href="/journal"
                    className="text-xs text-violet-400 flex items-center gap-1 hover:text-violet-300"
                  >
                    {t("common.logJournal")} <ArrowRight className="w-3 h-3 rtl-flip" />
                  </Link>
                  <Link
                    href="/coach"
                    className="text-xs text-cyan-400 flex items-center gap-1 hover:text-cyan-300"
                  >
                    {t("common.askCoach")} <ArrowRight className="w-3 h-3 rtl-flip" />
                  </Link>
                </div>
              </div>
              <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
                {insights.slice(0, 3).map((insight, i) => (
                  <ActionCard key={insight.id} insight={insight} index={i} metrics={today} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
