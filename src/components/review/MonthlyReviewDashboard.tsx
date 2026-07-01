"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Minus,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import type { MonthlyReviewDashboard, ReviewInsight } from "@/lib/monthly-review-types";
import { gradeColor } from "@/lib/monthly-review-types";
import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

interface MonthlyReviewDashboardViewProps {
  dashboard: MonthlyReviewDashboard;
}

export function MonthlyReviewDashboardView({ dashboard }: MonthlyReviewDashboardViewProps) {
  const { t } = useLocale();
  const color = gradeColor(dashboard.overallScore);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (dashboard.overallScore / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Hero score */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5 border border-violet-500/15 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 via-transparent to-fuchsia-500/5 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-32 h-32 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color }}>
                {dashboard.overallScore}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                {t("review.score")}
              </span>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-start">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2"
              style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}30` }}>
              <Sparkles className="w-3 h-3" />
              {dashboard.grade}
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{dashboard.headline}</p>
            <p className="text-xs text-zinc-600 mt-1">{dashboard.month}</p>
          </div>
        </div>
      </motion.div>

      {/* Scorecards grid */}
      {dashboard.scorecards.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {dashboard.scorecards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-4 border border-white/[0.04]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                  {card.label}
                </span>
                {card.trend && <TrendIcon trend={card.trend} />}
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-xl font-semibold text-zinc-100">{card.value}</span>
                {card.unit && <span className="text-xs text-zinc-500">{card.unit}</span>}
              </div>
              <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${card.score}%`,
                    backgroundColor: gradeColor(card.score),
                  }}
                />
              </div>
              {card.trendLabel && (
                <p className="text-[10px] text-zinc-600 mt-1.5">{card.trendLabel}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Wins + Watch */}
      <div className="grid sm:grid-cols-2 gap-3">
        <InsightColumn
          title={t("review.wins")}
          icon={CheckCircle2}
          iconColor="text-emerald-400"
          borderColor="border-emerald-500/15"
          items={dashboard.wins}
          emptyText={t("review.noWins")}
        />
        <InsightColumn
          title={t("review.watch")}
          icon={AlertTriangle}
          iconColor="text-amber-400"
          borderColor="border-amber-500/15"
          items={dashboard.watch}
          emptyText={t("review.noWatch")}
        />
      </div>

      {/* Trends */}
      {dashboard.trends.length > 0 && (
        <div className="glass rounded-2xl p-4 border border-cyan-500/10">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-zinc-200">{t("review.trends")}</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {dashboard.trends.map((item, i) => (
              <TrendPill key={i} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {dashboard.recommendations.length > 0 && (
        <div className="glass rounded-2xl p-4 border border-violet-500/10">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-zinc-200">{t("review.nextMonth")}</h3>
          </div>
          <div className="space-y-2">
            {dashboard.recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-white/[0.03] rounded-xl px-4 py-3 border border-white/[0.04]"
              >
                <PriorityDot priority={rec.priority} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-200">{rec.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{rec.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data gaps */}
      {dashboard.dataGaps && dashboard.dataGaps.length > 0 && (
        <div className="rounded-xl px-4 py-3 bg-zinc-500/10 border border-zinc-500/20">
          <p className="text-xs font-medium text-zinc-400 mb-2">{t("review.dataGaps")}</p>
          <ul className="space-y-1">
            {dashboard.dataGaps.map((gap, i) => (
              <li key={i} className="text-xs text-zinc-500 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-zinc-600 shrink-0" />
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TrendIcon({ trend }: { trend: "up" | "down" | "neutral" }) {
  if (trend === "up") return <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />;
  if (trend === "down") return <ArrowDown className="w-3.5 h-3.5 text-amber-400" />;
  return <Minus className="w-3.5 h-3.5 text-zinc-500" />;
}

function InsightColumn({
  title,
  icon: Icon,
  iconColor,
  borderColor,
  items,
  emptyText,
}: {
  title: string;
  icon: typeof CheckCircle2;
  iconColor: string;
  borderColor: string;
  items: ReviewInsight[];
  emptyText: string;
}) {
  return (
    <div className={cn("glass rounded-2xl p-4 border", borderColor)}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn("w-4 h-4", iconColor)} />
        <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-zinc-600">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="bg-white/[0.03] rounded-lg px-3 py-2.5 border border-white/[0.04]">
              <p className="text-xs font-medium text-zinc-300">{item.title}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{item.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TrendPill({ item }: { item: ReviewInsight }) {
  const colors = {
    positive: "border-emerald-500/20 bg-emerald-500/5",
    neutral: "border-zinc-500/20 bg-white/[0.02]",
    warning: "border-amber-500/20 bg-amber-500/5",
  };
  return (
    <div className={cn("rounded-xl px-3 py-2.5 border", colors[item.severity])}>
      <p className="text-xs font-medium text-zinc-300">{item.title}</p>
      <p className="text-[11px] text-zinc-500 mt-0.5">{item.detail}</p>
    </div>
  );
}

function PriorityDot({ priority }: { priority: "high" | "medium" | "low" }) {
  const colors = {
    high: "bg-red-400",
    medium: "bg-amber-400",
    low: "bg-zinc-500",
  };
  return <span className={cn("w-2 h-2 rounded-full shrink-0 mt-1.5", colors[priority])} />;
}
