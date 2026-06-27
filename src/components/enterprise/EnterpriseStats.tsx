"use client";

import { motion } from "framer-motion";
import { Building2, Clock, Users, AlertTriangle, TrendingDown } from "lucide-react";
import type { EnterpriseSummary } from "@/lib/enterprise";
import { useLocale } from "@/components/providers/LocaleProvider";

export function EnterpriseStats({ summary }: { summary: EnterpriseSummary }) {
  const { t } = useLocale();
  const baselinePerEmployee = summary.baselineCapacityHours / summary.totalActive;

  const stats = [
    {
      label: t("enterprise.activeEmployees"),
      value: summary.totalActive,
      sub: `${summary.onLeave} ${t("enterprise.onLeave")}`,
      icon: Users,
      color: "#22D3EE",
    },
    {
      label: t("enterprise.teamSehiAvg"),
      value: `${summary.avgSehiScore}`,
      sub: t("enterprise.readinessScore"),
      icon: Building2,
      color: "#34D399",
    },
    {
      label: t("enterprise.avgWorkHours"),
      value: `${summary.avgRecommendedHours}h`,
      sub: t("enterprise.vsBaseline", { hours: baselinePerEmployee }),
      icon: Clock,
      color: "#A78BFA",
    },
    {
      label: t("enterprise.atRisk"),
      value: summary.atRisk + summary.restRecommended,
      sub: t("enterprise.restReduced", {
        rest: summary.restRecommended,
        reduced: summary.reducedLoad,
      }),
      icon: AlertTriangle,
      color: "#FBBF24",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color: stat.color }} />
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{stat.label}</p>
            </div>
            <p className="text-2xl font-semibold" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">{stat.sub}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

export function CapacityOverview({ summary }: { summary: EnterpriseSummary }) {
  const { t } = useLocale();
  const capacityPct = Math.round(
    (summary.totalCapacityHours / summary.baselineCapacityHours) * 100
  );
  const deficit = summary.baselineCapacityHours - summary.totalCapacityHours;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">{t("enterprise.teamCapacity")}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{t("enterprise.teamCapacityHint")}</p>
        </div>
        <div className="flex items-center gap-1 text-amber-400">
          {deficit > 0 && (
            <>
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs font-medium">
                {t("enterprise.vsBaselineDeficit", { hours: deficit.toFixed(1) })}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-semibold text-cyan-400">{summary.totalCapacityHours}</span>
        <span className="text-sm text-zinc-500">
          {t("enterprise.baselinePct", {
            hours: summary.baselineCapacityHours,
            pct: capacityPct,
          })}
        </span>
      </div>

      <div className="h-3 rounded-full bg-white/5 overflow-hidden mb-4">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
          initial={{ width: 0 }}
          animate={{ width: `${capacityPct}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {summary.teams.map((team) => (
          <div key={team.name} className="bg-white/[0.03] rounded-xl p-3">
            <p className="text-[10px] text-zinc-500 truncate">{team.name}</p>
            <p className="text-sm font-semibold text-zinc-200 mt-0.5">
              {t("enterprise.avgHoursLabel", { hours: team.avgHours })}
            </p>
            <p className="text-[10px] text-zinc-500">
              {t("metrics.sehiScore")} {team.avgSehi}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
