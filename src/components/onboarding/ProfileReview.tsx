"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Pencil, Sparkles } from "lucide-react";
import type { OnboardingProfileDraft } from "@/lib/user-profile";
import { useLocale } from "@/components/providers/LocaleProvider";

interface ProfileReviewProps {
  profile: OnboardingProfileDraft;
  loading: boolean;
  onConfirm: (profile: OnboardingProfileDraft) => void;
  onBack: () => void;
}

export function ProfileReview({ profile, loading, onConfirm, onBack }: ProfileReviewProps) {
  const { t } = useLocale();
  const [draft, setDraft] = useState(profile);
  const [editing, setEditing] = useState(false);

  const updateField = <K extends keyof OnboardingProfileDraft>(
    key: K,
    value: OnboardingProfileDraft[K]
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 space-y-4 max-w-2xl w-full"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{t("onboarding.reviewTitle")}</h2>
          <p className="text-sm text-zinc-500 mt-1">{t("onboarding.reviewSubtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20"
        >
          <Pencil className="w-3.5 h-3.5" />
          {editing ? t("onboarding.doneEditing") : t("onboarding.edit")}
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <ReviewRow label={t("onboarding.fieldName")} value={draft.displayName} editing={editing}
          onChange={(v) => updateField("displayName", v)} />
        <ReviewRow label={t("onboarding.fieldGoals")} value={draft.primaryGoals.join(", ")} editing={editing}
          onChange={(v) => updateField("primaryGoals", v.split(",").map((s) => s.trim()).filter(Boolean))} />
        <ReviewRow label={t("onboarding.fieldActivity")} value={draft.activityLevel} editing={editing}
          onChange={(v) => updateField("activityLevel", v as OnboardingProfileDraft["activityLevel"])} />
        <ReviewRow label={t("onboarding.fieldSleep")} value={`${draft.sleepGoalHours}h`} editing={editing}
          onChange={(v) => updateField("sleepGoalHours", Number.parseFloat(v) || 8)} />
        <ReviewRow label={t("onboarding.fieldTraining")} value={`${draft.trainingDaysPerWeek} ${t("onboarding.daysWeek")}`} editing={editing}
          onChange={(v) => updateField("trainingDaysPerWeek", Number.parseInt(v, 10) || 3)} />
        <ReviewRow label={t("onboarding.fieldMeds")}
          value={draft.medications.length ? draft.medications.map((m) => m.name).join(", ") : t("onboarding.none")}
          editing={editing}
          onChange={(v) => updateField("medications", v ? v.split(",").map((name) => ({ name: name.trim() })) : [])} />
        {draft.bloodTestSummary && (
          <ReviewRow label={t("onboarding.fieldBlood")} value={draft.bloodTestSummary} editing={editing}
            onChange={(v) => updateField("bloodTestSummary", v)} multiline />
        )}
        <ReviewRow label={t("onboarding.fieldFocus")} value={draft.weeklyFocus} editing={editing}
          onChange={(v) => updateField("weeklyFocus", v)} multiline />
      </div>

      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 flex gap-3">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-xs text-zinc-400 leading-relaxed">{t("onboarding.setupPreview")}</p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex-1 py-3 rounded-xl glass text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-50"
        >
          {t("onboarding.backToChat")}
        </button>
        <button
          type="button"
          onClick={() => onConfirm(draft)}
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500/80 to-emerald-500/80 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {t("onboarding.confirmSetup")}
        </button>
      </div>
    </motion.div>
  );
}

function ReviewRow({
  label,
  value,
  editing,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-zinc-500 sm:w-36 shrink-0">{label}</span>
      {editing ? (
        multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 text-sm outline-none focus:border-cyan-500/40 resize-none"
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 text-sm outline-none focus:border-cyan-500/40"
          />
        )
      ) : (
        <span className="text-zinc-200 flex-1">{value}</span>
      )}
    </div>
  );
}
