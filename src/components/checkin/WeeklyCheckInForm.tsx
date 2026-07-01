"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Ruler, Save, Scale, TrendingDown, TrendingUp } from "lucide-react";
import {
  formatCheckInForReview,
  getCurrentWeekCheckIn,
  getWeekStart,
  loadWeeklyCheckInsAsync,
  saveWeeklyCheckInsAsync,
  upsertWeeklyCheckIn,
  waistTrend,
  weightTrend,
  type WeeklyCheckIn,
} from "@/lib/weekly-checkin";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useAuth } from "@/components/providers/AuthProvider";

export function WeeklyCheckInForm() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [entries, setEntries] = useState<WeeklyCheckIn[]>([]);
  const [weightKg, setWeightKg] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [chestCm, setChestCm] = useState("");
  const [bodyFatPct, setBodyFatPct] = useState("");
  const [energyScore, setEnergyScore] = useState(7);
  const [stressScore, setStressScore] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(7);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const weekStart = getWeekStart();

  useEffect(() => {
    loadWeeklyCheckInsAsync(user?.userId).then((loaded) => {
      setEntries(loaded);
      const current = getCurrentWeekCheckIn(loaded);
      if (current) {
        setWeightKg(current.weightKg?.toString() ?? "");
        setWaistCm(current.waistCm?.toString() ?? "");
        setChestCm(current.chestCm?.toString() ?? "");
        setBodyFatPct(current.bodyFatPct?.toString() ?? "");
        setEnergyScore(current.energyScore ?? 7);
        setStressScore(current.stressScore ?? 5);
        setSleepQuality(current.sleepQuality ?? 7);
        setNotes(current.notes ?? "");
      }
    });
  }, [user?.userId]);

  const persist = useCallback(
    (next: WeeklyCheckIn[]) => {
      setEntries(next);
      saveWeeklyCheckInsAsync(next, user?.userId);
    },
    [user?.userId]
  );

  const handleSave = () => {
    const next = upsertWeeklyCheckIn(entries, {
      weekStart,
      weightKg: weightKg ? Number.parseFloat(weightKg) : undefined,
      waistCm: waistCm ? Number.parseFloat(waistCm) : undefined,
      chestCm: chestCm ? Number.parseFloat(chestCm) : undefined,
      bodyFatPct: bodyFatPct ? Number.parseFloat(bodyFatPct) : undefined,
      energyScore,
      stressScore,
      sleepQuality,
      notes: notes.trim() || undefined,
    });
    persist(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const weights = weightTrend(entries);
  const waists = waistTrend(entries);
  const weightDelta =
    weights.length >= 2 ? weights[weights.length - 1].weight - weights[weights.length - 2].weight : null;
  const waistDelta =
    waists.length >= 2 ? waists[waists.length - 1].waist - waists[waists.length - 2].waist : null;

  return (
    <div className="space-y-6">
      {(weights.length > 0 || waists.length > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {weights.length > 0 && (
            <TrendCard
              icon={Scale}
              label={t("checkin.weight")}
              value={`${weights[weights.length - 1].weight} kg`}
              delta={weightDelta}
              t={t}
            />
          )}
          {waists.length > 0 && (
            <TrendCard
              icon={Ruler}
              label={t("checkin.waist")}
              value={`${waists[waists.length - 1].waist} cm`}
              delta={waistDelta}
              t={t}
            />
          )}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5 space-y-4 border border-cyan-500/10"
      >
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">{t("checkin.formTitle")}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t("checkin.weekOf", { date: weekStart })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("checkin.weight")} unit="kg" value={weightKg} onChange={setWeightKg} />
          <Field label={t("checkin.waist")} unit="cm" value={waistCm} onChange={setWaistCm} />
          <Field label={t("checkin.chest")} unit="cm" value={chestCm} onChange={setChestCm} />
          <Field label={t("checkin.bodyFat")} unit="%" value={bodyFatPct} onChange={setBodyFatPct} />
        </div>

        <ScoreSlider label={t("checkin.energy")} value={energyScore} onChange={setEnergyScore} />
        <ScoreSlider label={t("checkin.stress")} value={stressScore} onChange={setStressScore} lowIsGood />
        <ScoreSlider label={t("checkin.sleepQuality")} value={sleepQuality} onChange={setSleepQuality} />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("checkin.notesPlaceholder")}
          rows={3}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/40 resize-none"
        />

        <button
          type="button"
          onClick={handleSave}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500/80 to-emerald-500/80 text-white text-sm font-medium flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saved ? t("checkin.saved") : t("checkin.save")}
        </button>
      </motion.div>

      {entries.length > 1 && (
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            {t("checkin.history")}
          </h3>
          <div className="space-y-2">
            {entries.slice(0, 6).map((entry) => (
              <div key={entry.id} className="glass rounded-xl px-4 py-3 text-sm">
                <p className="text-zinc-400 text-xs mb-1">{entry.weekStart}</p>
                <p className="text-zinc-300">
                  {[
                    entry.weightKg != null ? `${entry.weightKg} kg` : null,
                    entry.waistCm != null ? `${entry.waistCm} cm waist` : null,
                    entry.energyScore != null ? `energy ${entry.energyScore}/10` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || t("checkin.logged")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-zinc-500 mb-1 block">{label}</label>
      <div className="relative">
        <input
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-cyan-500/40 pe-10"
        />
        <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600">{unit}</span>
      </div>
    </div>
  );
}

function ScoreSlider({
  label,
  value,
  onChange,
  lowIsGood,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  lowIsGood?: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-zinc-500">{label}</span>
        <span className="text-cyan-400 font-medium">{value}/10</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number.parseInt(e.target.value, 10))}
        className="w-full accent-cyan-500"
      />
    </div>
  );
}

function TrendCard({
  icon: Icon,
  label,
  value,
  delta,
  t,
}: {
  icon: typeof Scale;
  label: string;
  value: string;
  delta: number | null;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const improved = delta != null && (delta < 0 ? true : delta > 0 ? false : null);
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-cyan-400" />
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <p className="text-lg font-semibold text-zinc-100">{value}</p>
      {delta != null && (
        <p className={`text-xs mt-1 flex items-center gap-1 ${delta === 0 ? "text-zinc-500" : improved ? "text-emerald-400" : "text-amber-400"}`}>
          {delta < 0 ? <TrendingDown className="w-3 h-3" /> : delta > 0 ? <TrendingUp className="w-3 h-3" /> : null}
          {t("checkin.vsLastWeek", { delta: `${delta > 0 ? "+" : ""}${delta.toFixed(1)}` })}
        </p>
      )}
    </div>
  );
}
