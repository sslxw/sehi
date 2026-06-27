"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Employee, WorkCapacity } from "@/lib/enterprise";
import { scheduleTypeColors } from "@/lib/enterprise";
import { translateCapacity, translateMeetingLoad } from "@/lib/enterprise-i18n";
import { WorkCapacityBadge } from "./WorkCapacityBadge";
import { MetricCard } from "@/components/MetricCard";
import { AlertTriangle, Mail, Briefcase } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

interface EmployeeDetailProps {
  employee: Employee;
  capacity: WorkCapacity;
}

export function EmployeeDetailView({ employee, capacity }: EmployeeDetailProps) {
  const { t } = useLocale();
  const localized = useMemo(() => translateCapacity(capacity, t), [capacity, t]);
  const color = scheduleTypeColors[localized.scheduleType];
  const metrics = employee.metrics;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-semibold"
            style={{
              backgroundColor: `${employee.avatarColor}20`,
              color: employee.avatarColor,
            }}
          >
            {employee.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold">{employee.name}</h2>
              {employee.status === "at_risk" && (
                <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <AlertTriangle className="w-3 h-3" /> {t("enterprise.atRiskBadge")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> {employee.role}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {employee.email}
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-1">{employee.team}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 border"
        style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
              {t("enterprise.recommendedWork")}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-semibold" style={{ color }}>
                {localized.recommendedHours}
              </span>
              <span className="text-lg text-zinc-500">{t("common.hours")}</span>
              <span className="text-sm text-zinc-600">
                {t("enterprise.baselineHours", { hours: localized.baselineHours })}
              </span>
            </div>
          </div>
          <WorkCapacityBadge capacity={localized} />
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed mb-4">{localized.guidance}</p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/[0.03] rounded-xl p-3">
            <p className="text-[10px] text-zinc-500">{t("enterprise.meetings")}</p>
            <p className="text-sm font-semibold text-zinc-200 capitalize mt-0.5">
              {translateMeetingLoad(localized.meetingLoad, t)}
            </p>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-3">
            <p className="text-[10px] text-zinc-500">{t("enterprise.deepWorkBlocks")}</p>
            <p className="text-sm font-semibold text-zinc-200 mt-0.5">
              {localized.deepWorkBlocks}
            </p>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-3">
            <p className="text-[10px] text-zinc-500">{t("metrics.sehiScore")}</p>
            <p className="text-sm font-semibold text-cyan-400 mt-0.5">{localized.sehiScore}</p>
          </div>
        </div>

        {localized.flags.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{t("common.flags")}</p>
            {localized.flags.map((flag) => (
              <div
                key={flag}
                className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2"
              >
                {flag}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">{t("enterprise.biometricsToday")}</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label={t("metrics.recovery")}
            value={metrics.recovery}
            unit="%"
            type="recovery"
            score={metrics.recovery}
          />
          <MetricCard
            label={t("metrics.sleep")}
            value={metrics.sleep}
            unit="%"
            type="sleep"
            score={metrics.sleep}
          />
          <MetricCard
            label={t("metrics.hrv")}
            value={metrics.hrv}
            unit="ms"
            type="recovery"
          />
          <MetricCard
            label={t("metrics.strain")}
            value={metrics.strain.toFixed(1)}
            type="strain"
          />
        </div>
      </div>

      {employee.consecutiveLowRecovery > 0 && (
        <div className="glass rounded-2xl p-4 border border-amber-500/20 bg-amber-500/5">
          <p className="text-sm font-medium text-amber-300">
            {t("enterprise.burnoutWarning", { days: employee.consecutiveLowRecovery })}
          </p>
          <p className="text-xs text-zinc-400 mt-1">{t("enterprise.burnoutHint")}</p>
        </div>
      )}
    </div>
  );
}
