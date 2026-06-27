"use client";

import { motion } from "framer-motion";
import { Bell, Clock, Pill, ShieldAlert } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

export function MedicationsComingSoon() {
  const { t } = useLocale();

  const features = [
    { icon: Pill, label: t("health.medFeatureTrack") },
    { icon: Clock, label: t("health.medFeatureReminders") },
    { icon: ShieldAlert, label: t("health.medFeatureInteractions") },
    { icon: Bell, label: t("health.medFeatureCoach") },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 border border-violet-500/10 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />

      <div className="relative flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <Pill className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">{t("health.medicationsTitle")}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{t("health.medicationsSubtitle")}</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25 shrink-0">
          {t("common.comingSoon")}
        </span>
      </div>

      <p className="relative text-sm text-zinc-400 leading-relaxed mb-4">
        {t("health.medicationsDesc")}
      </p>

      <div className="relative grid grid-cols-2 gap-2">
        {features.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 bg-white/[0.03] rounded-xl px-3 py-2.5 border border-white/[0.04]"
          >
            <Icon className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span className="text-xs text-zinc-500">{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
